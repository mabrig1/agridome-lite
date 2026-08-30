import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { getRequestUserId, unauthorizedIdentityResponse } from '@/lib/requestUser'
import User from '@/models/User'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const userId = getRequestUserId(request)
  if (!userId) return unauthorizedIdentityResponse()

  await dbConnect()
  const user: any = await User.findById(userId).lean()
  if (!user) return unauthorizedIdentityResponse()

  return Response.json({
    user: {
      id: String(user._id),
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      cooperativeId: user.cooperativeId ? String(user.cooperativeId) : null,
      subscription: user.subscription,
    },
  })
}
