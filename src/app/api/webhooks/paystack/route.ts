import crypto from 'crypto'
import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export const runtime = 'nodejs'

function validSignature(rawBody: string, suppliedSignature: string | null, secret: string) {
  if (!suppliedSignature) return false
  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  const expectedBuffer = Buffer.from(expected)
  const suppliedBuffer = Buffer.from(suppliedSignature)
  return expectedBuffer.length === suppliedBuffer.length && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)
}

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return Response.json({ error: 'Paystack webhook is not configured.' }, { status: 503 })

  const rawBody = await request.text()
  if (!validSignature(rawBody, request.headers.get('x-paystack-signature'), secret)) {
    return Response.json({ error: 'Invalid signature.' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const data = event?.data ?? {}
  const customerCode = data?.customer?.customer_code ?? data?.customer_code ?? null

  await dbConnect()

  if (event.event === 'subscription.create' && customerCode) {
    await User.findOneAndUpdate(
      { 'subscription.paystackCustomerCode': customerCode },
      {
        $set: {
          'subscription.tier': 'pro',
          'subscription.status': 'active',
          'subscription.renewalDate': data.next_payment_date ? new Date(data.next_payment_date) : null,
        },
      }
    )
  }

  if (['subscription.disable', 'subscription.not_renew'].includes(event.event) && customerCode) {
    await User.findOneAndUpdate(
      { 'subscription.paystackCustomerCode': customerCode },
      {
        $set: {
          'subscription.tier': 'free',
          'subscription.status': event.event === 'subscription.disable' ? 'cancelled' : 'past_due',
          'subscription.renewalDate': null,
        },
      }
    )
  }

  if (event.event === 'charge.success') {
    const userId = data?.metadata?.agridomeUserId
    const isPro = data?.metadata?.product === 'agridome_pro'
    if (userId && isPro) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          'subscription.tier': 'pro',
          'subscription.status': 'active',
          ...(customerCode ? { 'subscription.paystackCustomerCode': customerCode } : {}),
        },
      })
    }
  }

  return Response.json({ received: true })
}
