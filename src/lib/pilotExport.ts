import { PilotBaseline, PilotProfile, PilotWeeklyOutcome } from '@/lib/storage'

export interface PilotExportBundle {
  schemaVersion: 1
  exportedAt: string
  participant: {
    participantCode: string
  }
  baseline: PilotBaseline | null
  outcomes: PilotWeeklyOutcome[]
}

export interface PilotAggregateSummary {
  participantCount: number
  baselineCount: number
  weeklyRecordCount: number
  completedTwelveWeeks: number
  retentionRate: number
  completionRate: number
  totalHarvestKg: number
  grossIncomeNgn: number
  totalCostsNgn: number
  averagePestLossPercent: number
  averageHarvestChangePercent: number | null
  averageIncomeChangePercent: number | null
  averagePestLossChangePoints: number | null
}

function escapeCsv(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`
}

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function createPilotBundle(
  profile: PilotProfile,
  baseline: PilotBaseline | null,
  outcomes: PilotWeeklyOutcome[],
): PilotExportBundle {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    participant: { participantCode: profile.participantCode },
    baseline,
    outcomes,
  }
}

export function downloadPilotJson(profile: PilotProfile, baseline: PilotBaseline | null, outcomes: PilotWeeklyOutcome[]) {
  const bundle = createPilotBundle(profile, baseline, outcomes)
  downloadText(
    `agridome-pilot-${profile.participantCode}.json`,
    JSON.stringify(bundle, null, 2),
    'application/json;charset=utf-8',
  )
}

export function bundlesToCsv(bundles: PilotExportBundle[]) {
  const headers = [
    'participant_code', 'baseline_crop', 'farm_type', 'area_sqm',
    'baseline_weekly_harvest_kg', 'baseline_weekly_income_ngn', 'baseline_pest_loss_percent',
    'week_start', 'crop', 'harvest_kg', 'income_ngn', 'costs_ngn',
    'pest_loss_percent', 'app_used_days', 'notes',
  ]

  const rows = bundles.flatMap(bundle => bundle.outcomes.map(outcome => {
    const baseline = bundle.baseline
    return [
      bundle.participant.participantCode,
      baseline?.crop ?? '',
      baseline?.farmType ?? '',
      baseline?.areaSqm ?? '',
      baseline?.weeklyHarvestKg ?? '',
      baseline?.weeklyIncomeNgn ?? '',
      baseline?.pestLossPercent ?? '',
      outcome.weekStart,
      outcome.crop,
      outcome.harvestKg,
      outcome.incomeNgn,
      outcome.costsNgn,
      outcome.pestLossPercent,
      outcome.appUsedDays,
      outcome.notes ?? '',
    ].map(escapeCsv).join(',')
  }))

  return [headers.join(','), ...rows].join('\n')
}

export function downloadPilotCsv(profile: PilotProfile, baseline: PilotBaseline | null, outcomes: PilotWeeklyOutcome[]) {
  const bundle = createPilotBundle(profile, baseline, outcomes)
  downloadText(
    `agridome-pilot-${profile.participantCode}.csv`,
    bundlesToCsv([bundle]),
    'text/csv;charset=utf-8',
  )
}

export function downloadCombinedPilotCsv(bundles: PilotExportBundle[]) {
  downloadText(
    `agridome-pilot-combined-${new Date().toISOString().slice(0, 10)}.csv`,
    bundlesToCsv(bundles),
    'text/csv;charset=utf-8',
  )
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function parsePilotBundle(value: unknown): PilotExportBundle | null {
  if (!isObject(value) || value.schemaVersion !== 1) return null
  if (!isObject(value.participant) || typeof value.participant.participantCode !== 'string') return null
  if (!Array.isArray(value.outcomes)) return null
  const participantCode = value.participant.participantCode

  const validOutcomes = value.outcomes.every(outcome =>
    isObject(outcome)
    && typeof outcome.id === 'string'
    && outcome.participantCode === participantCode
    && typeof outcome.weekStart === 'string'
    && typeof outcome.crop === 'string'
    && typeof outcome.harvestKg === 'number' && Number.isFinite(outcome.harvestKg) && outcome.harvestKg >= 0
    && typeof outcome.incomeNgn === 'number' && Number.isFinite(outcome.incomeNgn) && outcome.incomeNgn >= 0
    && typeof outcome.costsNgn === 'number' && Number.isFinite(outcome.costsNgn) && outcome.costsNgn >= 0
    && typeof outcome.pestLossPercent === 'number' && Number.isFinite(outcome.pestLossPercent) && outcome.pestLossPercent >= 0 && outcome.pestLossPercent <= 100
    && typeof outcome.appUsedDays === 'number' && Number.isFinite(outcome.appUsedDays) && outcome.appUsedDays >= 0 && outcome.appUsedDays <= 7
  )
  if (!validOutcomes) return null

  const baseline = value.baseline
  if (baseline !== null && (
    !isObject(baseline)
    || baseline.participantCode !== participantCode
    || typeof baseline.crop !== 'string'
    || !['greenhouse', 'open-field', 'mixed'].includes(String(baseline.farmType))
    || typeof baseline.areaSqm !== 'number' || !Number.isFinite(baseline.areaSqm) || baseline.areaSqm <= 0
    || typeof baseline.weeklyHarvestKg !== 'number' || !Number.isFinite(baseline.weeklyHarvestKg) || baseline.weeklyHarvestKg < 0
    || typeof baseline.weeklyIncomeNgn !== 'number' || !Number.isFinite(baseline.weeklyIncomeNgn) || baseline.weeklyIncomeNgn < 0
    || typeof baseline.pestLossPercent !== 'number' || !Number.isFinite(baseline.pestLossPercent) || baseline.pestLossPercent < 0 || baseline.pestLossPercent > 100
  )) return null

  return value as unknown as PilotExportBundle
}

function percentChange(current: number, baseline: number) {
  if (baseline <= 0) return null
  return ((current - baseline) / baseline) * 100
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
}

export function summarizePilot(bundles: PilotExportBundle[]): PilotAggregateSummary {
  const outcomes = bundles.flatMap(bundle => bundle.outcomes)
  const latestPairs = bundles.flatMap(bundle => {
    if (!bundle.baseline || !bundle.outcomes.length) return []
    const latest = [...bundle.outcomes].sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0]
    return [{ baseline: bundle.baseline, latest }]
  })

  const harvestChanges = latestPairs
    .map(({ baseline, latest }) => percentChange(latest.harvestKg, baseline.weeklyHarvestKg))
    .filter((value): value is number => value !== null)
  const incomeChanges = latestPairs
    .map(({ baseline, latest }) => percentChange(latest.incomeNgn, baseline.weeklyIncomeNgn))
    .filter((value): value is number => value !== null)
  const pestChanges = latestPairs.map(({ baseline, latest }) => latest.pestLossPercent - baseline.pestLossPercent)
  const participantCount = bundles.length

  return {
    participantCount,
    baselineCount: bundles.filter(bundle => bundle.baseline !== null).length,
    weeklyRecordCount: outcomes.length,
    completedTwelveWeeks: bundles.filter(bundle => bundle.outcomes.length >= 12).length,
    retentionRate: participantCount ? (bundles.filter(bundle => bundle.outcomes.length >= 12).length / participantCount) * 100 : 0,
    completionRate: participantCount ? Math.min(100, (outcomes.length / (participantCount * 12)) * 100) : 0,
    totalHarvestKg: outcomes.reduce((sum, outcome) => sum + outcome.harvestKg, 0),
    grossIncomeNgn: outcomes.reduce((sum, outcome) => sum + outcome.incomeNgn, 0),
    totalCostsNgn: outcomes.reduce((sum, outcome) => sum + outcome.costsNgn, 0),
    averagePestLossPercent: outcomes.length ? outcomes.reduce((sum, outcome) => sum + outcome.pestLossPercent, 0) / outcomes.length : 0,
    averageHarvestChangePercent: average(harvestChanges),
    averageIncomeChangePercent: average(incomeChanges),
    averagePestLossChangePoints: average(pestChanges),
  }
}
