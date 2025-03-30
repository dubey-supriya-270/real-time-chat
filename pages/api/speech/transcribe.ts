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
import * as path from 'path'
import multer from 'multer'

// Multer setup
const upload = multer({ dest: '/tmp' })

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
}

// Middleware wrapper
function runMiddleware(req: any, res: any, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result)
      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest & { file?: any }, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  try {
    // Parse audio file
    await runMiddleware(req, res, upload.single('audio'))

    const filePath = (req as any).file.path
    const fileName = `${uuidv4()}.webm`

    const REGION = process.env.AWS_REGION || 'us-east-1'
    const BUCKET = process.env.AWS_TRANSCRIBE_BUCKET || 'your-bucket-name'

    const s3 = new S3Client({ region: REGION })
    const transcribe = new TranscribeClient({ region: REGION })

    // Upload audio file to S3
    const fileStream = fs.createReadStream(filePath)
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileName,
      Body: fileStream,
      ContentType: 'audio/webm',
    }))

    const mediaUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${fileName}`
    const jobName = `job-${uuidv4()}`

    // Start transcription job
    await transcribe.send(new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      Media: { MediaFileUri: mediaUrl },
      MediaFormat: 'webm',
      LanguageCode: 'en-US',
      OutputBucketName: BUCKET,
    }))

    // Poll for completion
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

    // Generate signed URL and fetch transcript JSON
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: transcriptKey }),
      { expiresIn: 60 }
    )

    const response = await fetch(signedUrl)
    if (!response.ok) {
      const text = await response.text()
      console.error("Transcript fetch failed:", text)
      throw new Error('Transcript not ready or access denied')
    }

    const json = await response.json()
    const transcript = json.results.transcripts[0]?.transcript || ''

    fs.unlinkSync(filePath) // cleanup

    return res.status(200).json({ transcript })
  } catch (err) {
    console.error('Transcribe error:', err)
    return res.status(500).json({ error: 'Transcription failed' })
  }
}
