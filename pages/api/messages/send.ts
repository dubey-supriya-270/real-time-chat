import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'
import { verifyToken } from '../../../lib/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.headers.authorization?.split(' ')[1]
  const decoded = token ? verifyToken(token) : null

  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })

  const { text, roomId } = req.body as { text: string; roomId: string }

  try {
    await db.message.create({
      data: {
        text,
        roomId,
        senderId: decoded.id,
      },
    })

    res.status(200).json({ message: 'Message saved' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save message' })
  }
}
