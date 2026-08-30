import { Types } from 'mongoose'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/authSession'

export function getRequestUserId(request: NextRequest): string | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = verifySessionToken(token)
  return session?.sub && Types.ObjectId.isValid(session.sub) ? session.sub : null
}

export function unauthorizedIdentityResponse() {
  return Response.json(
    { error: 'Sign in with your verified phone number to continue.' },
    { status: 401 }
  )
}
