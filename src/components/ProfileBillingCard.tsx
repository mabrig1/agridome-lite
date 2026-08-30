'use client'

import { FormEvent, useState } from 'react'
import { Mail, Pencil, Save, X } from 'lucide-react'
import type { SupportedLanguage } from '@/lib/i18n'

interface UserProfile {
  name: string
  email?: string | null
  preferredLanguage: SupportedLanguage
}

interface Props {
  user: UserProfile
  onUpdated: () => void | Promise<void>
}

export default function ProfileBillingCard({ user, onUpdated }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email ?? '')
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>(user.preferredLanguage)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, preferredLanguage }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to update profile')
      setEditing(false)
      await onUpdated()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update profile')
    } finally {
      setBusy(false)
    }
  }

  if (editing) {
    return (
      <form onSubmit={submit} className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">Profile & billing</h3>
            <p className="text-xs text-muted-foreground">A billing email is required only when upgrading to Pro.</p>
          </div>
          <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-border p-2" aria-label="Close profile editor"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-3 space-y-2">
          <input required value={name} onChange={event => setName(event.target.value)} placeholder="Name" className="w-full rounded-lg border border-border bg-background p-3" />
          <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Billing email (optional for Lite)" autoComplete="email" className="w-full rounded-lg border border-border bg-background p-3" />
          <select value={preferredLanguage} onChange={event => setPreferredLanguage(event.target.value as SupportedLanguage)} className="w-full rounded-lg border border-border bg-background p-3">
            <option value="en">English</option>
            <option value="ha">Hausa</option>
            <option value="sw">Swahili</option>
            <option value="fr">French</option>
          </select>
        </div>
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
        <button disabled={busy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-semibold text-black disabled:opacity-50"><Save className="h-4 w-4" /> {busy ? 'Saving…' : 'Save profile'}</button>
      </form>
    )
  }

  return (
    <div className={`rounded-xl border p-4 ${user.email ? 'border-border bg-card' : 'border-amber-500/40 bg-amber-500/10'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /><h3 className="font-semibold">Profile & billing</h3></div>
          <p className="mt-2 truncate text-sm">{user.email || 'No billing email added'}</p>
          {!user.email ? <p className="mt-1 text-xs text-muted-foreground">Add an email before starting Pro checkout.</p> : null}
        </div>
        <button onClick={() => { setName(user.name); setEmail(user.email ?? ''); setPreferredLanguage(user.preferredLanguage); setEditing(true) }} className="rounded-lg border border-border p-2" aria-label="Edit profile"><Pencil className="h-4 w-4" /></button>
      </div>
    </div>
  )
}
