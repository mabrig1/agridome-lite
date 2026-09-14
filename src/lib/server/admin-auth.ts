import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

export const ADMIN_EMAIL = 'victoryonline1@gmail.com'
export const SESSION_COOKIE = 'agridome_admin_session'
export const SESSION_SECONDS = 60 * 60 * 2
export const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'Vary': 'Cookie', 'X-Robots-Tag': 'noindex, nofollow' }

type Config = { passwordHash: string; secret: string }
export type AdminSession = { email: string; role: 'admin'; expiresAt: number }

export function getAdminConfig(): Config | null {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? ''
  const secret = process.env.ADMIN_SESSION_SECRET ?? ''
  if (!/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash) || secret.length < 32) return null
  return { passwordHash, secret }
}

async function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key)))
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 16 || password.length > 256) throw new Error('Use a password between 16 and 256 characters.')
  const salt = randomBytes(16).toString('hex')
  return `scrypt:${salt}:${(await derive(password, salt)).toString('hex')}`
}

export async function verifyCredentials(email: unknown, password: unknown): Promise<boolean> {
  const config = getAdminConfig()
  if (!config || typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 256 || password.length < 16) return false
  const [, salt, expected] = config.passwordHash.split(':')
  const actual = await derive(password, salt)
  return timingSafeEqual(actual, Buffer.from(expected, 'hex')) && email.trim().toLowerCase() === ADMIN_EMAIL
}

function signature(payload: string, config: Config) {
  // Including the password hash immediately revokes old sessions after a password reset.
  return createHmac('sha256', config.secret).update(`${config.passwordHash}:${payload}`).digest('base64url')
}

export function createSession(now = Date.now()): string {
  const config = getAdminConfig()
  if (!config) throw new Error('Administrator access has not been configured.')
  const payload = Buffer.from(JSON.stringify({ email: ADMIN_EMAIL, role: 'admin', expiresAt: now + SESSION_SECONDS * 1000, nonce: randomBytes(16).toString('hex') })).toString('base64url')
  return `${payload}.${signature(payload, config)}`
}

export function readSession(token: string | undefined, now = Date.now()): AdminSession | null {
  const config = getAdminConfig()
  if (!config || !token || token.length > 2048) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, supplied] = parts
  const expected = signature(payload, config)
  if (!/^[A-Za-z0-9_-]{43}$/.test(supplied) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (session.email !== ADMIN_EMAIL || session.role !== 'admin' || !Number.isSafeInteger(session.expiresAt) || session.expiresAt <= now || session.expiresAt > now + SESSION_SECONDS * 1000) return null
    return { email: session.email, role: 'admin', expiresAt: session.expiresAt }
  } catch { return null }
}

export function isSameOrigin(request: Request): boolean {
  const url = new URL(request.url)
  // Next.js can normalise a loopback hostname in request.url. The Host header
  // preserves the browser-facing host; never use a client-supplied forwarded host.
  const host = request.headers.get('host') || url.host
  return request.headers.get('origin') === `${url.protocol}//${host}`
}

// A bounded per-instance safeguard; strong generated passwords remain essential on serverless.
const attempts = new Map<string, { count: number; expires: number }>()
export function allowLoginAttempt(key: string, now = Date.now()): boolean {
  attempts.forEach((attempt, id) => { if (attempt.expires <= now) attempts.delete(id) })
  const current = attempts.get(key)
  if (current) { current.count += 1; return current.count <= 5 }
  if (attempts.size >= 1000) return false
  attempts.set(key, { count: 1, expires: now + 60_000 })
  return true
}
