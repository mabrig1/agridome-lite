import assert from 'node:assert/strict'
import { before, test } from 'node:test'
import { NextRequest } from 'next/server'
import { ADMIN_EMAIL, SESSION_COOKIE, SESSION_SECONDS, allowLoginAttempt, createSession, getAdminConfig, hashPassword, isSameOrigin, readSession, verifyCredentials } from '../src/lib/server/admin-auth'
import { GET, POST, DELETE } from '../src/app/api/admin/session/route'

const password = 'TEST-ONLY-password-with-strong-length-123'
const secret = 'TEST-ONLY-session-secret-with-more-than-32-characters'
let hash: string
before(async () => {
  hash = await hashPassword(password)
  process.env.ADMIN_PASSWORD_HASH = hash
  process.env.ADMIN_SESSION_SECRET = secret
})

test('only the configured administrator and correct password authenticate', async () => {
  assert.equal(await verifyCredentials(ADMIN_EMAIL.toUpperCase(), password), true)
  assert.equal(await verifyCredentials('someone@example.com', password), false)
  assert.equal(await verifyCredentials(ADMIN_EMAIL, 'wrong-password-with-sufficient-length'), false)
  assert.equal(await verifyCredentials(ADMIN_EMAIL, ''), false)
  assert.equal(await verifyCredentials(ADMIN_EMAIL, 'x'.repeat(257)), false)
})

test('sessions reject forgery, malformed values and expired cookies', () => {
  const now = Date.now()
  const token = createSession(now)
  assert.equal(readSession(token, now)?.email, ADMIN_EMAIL)
  const [payload, signature] = token.split('.')
  const changed = Buffer.from(JSON.stringify({ email: 'other@example.com', role: 'admin', expiresAt: now + 1000 })).toString('base64url')
  assert.equal(readSession(`${changed}.${signature}`, now), null)
  assert.equal(readSession(`${payload}.invalid`, now), null)
  assert.equal(readSession(`${payload}.${'é'.repeat(43)}`, now), null)
  assert.equal(readSession(token + '.extra', now), null)
  assert.equal(readSession(token, now + SESSION_SECONDS * 1000), null)
  assert.equal(readSession(undefined), null)
})

test('configuration fails closed and password rotation revokes sessions', () => {
  const token = createSession()
  process.env.ADMIN_PASSWORD_HASH = ''
  assert.equal(getAdminConfig(), null)
  assert.equal(readSession(token), null)
  assert.throws(() => createSession())
  process.env.ADMIN_PASSWORD_HASH = hash.replace(/.$/, hash.endsWith('0') ? '1' : '0')
  assert.equal(readSession(token), null)
  process.env.ADMIN_PASSWORD_HASH = hash
  process.env.ADMIN_SESSION_SECRET = 'short'
  assert.equal(readSession(token), null)
  process.env.ADMIN_SESSION_SECRET = secret
})

test('login throttling recovers after the window and rejects excess requests', () => {
  for (let i = 0; i < 5; i++) assert.equal(allowLoginAttempt('unit-test-key', 100), true)
  assert.equal(allowLoginAttempt('unit-test-key', 100), false)
  assert.equal(allowLoginAttempt('unit-test-key', 60101), true)
})

test('state-changing requests require the same origin', () => {
  assert.equal(isSameOrigin(new Request('http://localhost:3107/api/admin/session', { headers: { origin: 'http://127.0.0.1:3107', host: '127.0.0.1:3107' } })), true)
  assert.equal(isSameOrigin(new Request('https://farm.example/api/admin/session', { headers: { origin: 'https://farm.example' } })), true)
  assert.equal(isSameOrigin(new Request('https://farm.example/api/admin/session', { headers: { origin: 'https://attacker.example' } })), false)
  assert.equal(isSameOrigin(new Request('https://farm.example/api/admin/session')), false)
})

function request(method: string, body?: unknown, origin = 'https://farm.example', cookie?: string) {
  return new NextRequest('https://farm.example/api/admin/session', { method, headers: { origin, 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) })
}

test('session endpoints enforce credentials, private caching, secure cookies and logout', async () => {
  const anonymous = await GET(request('GET'))
  assert.equal(anonymous.status, 401)
  assert.match(anonymous.headers.get('cache-control')!, /no-store/)
  assert.equal((await POST(request('POST', { email: ADMIN_EMAIL, password }, 'https://attacker.example'))).status, 403)
  assert.equal((await POST(request('POST', { email: 'other@example.com', password }))).status, 401)
  const response = await POST(request('POST', { email: ADMIN_EMAIL, password }))
  assert.equal(response.status, 200)
  const cookie = response.headers.get('set-cookie')!
  assert.match(cookie, /HttpOnly/i)
  assert.match(cookie, /SameSite=strict/i)
  const authenticated = await GET(request('GET', undefined, undefined, cookie.split(';')[0]))
  assert.equal(authenticated.status, 200)
  assert.equal((await authenticated.json()).role, 'admin')
  assert.equal((await DELETE(request('DELETE', undefined, 'https://attacker.example'))).status, 403)
  const logout = await DELETE(request('DELETE'))
  assert.match(logout.headers.get('set-cookie')!, /Max-Age=0/i)
  assert.equal((await GET(request('GET', undefined, undefined, `${SESSION_COOKIE}=`))).status, 401)
})

test('missing setup returns a service error, never an administrator session', async () => {
  process.env.ADMIN_PASSWORD_HASH = ''
  const response = await POST(request('POST', { email: ADMIN_EMAIL, password }))
  assert.equal(response.status, 503)
  assert.equal(response.headers.get('set-cookie'), null)
  process.env.ADMIN_PASSWORD_HASH = hash
})
