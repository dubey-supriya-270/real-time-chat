// lib/axios.ts
import axios from 'axios'

const baseURL =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || `http://localhost:3000`
    : window.location.origin

const api = axios.create({
  baseURL,
  withCredentials: true, // optional if you’re handling cookies
})

export default api
