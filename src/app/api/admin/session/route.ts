import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, PRIVATE_HEADERS, SESSION_COOKIE, SESSION_SECONDS, allowLoginAttempt, createSession, getAdminConfig, isSameOrigin, readSession, verifyCredentials } from '@/lib/server/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS })
}

export async function GET(request: NextRequest) {
  const session = readSession(request.cookies.get(SESSION_COOKIE)?.value)
  return session ? json(session) : json({ error: 'Administrator sign-in required.' }, 401)
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: 'Request origin rejected.' }, 403)
  if (!getAdminConfig()) return json({ error: 'Administrator sign-in is awaiting secure setup.' }, 503)
  // Vercel overwrites x-vercel-forwarded-for. Do not trust a client-supplied generic forwarding header.
  const ip = process.env.VERCEL === '1' ? request.headers.get('x-vercel-forwarded-for') ?? 'unknown' : 'local'
  if (!allowLoginAttempt(ip)) {
    const response = json({ error: 'Too many attempts. Wait one minute and try again.' }, 429)
    response.headers.set('Retry-After', '60')
    return response
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Invalid sign-in request.' }, 415)
  if (Number(request.headers.get('content-length') ?? 0) > 4096) return json({ error: 'Sign-in request is too large.' }, 413)
  let body
  try {
    // Bound actual bytes too; Content-Length alone can be absent or untrusted.
    const reader = request.body?.getReader()
    if (!reader) return json({ error: 'Invalid sign-in request.' }, 400)
    const chunks: Uint8Array[] = []
    let size = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 4096) { await reader.cancel(); return json({ error: 'Sign-in request is too large.' }, 413) }
      chunks.push(value)
    }
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch { return json({ error: 'Invalid sign-in request.' }, 400) }
  if (!body || !await verifyCredentials(body.email, body.password)) return json({ error: 'Email or password is incorrect.' }, 401)
  const response = json({ email: ADMIN_EMAIL, role: 'admin' })
  response.cookies.set(SESSION_COOKIE, createSession(), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: SESSION_SECONDS })
  return response
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: 'Request origin rejected.' }, 403)
  const response = json({ ok: true })
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 })
  return response
}
