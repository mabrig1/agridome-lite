'use client'

import Link from 'next/link'
import { ChangeEvent, useMemo, useState } from 'react'
import { ArrowLeft, Download, FileJson, ShieldCheck, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  downloadCombinedPilotCsv,
  parsePilotBundle,
  PilotExportBundle,
  summarizePilot,
} from '@/lib/pilotExport'

export default function PilotCoordinatorPage() {
  const [bundles, setBundles] = useState<PilotExportBundle[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const summary = useMemo(() => summarizePilot(bundles), [bundles])

  async function importFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    setIsProcessing(true)
    const nextErrors: string[] = []
    const imported = await Promise.all(files.map(async file => {
      try {
        const parsed = parsePilotBundle(JSON.parse(await file.text()))
        if (!parsed) nextErrors.push(`${file.name}: unsupported or incomplete pilot file`)
        return parsed
      } catch {
        nextErrors.push(`${file.name}: could not read JSON`)
        return null
      }
    }))

    setBundles(current => {
      const byCode = new Map(current.map(bundle => [bundle.participant.participantCode, bundle]))
      imported.forEach(bundle => {
        if (bundle) byCode.set(bundle.participant.participantCode, bundle)
      })
      return Array.from(byCode.values()).sort((a, b) => a.participant.participantCode.localeCompare(b.participant.participantCode))
    })
    setErrors(nextErrors)
    setIsProcessing(false)
    event.target.value = ''
  }

  return (
    <main className="min-h-screen max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold mb-3">
            <ArrowLeft className="w-4 h-4" /> Farmer app
          </Link>
          <h1 className="font-serif text-3xl text-gold">Pilot Coordinator</h1>
          <p className="text-sm text-muted-foreground mt-1">Combine de-identified participant files and monitor the 12-week feasibility pilot.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={!bundles.length} onClick={() => downloadCombinedPilotCsv(bundles)} className="gap-2">
            <Download className="w-4 h-4" /> Combined CSV
          </Button>
          <Button variant="ghost" disabled={!bundles.length} onClick={() => { setBundles([]); setErrors([]) }} className="gap-2 text-red-400">
            <Trash2 className="w-4 h-4" /> Clear
          </Button>
        </div>
      </div>

      <Card className="border-emerald-700/40">
        <CardContent className="py-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-emerald-300">Local analysis only</p>
            <p className="text-muted-foreground mt-1">Files are processed in this browser and are not uploaded by this page. Participant exports exclude names and phone numbers. Use only authorized, de-identified files.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Import participant pilot files</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-gold/50 transition-colors text-center">
            <Upload className="w-8 h-8 text-gold mb-3" />
            <span className="font-medium">Choose one or more .json files</span>
            <span className="text-xs text-muted-foreground mt-1">Importing the same participant again replaces their earlier file.</span>
            <input type="file" accept="application/json,.json" multiple className="sr-only" onChange={importFiles} disabled={isProcessing} />
          </label>
          {isProcessing ? <p className="text-sm text-muted-foreground">Reading files…</p> : null}
          {errors.length ? (
            <div role="alert" className="rounded-lg border border-red-700/40 bg-red-500/5 p-3 text-xs text-red-300 space-y-1">
              {errors.map(error => <p key={error}>{error}</p>)}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {bundles.length ? (
        <>
          <section aria-label="Pilot summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Metric label="Participants" value={String(summary.participantCount)} />
            <Metric label="Baselines" value={`${summary.baselineCount}/${summary.participantCount}`} />
            <Metric label="Weekly records" value={String(summary.weeklyRecordCount)} />
            <Metric label="12-week retention" value={`${summary.retentionRate.toFixed(0)}%`} />
            <Metric label="Record completion" value={`${summary.completionRate.toFixed(0)}%`} />
            <Metric label="Total harvest" value={`${summary.totalHarvestKg.toFixed(1)} kg`} />
            <Metric label="Net recorded income" value={`₦${Math.round(summary.grossIncomeNgn - summary.totalCostsNgn).toLocaleString()}`} />
            <Metric label="Average pest loss" value={`${summary.averagePestLossPercent.toFixed(1)}%`} />
          </section>

          <Card>
            <CardHeader><CardTitle className="text-base">Exploratory baseline comparison</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-3">
              <ChangeMetric label="Latest harvest vs baseline" value={summary.averageHarvestChangePercent} suffix="%" />
              <ChangeMetric label="Latest income vs baseline" value={summary.averageIncomeChangePercent} suffix="%" />
              <ChangeMetric label="Pest-loss change" value={summary.averagePestLossChangePoints} suffix=" points" inverse />
              <p className="md:col-span-3 text-xs text-muted-foreground">These descriptive comparisons do not prove that AgriDome caused a change. Weather, season, crop cycle, prices and other interventions may explain the result.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Participant completeness</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground border-b border-border">
                  <tr><th className="py-2 pr-4">Code</th><th className="py-2 pr-4">Baseline</th><th className="py-2 pr-4">Weeks</th><th className="py-2">Status</th></tr>
                </thead>
                <tbody>
                  {bundles.map(bundle => (
                    <tr key={bundle.participant.participantCode} className="border-b border-border/60">
                      <td className="py-3 pr-4 font-mono text-gold"><span className="inline-flex items-center gap-2"><FileJson className="w-4 h-4" />{bundle.participant.participantCode}</span></td>
                      <td className="py-3 pr-4">{bundle.baseline ? 'Complete' : 'Missing'}</td>
                      <td className="py-3 pr-4">{bundle.outcomes.length}/12</td>
                      <td className="py-3">{bundle.outcomes.length >= 12 ? 'Completed' : bundle.outcomes.length ? 'Active' : 'No weekly data'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card><CardContent className="py-4"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold mt-1">{value}</p></CardContent></Card>
}

function ChangeMetric({ label, value, suffix, inverse = false }: { label: string; value: number | null; suffix: string; inverse?: boolean }) {
  const helpful = value !== null && (inverse ? value <= 0 : value >= 0)
  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-semibold mt-1 ${value === null ? 'text-muted-foreground' : helpful ? 'text-emerald-400' : 'text-amber-400'}`}>
        {value === null ? 'Not available' : `${value > 0 ? '+' : ''}${value.toFixed(1)}${suffix}`}
      </p>
    </div>
  )
}
