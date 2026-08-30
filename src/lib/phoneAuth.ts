export type OtpProvider = 'termii' | 'twilio'

export function normalizePhone(input: string) {
  const raw = String(input ?? '').trim().replace(/[\s()-]/g, '')
  if (!raw) throw new Error('Phone number is required')

  let digits = raw.replace(/^\+/, '').replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 11) digits = `234${digits.slice(1)}`
  if (digits.length < 10 || digits.length > 15) throw new Error('Enter a valid international phone number')

  return { digits, e164: `+${digits}` }
}

function twilioAuthHeader() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) throw new Error('Twilio credentials are not configured')
  return `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`
}

export function configuredOtpProvider(): OtpProvider | null {
  if (process.env.TERMII_API_KEY && process.env.TERMII_BASE_URL && process.env.TERMII_SENDER_ID) return 'termii'
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID) return 'twilio'
  return null
}

export async function sendOtp(phone: ReturnType<typeof normalizePhone>) {
  const provider = configuredOtpProvider()
  if (!provider) throw new Error('No OTP provider is configured')

  if (provider === 'termii') {
    const baseUrl = String(process.env.TERMII_BASE_URL).replace(/\/$/, '')
    const response = await fetch(`${baseUrl}/api/sms/otp/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TERMII_API_KEY,
        message_type: 'NUMERIC',
        to: phone.digits,
        from: process.env.TERMII_SENDER_ID,
        channel: process.env.TERMII_CHANNEL || 'generic',
        pin_attempts: 5,
        pin_time_to_live: 5,
        pin_length: 6,
        pin_placeholder: '< 123456 >',
        message_text: 'Your AgriDome Lite verification code is < 123456 >. It expires in 5 minutes.',
        pin_type: 'NUMERIC',
      }),
    })
    const payload = await response.json()
    const providerChallengeId = payload.pin_id || payload.pinId
    if (!response.ok || !providerChallengeId) throw new Error(payload.message || 'Termii could not send the verification code')
    return { provider, providerChallengeId: String(providerChallengeId) }
  }

  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID as string
  const body = new URLSearchParams({ To: phone.e164, Channel: 'sms' })
  const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
    method: 'POST',
    headers: {
      Authorization: twilioAuthHeader(),
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  const payload = await response.json()
  if (!response.ok || !payload.sid) throw new Error(payload.message || 'Twilio could not send the verification code')
  return { provider, providerChallengeId: phone.e164 }
}

export async function verifyOtp(provider: OtpProvider, providerChallengeId: string, phone: string, code: string) {
  if (provider === 'termii') {
    const baseUrl = String(process.env.TERMII_BASE_URL).replace(/\/$/, '')
    const response = await fetch(`${baseUrl}/api/sms/otp/verify`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TERMII_API_KEY,
        pin_id: providerChallengeId,
        pin: code,
      }),
    })
    const payload = await response.json()
    return response.ok && String(payload.verified).toLowerCase() === 'true'
  }

  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID
  if (!serviceSid) return false
  const body = new URLSearchParams({ To: phone, Code: code })
  const response = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`, {
    method: 'POST',
    headers: {
      Authorization: twilioAuthHeader(),
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  const payload = await response.json()
  return response.ok && payload.status === 'approved'
}
