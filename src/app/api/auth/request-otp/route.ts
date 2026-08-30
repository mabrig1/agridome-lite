import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { normalizePhone, sendOtp } from '@/lib/phoneAuth'
import AuthChallenge from '@/models/AuthChallenge'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const phone = normalizePhone(body.phone)
    const name = String(body.name ?? '').trim().slice(0, 120)

    await dbConnect()

    const oneMinuteAgo = new Date(Date.now() - 60_000)
    const recent = await AuthChallenge.findOne({
      phone: phone.digits,
      createdAt: { $gte: oneMinuteAgo },
    })
      .sort({ createdAt: -1 })
      .lean()

    if (recent) {
      return Response.json(
        { error: 'A verification code was sent recently. Try again after one minute.' },
        { status: 429 }
      )
    }

    const delivery = await sendOtp(phone)
    const challenge = await AuthChallenge.create({
      phone: phone.digits,
      name,
      provider: delivery.provider,
      providerChallengeId: delivery.providerChallengeId,
      expiresAt: new Date(Date.now() + 5 * 60_000),
    })

    return Response.json({
      challengeId: String(challenge._id),
      expiresInSeconds: 300,
      destination: `${phone.e164.slice(0, 5)}••••${phone.e164.slice(-3)}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send verification code'
    const isInputError = /phone|required|valid international/i.test(message)
    return Response.json(
      { error: isInputError ? message : 'Unable to send verification code. Please try again.' },
      { status: isInputError ? 400 : 502 }
    )
  }
}
