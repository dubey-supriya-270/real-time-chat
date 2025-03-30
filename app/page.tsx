'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-3xl font-bold">🧠 Real-Time Chat App</h1>
      <p className="text-gray-600">Secure login, live chat, and speech-to-text 🚀</p>

      <div className="flex gap-4">
        <Link href="/signup">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Sign Up</button>
        </Link>
        <Link href="/login">
          <button className="bg-green-600 text-white px-4 py-2 rounded">Log In</button>
        </Link>
      </div>
    </main>
  )
}
