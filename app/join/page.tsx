'use client'

import { Suspense } from 'react'
import JoinRoomClient from '@/components/JoinRoomClient'

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading invite...</div>}>
      <JoinRoomClient />
    </Suspense>
  )
}
