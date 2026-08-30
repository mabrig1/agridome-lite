'use client'

import { FormEvent, useState } from 'react'
import { KeyRound, Loader2, Phone } from 'lucide-react'

interface PhoneAuthPanelProps {
  onAuthenticated: () => void | Promise<void>
}

export default function PhoneAuthPanel({ onAuthenticated }: PhoneAuthPanelProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [destination, setDestination] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function requestCode(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to send verification code')
      setChallengeId(payload.challengeId)
      setDestination(payload.destination || phone)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to send verification code')
    } finally {
      setBusy(false)
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ challengeId, code }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Verification failed')
      await onAuthenticated()
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'Verification failed')
    } finally {
      setBusy(false)
    }
  }

  if (challengeId) {
    return (
      <form onSubmit={verifyCode} className="rounded-xl border border-gold/40 bg-card p-4">
        <div className="flex items-center gap-2 font-semibold"><KeyRound className="h-5 w-5 text-gold" /> Verify your phone</div>
        <p className="mt-2 text-sm text-muted-foreground">Enter the code sent to {destination}.</p>
        <input
          value={code}
          onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 8))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code"
          className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-3 text-lg tracking-[0.25em]"
          required
        />
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
        <button disabled={busy || code.length < 4} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-semibold text-black disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Verify & sign in
        </button>
        <button type="button" onClick={() => { setChallengeId(''); setCode(''); setError('') }} className="mt-2 w-full py-2 text-sm text-muted-foreground">Use another number</button>
      </form>
    )
  }

  return (
    <form onSubmit={requestCode} className="rounded-xl border border-gold/40 bg-card p-4">
      <div className="flex items-center gap-2 font-semibold"><Phone className="h-5 w-5 text-gold" /> Sign in to cloud sync</div>
      <p className="mt-2 text-sm text-muted-foreground">Use your phone number to protect farm records and sync them across devices.</p>
      <input value={name} onChange={event => setName(event.target.value)} placeholder="Your name" autoComplete="name" className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-3" />
      <input value={phone} onChange={event => setPhone(event.target.value)} placeholder="080… or +234…" inputMode="tel" autoComplete="tel" className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3" required />
      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      <button disabled={busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-semibold text-black disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Send verification code
      </button>
      <p className="mt-3 text-xs text-muted-foreground">Standard SMS charges may apply. Codes expire after 5 minutes.</p>
    </form>
  )
}
