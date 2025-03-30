// pages/api/rooms/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1]
  const decoded = token ? verifyToken(token) : null
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })

  const userId = decoded.id

  try {
    const memberships = await db.roomMember.findMany({
      where: { userId },
      include: {
        room: true,
      },
    })

    const rooms = memberships.map((m) => m.room)
    return res.status(200).json(rooms)
  } catch (err) {
    console.error('Room fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch rooms' })
  }
}
