'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Download, RefreshCw, Sprout, TrendingDown, TrendingUp, Users, WalletCards } from 'lucide-react'

interface CooperativeOverview {
  cooperativeId: string
  cooperative: { name: string; region: string; subscriptionStatus: string }
  summary: {
    members: number
    farms: number
    totalAcreage: number
    projectedHarvestKg: number
    revenue: number
    expenses: number
    netProfit: number
  }
  cropMix: Array<{ _id: string; activePlots: number; acres: number; projectedHarvestKg: number }>
  inputRequirements: Array<{ _id: string; pendingTasks: number }>
}

export default function CooperativeDashboard() {
  const [overview, setOverview] = useState<CooperativeOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOverview = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/coop/overview', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load cooperative dashboard')
      setOverview(payload)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load cooperative dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  return (
    <main className="min-h-screen bg-background px-4 py-5 text-foreground">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href="/farm-dashboard" className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Farmer dashboard
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Cooperative / NGO</p>
            <h1 className="mt-1 text-2xl font-bold">{overview?.cooperative.name ?? 'Management dashboard'}</h1>
            {overview?.cooperative.region ? <p className="mt-1 text-sm text-muted-foreground">{overview.cooperative.region}</p> : null}
          </div>
          <button onClick={() => void loadOverview()} disabled={loading} className="rounded-lg border border-border p-2 disabled:opacity-40" aria-label="Refresh cooperative data">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error ? <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm">{error}</div> : null}

        {overview ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric icon={Users} label="Members" value={overview.summary.members} money={false} />
              <Metric icon={Sprout} label="Farms" value={overview.summary.farms} money={false} />
              <Metric icon={Sprout} label="Total acres" value={overview.summary.totalAcreage} money={false} />
              <Metric icon={TrendingUp} label="Projected harvest" value={overview.summary.projectedHarvestKg} money={false} suffix=" kg" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Metric icon={TrendingUp} label="Revenue" value={overview.summary.revenue} />
              <Metric icon={TrendingDown} label="Expenses" value={overview.summary.expenses} />
              <Metric icon={WalletCards} label="Net profit" value={overview.summary.netProfit} />
            </div>

            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Crop portfolio</h2>
                  <p className="text-xs text-muted-foreground">Active plots, acreage and expected output across members.</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {overview.cropMix.map(crop => (
                  <div key={crop._id} className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium capitalize">{crop._id}</p>
                      <p className="text-sm font-semibold">{Number(crop.projectedHarvestKg || 0).toLocaleString()} kg</p>
                    </div>
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      <span>{crop.activePlots} active plots</span>
                      <span>{Number(crop.acres || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} acres</span>
                    </div>
                  </div>
                ))}
                {!overview.cropMix.length ? <p className="text-sm text-muted-foreground">No active crop plots have been reported yet.</p> : null}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="font-semibold">Input and field requirements</h2>
              <p className="mt-1 text-xs text-muted-foreground">Pending member tasks help estimate cooperative demand for water, fertilizer, pest control and harvest support.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {overview.inputRequirements.map(item => (
                  <div key={item._id} className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">{item._id}</p>
                    <p className="mt-1 text-xl font-bold">{item.pendingTasks}</p>
                    <p className="text-[11px] text-muted-foreground">pending actions</p>
                  </div>
                ))}
                {!overview.inputRequirements.length ? <p className="col-span-2 text-sm text-muted-foreground">No pending member tasks are currently recorded.</p> : null}
              </div>
            </section>

            <button onClick={() => exportOverviewCsv(overview)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-semibold">
              <Download className="h-4 w-4" /> Export cooperative CSV report
            </button>

            <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm">
              <p className="font-semibold">Institutional reporting foundation</p>
              <p className="mt-1 text-muted-foreground">This view can support cooperative planning, NGO field monitoring, input aggregation, grant evidence and lender discussions as member data grows.</p>
            </div>
          </>
        ) : loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading cooperative data…</div>
        ) : null}
      </div>
    </main>
  )
}

function Metric({ icon: Icon, label, value, money = true, suffix = '' }: { icon: typeof Users; label: string; value: number; money?: boolean; suffix?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Icon className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{label}</span></div>
      <p className="mt-2 break-words text-lg font-bold">{money ? '₦' : ''}{Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: money ? 0 : 2 })}{suffix}</p>
    </div>
  )
}

function exportOverviewCsv(overview: CooperativeOverview) {
  const rows: string[][] = [
    ['AgriDome Lite Cooperative Report'],
    ['Cooperative', overview.cooperative.name],
    ['Region', overview.cooperative.region],
    ['Members', String(overview.summary.members)],
    ['Farms', String(overview.summary.farms)],
    ['Total acreage', String(overview.summary.totalAcreage)],
    ['Projected harvest kg', String(overview.summary.projectedHarvestKg)],
    ['Revenue NGN', String(overview.summary.revenue)],
    ['Expenses NGN', String(overview.summary.expenses)],
    ['Net profit NGN', String(overview.summary.netProfit)],
    [],
    ['Crop', 'Active plots', 'Acres', 'Projected harvest kg'],
    ...overview.cropMix.map(crop => [crop._id, String(crop.activePlots), String(crop.acres), String(crop.projectedHarvestKg)]),
    [],
    ['Input/task category', 'Pending actions'],
    ...overview.inputRequirements.map(item => [item._id, String(item.pendingTasks)]),
  ]

  const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${slug(overview.cooperative.name)}-cooperative-report.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'agridome'
}
