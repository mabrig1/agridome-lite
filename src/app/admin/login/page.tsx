import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LockKeyhole } from 'lucide-react'
import AdminLogin from '@/components/admin/AdminLogin'
import { getAdminConfig, readSession, SESSION_COOKIE } from '@/lib/server/admin-auth'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Administrator sign in | AgriDome Lite', robots: { index: false, follow: false } }

export default function AdminLoginPage() {
  if (readSession(cookies().get(SESSION_COOKIE)?.value)) redirect('/admin')
  return <main className="mx-auto max-w-md px-5 py-12">
    <a href="/" className="text-sm text-gold">← Back to farm dashboard</a>
    <section className="mt-8 rounded-2xl border border-border bg-card p-6">
      <LockKeyhole className="h-8 w-8 text-gold" />
      <h1 className="mt-4 font-serif text-2xl">Administrator sign in</h1>
      <p className="mb-6 mt-2 text-sm text-muted-foreground">AgriDome’s private operating guide and knowledge base.</p>
      <AdminLogin configured={Boolean(getAdminConfig())} />
    </section>
  </main>
}
