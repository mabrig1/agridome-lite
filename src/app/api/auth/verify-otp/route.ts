import { Types } from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/authSession'
import { verifyOtp } from '@/lib/phoneAuth'
import AuthChallenge from '@/models/AuthChallenge'
import User from '@/models/User'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const challengeId = String(body.challengeId ?? '')
  const code = String(body.code ?? '').trim()

  if (!Types.ObjectId.isValid(challengeId) || !/^\d{4,8}$/.test(code)) {
    return NextResponse.json({ error: 'Enter a valid verification code.' }, { status: 400 })
  }

  await dbConnect()
  const challenge: any = await AuthChallenge.findById(challengeId)
  if (!challenge || challenge.verifiedAt || new Date(challenge.expiresAt).getTime() <= Date.now()) {
    return NextResponse.json({ error: 'This verification request has expired. Request a new code.' }, { status: 410 })
  }

  let verified = false
  try {
    verified = await verifyOtp(
      challenge.provider,
      challenge.providerChallengeId,
      `+${challenge.phone}`,
      code
    )
  } catch {
    verified = false
  }

  if (!verified) {
    return NextResponse.json({ error: 'The verification code is incorrect or expired.' }, { status: 401 })
  }

  challenge.verifiedAt = new Date()
  await challenge.save()

  const user: any = await User.findOneAndUpdate(
    { phone: challenge.phone },
    {
      $setOnInsert: {
        phone: challenge.phone,
        name: challenge.name || 'Farmer',
        role: 'farmer',
        preferredLanguage: 'en',
      },
      ...(challenge.name ? { $set: { name: challenge.name } } : {}),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  const response = NextResponse.json({
    user: {
      id: String(user._id),
      name: user.name,
      phone: user.phone,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      subscription: user.subscription,
    },
  })
  response.cookies.set(SESSION_COOKIE, createSessionToken(String(user._id)), sessionCookieOptions)
  return response
}
