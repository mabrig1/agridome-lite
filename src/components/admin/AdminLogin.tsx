'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminLogin({ configured }: { configured: boolean }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: data.get('email'), password: data.get('password') }) })
      if (!response.ok) { const body = await response.json(); setError(body.error ?? 'Unable to sign in.'); setBusy(false); return }
      window.location.replace('/admin')
    } catch { setError('Connect to the internet and try again.'); setBusy(false) }
  }
  return <form onSubmit={login} className="space-y-5">
    {!configured && <p role="status" className="rounded-lg border border-amber-600/40 bg-amber-500/10 p-3 text-sm">Administrator access is awaiting secure setup. Sign-in will be available once the owner’s password has been configured.</p>}
    <div><label htmlFor="admin-email" className="mb-2 block text-sm">Administrator email</label><Input id="admin-email" name="email" type="email" autoComplete="username" maxLength={254} required disabled={!configured || busy} /></div>
    <div><label htmlFor="admin-password" className="mb-2 block text-sm">Password</label><Input id="admin-password" name="password" type="password" autoComplete="current-password" maxLength={256} required disabled={!configured || busy} /></div>
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    <Button variant="gold" className="w-full" disabled={!configured || busy} type="submit">{busy ? 'Signing in…' : 'Open administrator dashboard'}</Button>
    <p className="text-xs text-muted-foreground">Access is limited to the designated administrator. Contact the app owner if your password needs to be reset.</p>
  </form>
}
