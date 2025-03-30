import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roomId } = req.query

  try {
    const messages = await db.message.findMany({
      where: { roomId: roomId as string },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            username: true, // ✅ Only fetch the username
          },
        },
      },
    })
    

    res.status(200).json(messages)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
}
