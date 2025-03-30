import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'
import { v4 as uuidv4 } from 'uuid'
import { verifyToken } from '@/lib/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name } = req.body

  const token = req.headers.authorization?.split(' ')[1]
const decoded = token ? verifyToken(token) : null
if (!decoded) return res.status(401).json({ error: 'Unauthorized' })

const createdBy = decoded.id



  try {
    const room = await db.chatRoom.create({
      data: {
        id: uuidv4(),
        name,
        createdBy,
      },
    })
    return res.status(200).json({ roomId: room.id })
  } catch (error) {
    console.error('Create room error:', error)
    return res.status(500).json({ error: 'Room creation failed' })
  }
}
