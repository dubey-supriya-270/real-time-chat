// components/JoinRoomClient.tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function JoinRoomClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('Joining Room...')

  useEffect(() => {
    const token = searchParams?.get('token')
    const authToken = sessionStorage.getItem('token')

    if (!token) {
      setStatus('❌ Invite token is missing.')
      return
    }

    if (!authToken) {
      setStatus('⚠️ Please login first to accept the invite.')
      router.push('/login')
      return
    }

    axios
      .post('/api/rooms/accept-invite', { inviteId: token }, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      .then((res) => {
        const roomId = res.data.roomId
        router.push(`/chat/${roomId}`)
      })
      .catch(() => {
        setStatus('❌ Invite link is invalid or expired.')
      })
  }, [router, searchParams])

  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-700">
      <h1 className="text-xl font-semibold">{status}</h1>
    </div>
  )
}
