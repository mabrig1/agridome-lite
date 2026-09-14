'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function AdminSessionControls({ expiresAt }: { expiresAt: number }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const expire = () => window.location.replace('/admin/login')
    const timeout = window.setTimeout(expire, Math.max(0, expiresAt - Date.now()))
    const check = async () => {
      try { const response = await fetch('/api/admin/session', { cache: 'no-store' }); if (!response.ok) expire() }
      catch { expire() }
    }
    const visible = () => { if (document.visibilityState === 'visible') void check() }
    window.addEventListener('pageshow', check)
    document.addEventListener('visibilitychange', visible)
    return () => { window.clearTimeout(timeout); window.removeEventListener('pageshow', check); document.removeEventListener('visibilitychange', visible) }
  }, [expiresAt])
  async function logout() {
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/admin/session', { method: 'DELETE' })
      if (!response.ok) throw new Error()
      window.location.replace('/admin/login')
    } catch { setError('Connect to the internet to finish signing out.'); setBusy(false) }
  }
  return <div><Button variant="outline" onClick={logout} disabled={busy}>{busy ? 'Signing out…' : 'Sign out'}</Button>{error && <p role="alert" className="mt-2 text-xs text-red-300">{error}</p>}</div>
}
