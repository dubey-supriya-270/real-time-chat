// pages/api/rooms/invite-link.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { verifyToken } from '@/lib/jwt'
import nodemailer from 'nodemailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.headers.authorization?.split(' ')[1]
  const decoded = token ? verifyToken(token) : null
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })

  const { roomId, email } = req.body

  try {
    const room = await db.chatRoom.findUnique({ where: { id: roomId } })
    if (!room) return res.status(404).json({ error: 'Room not found' })

    const inviteToken = uuidv4()

    // Store invite (optional, if you want to track usage)
    await db.invite.create({
      data: {
        id: inviteToken,
        roomId,
        email,
      },
    })

    const inviteLink = `${process.env.BASE_URL}/join?token=${inviteToken}`

    // Send email with nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or SES, Mailgun, etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Chat Invite',
      html: `<p>You have been invited to join a chat room.</p><p><a href="${inviteLink}">Click here to join</a></p>`
    })

    return res.status(200).json({ message: 'Invite sent successfully' })
  } catch (err) {
    console.error('Invite error:', err)
    return res.status(500).json({ error: 'Failed to send invite' })
  }
}
