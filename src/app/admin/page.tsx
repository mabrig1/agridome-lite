import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { BookOpen, ShieldCheck } from 'lucide-react'
import { readSession, SESSION_COOKIE } from '@/lib/server/admin-auth'
import { knowledgeArticles } from '@/lib/server/admin-knowledge'
import AdminSessionControls from '@/components/admin/AdminSessionControls'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const metadata = { title: 'Administrator knowledge base | AgriDome Lite', robots: { index: false, follow: false } }

export default function AdminDashboard({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  const session = readSession(cookies().get(SESSION_COOKIE)?.value)
  if (!session) redirect('/admin/login')
  const q = typeof searchParams.q === 'string' ? searchParams.q.trim().slice(0, 200) : ''
  const category = typeof searchParams.category === 'string' ? searchParams.category : ''
  const categories = Array.from(new Set(knowledgeArticles.map(article => article.category)))
  const articles = knowledgeArticles.filter(article => (!category || article.category === category) && [article.title, article.summary, article.category, ...article.steps, article.note].join(' ').toLowerCase().includes(q.toLowerCase()))
  return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
      <div><a href="/" className="text-sm text-gold">← Farm dashboard</a><p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Administrator · {session.email}</p></div>
      <AdminSessionControls expiresAt={session.expiresAt} />
    </header>
    <section className="my-6 rounded-2xl border border-emerald-700/40 bg-emerald-500/5 p-6">
      <BookOpen className="h-8 w-8 text-gold" />
      <h1 className="mt-3 font-serif text-3xl text-gold">Administrator knowledge base</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Learn how to operate AgriDome, guide farmers through safe greenhouse and soil workflows, and keep useful pilot evidence.</p>
      <p className="mt-4 text-xs text-muted-foreground">{knowledgeArticles.length} operating guides · Administrator access · Online session required</p>
    </section>
    <form action="/admin" method="get" className="mb-6 grid items-end gap-3 rounded-xl border border-border p-4 sm:grid-cols-[1fr_220px_auto]">
      <div><label htmlFor="knowledge-query" className="mb-2 block text-sm">Search the knowledge base</label><input id="knowledge-query" name="q" type="search" maxLength={200} defaultValue={q} placeholder="Try soil, export, climate or password" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></div>
      <div><label htmlFor="knowledge-category" className="mb-2 block text-sm">Category</label><select id="knowledge-category" name="category" defaultValue={category} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="">All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select></div>
      <button type="submit" className="rounded-md bg-gold px-5 py-2 text-sm font-semibold text-black">Search</button>
    </form>
    <div className="mb-4 flex items-center justify-between gap-3"><p role="status" className="text-sm text-muted-foreground">{articles.length} {articles.length === 1 ? 'guide' : 'guides'} found</p>{(q || category) && <a href="/admin" className="text-sm text-gold">Clear filters</a>}</div>
    {articles.length === 0 && <p className="rounded-xl border border-border p-6 text-sm">No matching guides. Try a broader term, such as “build”, or clear the category filter.</p>}
    <div className="space-y-3">{articles.map(article => <details key={article.id} id={article.id} className="group rounded-xl border border-border bg-card p-5 open:border-gold/40">
      <summary className="cursor-pointer marker:text-gold"><span className="text-xs text-muted-foreground">{article.category}</span><h2 className="mt-1 inline text-lg font-semibold"> · {article.title}</h2><p className="mt-2 text-sm text-muted-foreground">{article.summary}</p></summary>
      <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed">{article.steps.map(step => <li key={step}>{step}</li>)}</ol>
      <p className="mt-5 rounded-lg border border-amber-700/30 bg-amber-500/5 p-3 text-sm leading-relaxed">{article.note}</p>
    </details>)}</div>
    <footer className="mt-8 border-t border-border pt-5 text-xs text-muted-foreground">AgriDome Lite · Developed and maintained by MABRIG Technologies.</footer>
  </main>
}
