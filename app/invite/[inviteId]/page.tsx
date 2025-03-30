'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function AcceptInvite({ params }: { params: { inviteId: string } }) {
  const router = useRouter()

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      alert('You must log in first to accept the invite.')
      router.push('/login') // Redirect to login page
      return
    }

    axios.post('/api/rooms/accept-invite', {
      inviteId: params.inviteId,
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => {
      alert('✅ Invite accepted. Redirecting...')
      router.push(`/chat/${res.data.roomId}`)
    }).catch((err) => {
      console.error('Invite error:', err)
      alert(err.response?.data?.error || 'Invite link is invalid or expired.')
    })
  }, [])

  return (
    <div className="text-center p-10 text-gray-600">
      Accepting invite...
    </div>
  )
}
