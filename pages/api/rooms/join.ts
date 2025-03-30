import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'
import { v4 as uuidv4 } from 'uuid'
import { verifyToken } from '@/lib/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { roomId } = req.body

  const token = req.headers.authorization?.split(' ')[1]
  const decoded = token ? verifyToken(token) : null
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })

  const userId = decoded.id

  try {
    const room = await db.chatRoom.findUnique({ where: { id: roomId } })
    if (!room) return res.status(404).json({ error: 'Room not found' })

    const memberId = uuidv4()
    await db.roomMember.create({
      data: {
        id: memberId,
        roomId,
        userId, // ✅ use the actual logged-in user ID
      },
    })

    return res.status(200).json({ message: 'Joined room' })
  } catch (err) {
    console.error('Join room error:', err)
    return res.status(500).json({ error: 'Failed to join room' })
  }
}
