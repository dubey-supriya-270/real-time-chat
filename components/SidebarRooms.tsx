'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Room = {
  id: string
  name: string
}

export default function SidebarRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) return

    fetch('/api/rooms', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error('Fetch rooms error', err))
  }, [])

  return (
    <div className="flex flex-col text-white">
      <h2 className="text-xl font-semibold px-4 py-3 border-b border-gray-700">Chats</h2>
      {rooms.map((room) => (
        <Link key={room.id} href={`/chat/${room.id}`} passHref>
          <div
            onClick={() => setSelectedRoomId(room.id)}
            className={`px-4 py-3 cursor-pointer hover:bg-gray-800 ${
              selectedRoomId === room.id ? 'bg-gray-800' : ''
            }`}
          >
            {room.name}
          </div>
        </Link>
      ))}
    </div>
  )
}
