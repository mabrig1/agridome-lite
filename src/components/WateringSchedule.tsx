'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Droplets, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CropWaterConfig {
  cropId: string
  label: string
  emoji: string
  frequencyDays: number
  time: string      // display string e.g. "6:00 AM"
  timeHour: number  // 24h hour for comparison
  timeMin: number
  ml: number
}

const WATER_CONFIG: CropWaterConfig[] = [
  { cropId: 'tomato',       label: 'Tomato',       emoji: '🍅', frequencyDays: 1, time: '6:00 AM',  timeHour: 6,  timeMin: 0,  ml: 500 },
  { cropId: 'pepper',       label: 'Bell Pepper',  emoji: '🫑', frequencyDays: 2, time: '6:30 AM',  timeHour: 6,  timeMin: 30, ml: 400 },
  { cropId: 'strawberry',   label: 'Strawberry',   emoji: '🍓', frequencyDays: 1, time: '7:00 AM',  timeHour: 7,  timeMin: 0,  ml: 300 },
  { cropId: 'irish-potato', label: 'Irish Potato', emoji: '🥔', frequencyDays: 2, time: '6:00 AM',  timeHour: 6,  timeMin: 0,  ml: 600 },
  { cropId: 'green-beans',  label: 'Green Beans',  emoji: '🫘', frequencyDays: 2, time: '6:30 AM',  timeHour: 6,  timeMin: 30, ml: 350 },
  { cropId: 'beetroot',     label: 'Beetroot',     emoji: '🟣', frequencyDays: 2, time: '7:00 AM',  timeHour: 7,  timeMin: 0,  ml: 400 },
]

function todayKey(cropId: string): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `watered_${cropId}_${yyyy}-${mm}-${dd}`
}

function dateKey(cropId: string, daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `watered_${cropId}_${yyyy}-${mm}-${dd}`
}

function getStreak(cropId: string, frequencyDays: number): number {
  if (typeof window === 'undefined') return 0
  let streak = 0
  // Walk back day-by-day; for every-N-day crops count a "watered period" if
  // any day in the window was watered.
  for (let ago = 0; ago < 365; ago += frequencyDays) {
    // Check if watered on this expected day or within the window
    let wateredInWindow = false
    for (let w = 0; w < frequencyDays; w++) {
      const key = dateKey(cropId, ago + w)
      if (localStorage.getItem(key)) { wateredInWindow = true; break }
    }
    if (wateredInWindow) { streak++ } else { break }
  }
  return streak
}

function nextWateringLabel(cfg: CropWaterConfig, wateredToday: boolean): string {
  const now = new Date()
  const currentMins = now.getHours() * 60 + now.getMinutes()
  const scheduledMins = cfg.timeHour * 60 + cfg.timeMin

  if (wateredToday) {
    const daysUntilNext = cfg.frequencyDays
    if (daysUntilNext === 1) return `Tomorrow at ${cfg.time}`
    return `In ${daysUntilNext} days at ${cfg.time}`
  }

  // Not watered today
  if (currentMins < scheduledMins) return `Today at ${cfg.time}`
  return `Overdue — water now!`
}

function isOverdue(cfg: CropWaterConfig, wateredToday: boolean): boolean {
  if (wateredToday) return false
  const now = new Date()
  const currentMins = now.getHours() * 60 + now.getMinutes()
  const scheduledMins = cfg.timeHour * 60 + cfg.timeMin
  return currentMins >= scheduledMins
}

export default function WateringSchedule() {
  const [wateredState, setWateredState] = useState<Record<string, boolean>>({})
  const [streaks, setStreaks] = useState<Record<string, number>>({})

  const refresh = useCallback(() => {
    const watered: Record<string, boolean> = {}
    const streakMap: Record<string, number> = {}
    WATER_CONFIG.forEach(cfg => {
      watered[cfg.cropId] = !!localStorage.getItem(todayKey(cfg.cropId))
      streakMap[cfg.cropId] = getStreak(cfg.cropId, cfg.frequencyDays)
    })
    setWateredState(watered)
    setStreaks(streakMap)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const markWatered = (cropId: string) => {
    localStorage.setItem(todayKey(cropId), '1')
    refresh()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <CardTitle className="text-base">Watering Schedule</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">Track daily watering for each crop</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {WATER_CONFIG.map(cfg => {
          const watered = !!wateredState[cfg.cropId]
          const streak = streaks[cfg.cropId] ?? 0
          const overdue = isOverdue(cfg, watered)
          const nextLabel = nextWateringLabel(cfg, watered)

          return (
            <div
              key={cfg.cropId}
              className={cn(
                'rounded-xl border p-3 transition-colors',
                watered
                  ? 'border-emerald-700/40 bg-emerald-500/5'
                  : overdue
                  ? 'border-red-700/40 bg-red-500/5'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left: crop info */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl flex-shrink-0">{cfg.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{cfg.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {cfg.ml} ml &middot; {cfg.frequencyDays === 1 ? 'Daily' : `Every ${cfg.frequencyDays} days`}
                    </p>
                  </div>
                </div>

                {/* Right: action */}
                {watered ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium whitespace-nowrap">✓ Watered</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => markWatered(cfg.cropId)}
                    className={cn(
                      'flex-shrink-0 text-xs h-8',
                      overdue && 'border-red-500/40 text-red-300 hover:bg-red-500/10'
                    )}
                  >
                    <Droplets className="w-3 h-3 mr-1" />
                    Mark Watered
                  </Button>
                )}
              </div>

              {/* Next watering + streak */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <p className={cn(
                  'text-xs',
                  watered ? 'text-muted-foreground' : overdue ? 'text-red-400 font-medium' : 'text-blue-400'
                )}>
                  {nextLabel}
                </p>
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Flame className="w-3 h-3" />
                    <span>{streak} day streak</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
