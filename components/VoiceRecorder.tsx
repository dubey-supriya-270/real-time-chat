'use client'
import { useState, useRef } from 'react'
import axios from 'axios'

type Props = {
  onTranscript: (text: string) => void
}

export default function VoiceRecorder({ onTranscript }: Props) {
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice.webm')

      const res = await axios.post('/api/speech/transcribe', formData)
      onTranscript(res.data.transcript)

      audioChunksRef.current = []
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div className="mt-4">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded text-white ${recording ? 'bg-red-600' : 'bg-purple-600'}`}
      >
        {recording ? 'Stop Recording' : 'Record Voice'}
      </button>
    </div>
  )
}
