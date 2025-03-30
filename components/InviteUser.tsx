'use client'

import { useState } from 'react'
import api from '@/lib/axios'

type Props = {
  roomId: string
}

export default function InviteUser({ roomId }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleInvite = async () => {
    if (!email) return alert('Please enter an email')

    setLoading(true)
    setMessage(null)

    try {
      const token = sessionStorage.getItem('token')
      await api.post(
        '/api/rooms/invite-link',
        { roomId, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setMessage('✅ Invite sent successfully!')
      setEmail('')
    } catch (err) {
      console.error(err)
      setMessage('❌ Failed to send invite.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border p-4 rounded-lg shadow mt-16 max-w-md bg-white">
  <h3 className="text-lg font-semibold mb-3 text-gray-800">Invite a User</h3>

  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter user's email"
    className="border px-3 py-2 rounded w-full mb-[10px] text-gray-800 placeholder-gray-400 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  <button
    onClick={handleInvite}
    disabled={loading}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition disabled:opacity-60"
  >
    {loading ? 'Sending...' : 'Send Invite'}
  </button>

  {message && (
    <p className="mt-3 text-sm text-center text-gray-700">{message}</p>
  )}
</div>
  )
}
