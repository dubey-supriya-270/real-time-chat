'use client'
import { useRef, useState } from 'react'
import Webcam from 'react-webcam'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SignupPage() {
  const webcamRef = useRef<Webcam>(null)
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const capture = () => {
    const image = webcamRef.current?.getScreenshot()
    if (image) setImageSrc(image)
  }

  const handleSignup = async () => {
    if (!username || !password || !imageSrc || !email)
      return alert('All fields are required, including selfie!')

    setLoading(true)
    try {
      const res = await axios.post('/api/auth/signup', {
        username,
        password,
        email,
        image: imageSrc,
      })

      sessionStorage.setItem('token', res.data.token)
      sessionStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          🚀 Create Account
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Username"
            className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="rounded-lg overflow-hidden border border-gray-300">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full"
            />
          </div>

          <button
            onClick={capture}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
          >
            📸 Capture Selfie
          </button>

          {imageSrc && (
            <Image
              src={imageSrc}
              alt="Selfie"
              width={160} height={160}
              className="w-28 h-28 object-cover rounded-full mx-auto border mt-2"
            />
          )}

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}
