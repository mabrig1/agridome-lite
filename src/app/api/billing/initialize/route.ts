import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { getRequestUserId, unauthorizedIdentityResponse } from '@/lib/requestUser'
import User from '@/models/User'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const userId = getRequestUserId(request)
  if (!userId) return unauthorizedIdentityResponse()

  const secret = process.env.PAYSTACK_SECRET_KEY
  const plan = process.env.PAYSTACK_PRO_PLAN_CODE
  const amount = process.env.PAYSTACK_PRO_AMOUNT_SUBUNIT
  if (!secret || !plan || !amount) {
    return Response.json({ error: 'Paystack Pro billing is not configured.' }, { status: 503 })
  }

  await dbConnect()
  const user: any = await User.findById(userId).lean()
  if (!user) return Response.json({ error: 'User not found.' }, { status: 404 })
  if (!user.email) {
    return Response.json({ error: 'Add a billing email before upgrading to Pro.' }, { status: 400 })
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: user.email,
      amount,
      plan,
      callback_url: `${origin}/farm-dashboard?billing=success`,
      metadata: JSON.stringify({
        agridomeUserId: String(user._id),
        product: 'agridome_pro',
      }),
    }),
  })

  const payload = await response.json()
  if (!response.ok || !payload?.status) {
    return Response.json({ error: payload?.message || 'Unable to initialize Paystack checkout.' }, { status: 502 })
  }

  return Response.json({
    authorizationUrl: payload.data.authorization_url,
    accessCode: payload.data.access_code,
    reference: payload.data.reference,
  })
}
