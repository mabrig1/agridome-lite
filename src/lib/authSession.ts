import crypto from 'crypto'

export const SESSION_COOKIE = 'agridome_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

interface SessionPayload {
  sub: string
  iat: number
  exp: number
}

function secret() {
  const value = process.env.AUTH_SESSION_SECRET
  if (!value || value.length < 32) throw new Error('AUTH_SESSION_SECRET must be at least 32 characters')
  return value
}

function sign(value: string) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url')
}

export function createSessionToken(userId: string) {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = { sub: userId, iat: now, exp: now + SESSION_MAX_AGE_SECONDS }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${sign(encoded)}`
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null
  const [encoded, suppliedSignature] = token.split('.')
  if (!encoded || !suppliedSignature) return null

  try {
    const expectedSignature = sign(encoded)
    const supplied = Buffer.from(suppliedSignature)
    const expected = Buffer.from(expectedSignature)
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload
    const now = Math.floor(Date.now() / 1000)
    if (!payload.sub || !payload.exp || payload.exp <= now) return null
    return payload
  } catch {
    return null
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
  priority: 'high' as const,
}
