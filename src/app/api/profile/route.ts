import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { getRequestUserId, unauthorizedIdentityResponse } from '@/lib/requestUser'
import User from '@/models/User'

export const runtime = 'nodejs'

const LANGUAGES = new Set(['en', 'ha', 'sw', 'fr'])

export async function PATCH(request: NextRequest) {
  const userId = getRequestUserId(request)
  if (!userId) return unauthorizedIdentityResponse()

  const body = await request.json()
  const update: Record<string, unknown> = {}

  if (body.name !== undefined) {
    const name = String(body.name).trim().slice(0, 120)
    if (!name) return Response.json({ error: 'Name cannot be empty.' }, { status: 400 })
    update.name = name
  }

  if (body.email !== undefined) {
    const email = String(body.email ?? '').trim().toLowerCase()
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }
    update.email = email || null
  }

  if (body.preferredLanguage !== undefined) {
    const preferredLanguage = String(body.preferredLanguage)
    if (!LANGUAGES.has(preferredLanguage)) {
      return Response.json({ error: 'Unsupported language.' }, { status: 400 })
    }
    update.preferredLanguage = preferredLanguage
  }

  if (!Object.keys(update).length) {
    return Response.json({ error: 'No profile changes were provided.' }, { status: 400 })
  }

  await dbConnect()
  const user: any = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).lean()
  if (!user) return Response.json({ error: 'User not found.' }, { status: 404 })

  return Response.json({
    user: {
      id: String(user._id),
      name: user.name,
      phone: user.phone,
      email: user.email ?? null,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      subscription: user.subscription,
    },
  })
}
