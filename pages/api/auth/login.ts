import type { NextApiRequest, NextApiResponse } from 'next'
import { RekognitionClient, SearchFacesByImageCommand } from '@aws-sdk/client-rekognition'
import bcrypt from 'bcryptjs'
import { db } from '../../../lib/db'
import jwt from 'jsonwebtoken'


const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { username, password, image } = req.body
  if (!username || !password || !image) return res.status(400).json({ error: 'Missing fields' })

  try {
    const user = await db.user.findUnique({ where: { username } })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    const command = new SearchFacesByImageCommand({
      CollectionId: process.env.REKOGNITION_COLLECTION_ID!,
      Image: { Bytes: buffer },
      FaceMatchThreshold: 95,
      MaxFaces: 1,
    })

    const result = await rekognition.send(command)
    const matched = result.FaceMatches?.[0]?.Face?.ExternalImageId

    if (matched === user.rekognitionFaceId) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: '2h' }
      )
      
      return res.status(200).json({ message: 'Login successful', token, user: { id: user.id, username: user.username } })
      
    } else {
      return res.status(403).json({ error: 'Face not recognized' })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Login failed' })
  }
}
