import { CROPS } from '@/lib/crops'
import {
  AppSettings,
  ClimateLog,
  CropStage,
  PestScan,
  PilotWeeklyOutcome,
  YieldRecord,
} from '@/lib/storage'

export type FarmRiskLevel = 'good' | 'watch' | 'high'
export type FarmActionTarget = 'climate' | 'crops' | 'pest' | 'yield' | 'chat' | 'pilot'

export interface FarmAction {
  id: string
  level: FarmRiskLevel
  title: string
  detail: string
  target: FarmActionTarget
}

export interface CropSuitability {
  cropId: string
  name: string
  emoji: string
  score: number
  reason: string
}

export interface FarmIntelligenceInput {
  climateLogs: ClimateLog[]
  cropStages: CropStage[]
  pestScans: PestScan[]
  yieldRecords: YieldRecord[]
  pilotOutcomes: PilotWeeklyOutcome[]
  settings: AppSettings
}

export interface FarmIntelligence {
  score: number
  level: FarmRiskLevel
  headline: string
  actions: FarmAction[]
  cropSuitability: CropSuitability[]
  dataReadiness: number
  lastClimateAgeHours: number | null
}

const HOUR = 60 * 60 * 1000

function ageHours(iso: string, now: number) {
  return Math.max(0, (now - new Date(iso).getTime()) / HOUR)
}

function outsideDistance(value: number, [low, high]: [number, number]) {
  if (value < low) return low - value
  if (value > high) return value - high
  return 0
}

function pestSeverity(scan?: PestScan): FarmRiskLevel {
  if (!scan) return 'good'
  const text = scan.result.toLowerCase()
  if (/severe|critical|heavy infestation|urgent|destroy|advanced/.test(text)) return 'high'
  if (/moderate|mild|disease|pest|deficien|blight|wilt|mildew|aphid|whitefly|thrip|mite/.test(text)) return 'watch'
  return 'good'
}

function cropFit(temp: number, humidity: number) {
  return CROPS.map(crop => {
    const tempPenalty = outsideDistance(temp, crop.optimalTemp) * 7
    const humidityPenalty = outsideDistance(humidity, crop.optimalHumidity) * 1.6
    const score = Math.max(0, Math.min(100, Math.round(100 - tempPenalty - humidityPenalty)))
    const tempOk = outsideDistance(temp, crop.optimalTemp) === 0
    const humidityOk = outsideDistance(humidity, crop.optimalHumidity) === 0
    const reason = tempOk && humidityOk
      ? 'Current temperature and humidity both match this crop’s preferred range.'
      : tempOk
        ? 'Temperature fits; humidity needs adjustment.'
        : humidityOk
          ? 'Humidity fits; temperature needs adjustment.'
          : 'Ranked by distance from the crop’s preferred temperature and humidity.'
    return { cropId: crop.id, name: crop.name, emoji: crop.emoji, score, reason }
  }).sort((a, b) => b.score - a.score).slice(0, 3)
}

export function buildFarmIntelligence(input: FarmIntelligenceInput, now = Date.now()): FarmIntelligence {
  const latestClimate = input.climateLogs[0]
  const latestPest = input.pestScans[0]
  const actions: FarmAction[] = []
  let score = 100

  const readinessSignals = [
    Boolean(latestClimate),
    input.cropStages.length > 0,
    input.pestScans.length > 0,
    input.yieldRecords.length > 0,
    Boolean(input.settings.location),
    Boolean(input.settings.greenhouseSize),
  ]
  const dataReadiness = Math.round((readinessSignals.filter(Boolean).length / readinessSignals.length) * 100)

  let lastClimateAgeHours: number | null = null
  if (!latestClimate) {
    score -= 25
    actions.push({
      id: 'climate-missing',
      level: 'high',
      title: 'Log greenhouse conditions',
      detail: 'No climate reading is available. Temperature and humidity are the foundation for the app’s risk decisions.',
      target: 'climate',
    })
  } else {
    lastClimateAgeHours = ageHours(latestClimate.timestamp, now)
    if (lastClimateAgeHours > 24) {
      score -= 12
      actions.push({
        id: 'climate-stale',
        level: 'watch',
        title: 'Refresh the climate reading',
        detail: `The latest reading is ${Math.round(lastClimateAgeHours)} hours old. Log a new reading before making today’s decisions.`,
        target: 'climate',
      })
    }

    if (latestClimate.temperature > 38 || latestClimate.temperature < 12) {
      score -= 25
      actions.push({
        id: 'temperature-danger',
        level: 'high',
        title: 'Temperature needs immediate attention',
        detail: `Current temperature is ${latestClimate.temperature}°C. Open Climate for corrective steps.`,
        target: 'climate',
      })
    } else if (latestClimate.temperature > 32 || latestClimate.temperature < 18) {
      score -= 12
      actions.push({
        id: 'temperature-watch',
        level: 'watch',
        title: 'Temperature is outside the general target zone',
        detail: `Current temperature is ${latestClimate.temperature}°C. Recheck ventilation, shade and irrigation.`,
        target: 'climate',
      })
    }

    if (latestClimate.humidity > 85 || latestClimate.humidity < 30) {
      score -= 18
      actions.push({
        id: 'humidity-danger',
        level: 'high',
        title: 'Humidity risk is elevated',
        detail: `Current humidity is ${latestClimate.humidity}%. This can increase crop stress or disease pressure.`,
        target: 'climate',
      })
    } else if (latestClimate.humidity > 78 || latestClimate.humidity < 40) {
      score -= 9
      actions.push({
        id: 'humidity-watch',
        level: 'watch',
        title: 'Humidity needs monitoring',
        detail: `Current humidity is ${latestClimate.humidity}%. Check crop-specific targets before the next irrigation cycle.`,
        target: 'climate',
      })
    }
  }

  const recentPestAge = latestPest ? ageHours(latestPest.timestamp, now) : null
  const severity = recentPestAge !== null && recentPestAge <= 14 * 24 ? pestSeverity(latestPest) : 'good'
  if (severity === 'high') {
    score -= 22
    actions.push({
      id: 'pest-high',
      level: 'high',
      title: 'Recent scan indicates a serious crop-health risk',
      detail: 'Review the diagnosis, isolate affected plants where appropriate, and confirm serious treatment decisions with an extension professional.',
      target: 'pest',
    })
  } else if (severity === 'watch') {
    score -= 10
    actions.push({
      id: 'pest-watch',
      level: 'watch',
      title: 'Follow up the latest crop-health scan',
      detail: 'A recent scan contains a pest, disease or deficiency signal. Check whether symptoms are improving.',
      target: 'pest',
    })
  }

  if (!input.cropStages.length) {
    score -= 8
    actions.push({
      id: 'crop-stage-missing',
      level: 'watch',
      title: 'Start a crop growth plan',
      detail: 'Choose the crop you are actively growing so AgriDome can surface stage-specific tasks.',
      target: 'crops',
    })
  }

  if (!input.yieldRecords.length) {
    score -= 5
    actions.push({
      id: 'yield-plan-missing',
      level: 'watch',
      title: 'Create a yield and revenue baseline',
      detail: 'A baseline makes it easier to compare expected output with actual harvest performance.',
      target: 'yield',
    })
  }

  if (!input.settings.location || !input.settings.greenhouseSize) {
    score -= 5
    actions.push({
      id: 'profile-incomplete',
      level: 'watch',
      title: 'Complete your farm profile',
      detail: 'Location and growing area will improve future climate, market and input recommendations.',
      target: 'chat',
    })
  }

  if (input.pilotOutcomes.length > 0) {
    const latest = input.pilotOutcomes[0]
    if (latest.pestLossPercent >= 20) {
      score -= 8
      actions.push({
        id: 'pilot-loss',
        level: 'watch',
        title: 'Recorded pest loss is high',
        detail: `The latest pilot record reports ${latest.pestLossPercent}% pest loss. Compare this with recent scans and climate conditions.`,
        target: 'pilot',
      })
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)))
  const level: FarmRiskLevel = score >= 80 ? 'good' : score >= 55 ? 'watch' : 'high'
  const headline = level === 'good'
    ? 'Farm conditions look stable'
    : level === 'watch'
      ? 'A few farm signals need attention'
      : 'Priority action is needed'

  const priority = { high: 0, watch: 1, good: 2 }
  actions.sort((a, b) => priority[a.level] - priority[b.level])

  return {
    score,
    level,
    headline,
    actions: actions.slice(0, 5),
    cropSuitability: latestClimate ? cropFit(latestClimate.temperature, latestClimate.humidity) : [],
    dataReadiness,
    lastClimateAgeHours,
  }
}
