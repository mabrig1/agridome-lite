'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Leaf,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  Thermometer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildFarmIntelligence, FarmAction, FarmRiskLevel } from '@/lib/farmIntelligence'
import { storage } from '@/lib/storage'
import { Tab } from '@/lib/navigation'
import { cn } from '@/lib/utils'

interface Props {
  onNavigate: (tab: Tab) => void
}

const LEVEL_STYLES: Record<FarmRiskLevel, string> = {
  good: 'text-emerald-300 border-emerald-700/40 bg-emerald-500/10',
  watch: 'text-amber-300 border-amber-700/40 bg-amber-500/10',
  high: 'text-red-300 border-red-700/40 bg-red-500/10',
}

const QUICK_ACTIONS: Array<{ tab: Tab; label: string; icon: typeof Thermometer }> = [
  { tab: 'climate', label: 'Log climate', icon: Thermometer },
  { tab: 'pest', label: 'Scan crop', icon: Bug },
  { tab: 'crops', label: 'Crop plan', icon: Leaf },
  { tab: 'yield', label: 'Yield plan', icon: BarChart3 },
  { tab: 'chat', label: 'Ask advisor', icon: MessageCircle },
  { tab: 'pilot', label: 'Pilot evidence', icon: ClipboardCheck },
]

export default function FarmCommandCenter({ onNavigate }: Props) {
  const [ready, setReady] = useState(false)
  const [snapshot, setSnapshot] = useState(() => ({
    climateLogs: [] as ReturnType<typeof storage.getClimateLogs>,
    cropStages: [] as ReturnType<typeof storage.getCropStages>,
    pestScans: [] as ReturnType<typeof storage.getPestScans>,
    yieldRecords: [] as ReturnType<typeof storage.getYieldRecords>,
    pilotOutcomes: [] as ReturnType<typeof storage.getPilotOutcomes>,
    settings: { language: 'en' as const },
  }))

  useEffect(() => {
    setSnapshot({
      climateLogs: storage.getClimateLogs(),
      cropStages: storage.getCropStages(),
      pestScans: storage.getPestScans(),
      yieldRecords: storage.getYieldRecords(),
      pilotOutcomes: storage.getPilotOutcomes(),
      settings: storage.getSettings(),
    })
    setReady(true)
  }, [])

  const intelligence = useMemo(() => buildFarmIntelligence(snapshot), [snapshot])

  if (!ready) return <div className="p-4 text-sm text-muted-foreground">Preparing farm command center…</div>

  return (
    <div className="p-4 space-y-4">
      <Card className={cn('overflow-hidden border', LEVEL_STYLES[intelligence.level])}>
        <CardContent className="py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80">
                <Gauge className="w-4 h-4" /> Farm readiness score
              </div>
              <p className="font-serif text-3xl font-semibold mt-2">{intelligence.score}/100</p>
              <p className="text-sm mt-1">{intelligence.headline}</p>
            </div>
            <RiskIcon level={intelligence.level} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div className="rounded-lg border border-current/20 p-3">
              <p className="opacity-70">Data readiness</p>
              <p className="font-semibold text-base mt-1">{intelligence.dataReadiness}%</p>
            </div>
            <div className="rounded-lg border border-current/20 p-3">
              <p className="opacity-70">Climate freshness</p>
              <p className="font-semibold text-base mt-1">
                {intelligence.lastClimateAgeHours === null
                  ? 'No reading'
                  : intelligence.lastClimateAgeHours < 1
                    ? '< 1 hour'
                    : `${Math.round(intelligence.lastClimateAgeHours)} hours`}
              </p>
            </div>
          </div>
          <p className="text-[11px] opacity-60 mt-3">This score is an operational triage aid based on records in this device; it is not a scientific crop-health certification.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <CardTitle className="text-base">Today’s priority actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {intelligence.actions.length ? intelligence.actions.map(action => (
            <PriorityAction key={action.id} action={action} onNavigate={onNavigate} />
          )) : (
            <div className="rounded-xl border border-emerald-700/30 bg-emerald-500/5 p-4 text-sm">
              <div className="flex gap-2 items-center text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4" /> No urgent action detected
              </div>
              <p className="text-xs text-muted-foreground mt-1">Keep logging conditions and crop observations so the command center stays useful.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {intelligence.cropSuitability.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Best climate fit right now</CardTitle>
            <p className="text-xs text-muted-foreground">A quick ranking using your latest temperature and humidity reading.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {intelligence.cropSuitability.map((crop, index) => (
              <button
                key={crop.cropId}
                type="button"
                onClick={() => onNavigate('crops')}
                className="w-full text-left rounded-xl border border-border p-3 hover:border-gold/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>{crop.emoji}</span>
                    <div>
                      <p className="text-sm font-medium">#{index + 1} {crop.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{crop.reason}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gold">{crop.score}%</span>
                </div>
              </button>
            ))}
            <p className="text-[11px] text-muted-foreground">Climate fit alone does not account for soil, water quality, disease history, market demand or variety-specific needs.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Farm tools</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map(({ tab, label, icon: Icon }) => (
            <Button key={tab} variant="outline" onClick={() => onNavigate(tab)} className="justify-start gap-2 h-11">
              <Icon className="w-4 h-4 text-gold" /> {label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function RiskIcon({ level }: { level: FarmRiskLevel }) {
  if (level === 'good') return <CheckCircle2 className="w-9 h-9" />
  if (level === 'high') return <ShieldAlert className="w-9 h-9" />
  return <AlertTriangle className="w-9 h-9" />
}

function PriorityAction({ action, onNavigate }: { action: FarmAction; onNavigate: (tab: Tab) => void }) {
  const style = action.level === 'high'
    ? 'border-red-700/30 bg-red-500/5'
    : 'border-amber-700/30 bg-amber-500/5'
  return (
    <button type="button" onClick={() => onNavigate(action.target)} className={cn('w-full rounded-xl border p-3 text-left', style)}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">{action.title}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{action.detail}</p>
        </div>
        <ArrowRight className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
      </div>
    </button>
  )
}
