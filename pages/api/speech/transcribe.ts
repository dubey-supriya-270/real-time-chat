import type { NextApiRequest, NextApiResponse } from 'next'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import {
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
  TranscribeClient,
} from '@aws-sdk/client-transcribe'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import multer from 'multer'
import type { Request, Response, NextFunction } from 'express'

// Multer setup
const upload = multer({ dest: '/tmp' })


export const config = {
  api: {
    bodyParser: false,
  },
}

// Safe middleware wrapper with proper types
function multerMiddleware(
  handler: (req: Request, res: Response, next: NextFunction) => void
) {
  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise<void>((resolve, reject) => {
      handler(req as unknown as Request, res as unknown as Response, (err: unknown) => {
        if (err) return reject(err)
        resolve()
      })
    })
}


// Extend request type for file
interface FileRequest extends NextApiRequest {
  file?: Express.Multer.File
}

export default async function handler(req: FileRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  try {
    await multerMiddleware(upload.single('audio'))(req, res)

    const filePath = req.file?.path
    if (!filePath) return res.status(400).json({ error: 'No audio file found' })

    const fileName = `${uuidv4()}.webm`
    const REGION = process.env.AWS_REGION || 'us-east-1'
    const BUCKET = process.env.AWS_TRANSCRIBE_BUCKET || 'your-bucket-name'

    const s3 = new S3Client({ region: REGION })
    const transcribe = new TranscribeClient({ region: REGION })

    const fileStream = fs.createReadStream(filePath)
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileName,
      Body: fileStream,
      ContentType: 'audio/webm',
    }))

    const mediaUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${fileName}`
    const jobName = `job-${uuidv4()}`

    await transcribe.send(new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      Media: { MediaFileUri: mediaUrl },
      MediaFormat: 'webm',
      LanguageCode: 'en-US',
      OutputBucketName: BUCKET,
    }))

    let transcriptKey = ''
    for (let i = 0; i < 10; i++) {
      const { TranscriptionJob } = await transcribe.send(new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName,
      }))

      if (TranscriptionJob?.TranscriptionJobStatus === 'COMPLETED') {
        const transcriptUrl = TranscriptionJob.Transcript?.TranscriptFileUri || ''
        const url = new URL(transcriptUrl)
        const pathParts = url.pathname.split('/')
        transcriptKey = decodeURIComponent(pathParts[pathParts.length - 1])
        break
      }

      if (TranscriptionJob?.TranscriptionJobStatus === 'FAILED') {
        throw new Error('Transcription failed')
      }

      await new Promise((r) => setTimeout(r, 2000))
    }

    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: transcriptKey }),
      { expiresIn: 60 }
    )

    const response = await fetch(signedUrl)
    if (!response.ok) {
      const text = await response.text()
      console.error('Transcript fetch failed:', text)
      throw new Error('Transcript not ready or access denied')
    }

    const json = await response.json()
    const transcript = json.results.transcripts[0]?.transcript || ''

    fs.unlinkSync(filePath)

    return res.status(200).json({ transcript })
  } catch (err) {
    console.error('Transcribe error:', err)
    return res.status(500).json({ error: 'Transcription failed' })
  }
}
