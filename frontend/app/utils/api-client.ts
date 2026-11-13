export const AUTH_TOKEN_KEY = 'inktatto-access-token'

export interface ApiUser {
  id: number
  email: string
  fullName: string
  role: 'user' | 'admin'
}

export interface ApiBooking {
  id: number
  artist: string
  date: string
  time: string
  bodyArea: string
  size: string
  idea: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
  user?: ApiUser
}

export function normalizeApiError(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message
    if (Array.isArray(message)) return message.filter((item) => typeof item === 'string').join(' ')
    if (typeof message === 'string') return message
  }
  return fallback
}
