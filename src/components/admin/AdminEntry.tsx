'use client'

import { useEffect, useState } from 'react'
import { BookOpen, LockKeyhole } from 'lucide-react'

export default function AdminEntry() {
  const [admin, setAdmin] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/admin/session', { cache: 'no-store', signal: controller.signal })
      .then(response => setAdmin(response.ok)).catch(() => setAdmin(false))
    return () => controller.abort()
  }, [])
  return <a href={admin ? '/admin' : '/admin/login'} className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm hover:border-gold/60">
    {admin ? <BookOpen className="h-4 w-4 text-gold" /> : <LockKeyhole className="h-4 w-4" />}
    {admin ? 'Administrator knowledge base' : 'Administrator sign in'}
  </a>
}
