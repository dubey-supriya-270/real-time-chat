'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

type Props = {
  inviteId: string
}

export default function AcceptInviteClient({ inviteId }: Props) {
  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      alert('You must log in first to accept the invite.')
      router.push('/login')
      return
    }

    axios
      .post(
        '/api/rooms/accept-invite',
        { inviteId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        alert('✅ Invite accepted. Redirecting...')
        router.push(`/chat/${res.data.roomId}`)
      })
      .catch((err) => {
        console.error('Invite error:', err)
        alert(err.response?.data?.error || 'Invite link is invalid or expired.')
      })
  }, [inviteId, router])

  return (
    <div className="text-center p-10 text-gray-600">
      Accepting invite...
    </div>
  )
}
