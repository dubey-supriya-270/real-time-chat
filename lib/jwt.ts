// lib/jwt.ts
import jwt, { JwtPayload } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }) // or '1h'
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (typeof decoded === 'string') return null // ignore plain string tokens
    return decoded
  } catch {
    return null
  }
}
