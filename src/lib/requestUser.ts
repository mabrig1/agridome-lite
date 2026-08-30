import { Types } from 'mongoose'
import type { NextRequest } from 'next/server'

/**
 * Temporary identity adapter for the productionization branch.
 * It keeps route ownership checks centralized until verified OTP/session auth is wired in.
 * Never expose these APIs publicly without replacing this header with a verified session.
 */
export function getRequestUserId(request: NextRequest): string | null {
  const value = request.headers.get('x-agridome-user-id')?.trim()
  return value && Types.ObjectId.isValid(value) ? value : null
}

export function unauthorizedIdentityResponse() {
  return Response.json(
    { error: 'Verified user context is required.' },
    { status: 401 }
  )
}
