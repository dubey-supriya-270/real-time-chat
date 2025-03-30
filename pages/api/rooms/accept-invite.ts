import { db } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.headers.authorization?.split(' ')[1]
  const decoded = token ? verifyToken(token) : null
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })

  const { inviteId } = req.body
  if (!inviteId) return res.status(400).json({ error: 'Missing invite ID' })

  const invite = await db.invite.findUnique({
    where: { id: inviteId },
  })

  if (!invite) return res.status(404).json({ error: 'Invite not found or expired' })

  // Add user to room
  const userId = decoded.id

  await db.roomMember.upsert({
    where: {
      userId_roomId: {
        userId,
        roomId: invite.roomId
      }
    },
    update: {},
    create: {
      userId,
      roomId: invite.roomId
    }
  })

  return res.status(200).json({ roomId: invite.roomId })
}
