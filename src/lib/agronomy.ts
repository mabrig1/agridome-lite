export interface ForecastPoint {
  timestamp: string
  temperatureC: number
  humidity: number
  precipitationProbability: number
  condition: string
}

export interface CropForAdvice {
  cropType: string
  expectedHarvestDate: string | Date
  status: string
}

export interface FarmAdvice {
  severity: 'info' | 'warning' | 'urgent'
  code: string
  message: string
}

export function buildDailyAdvice(forecast: ForecastPoint[], crops: CropForAdvice[], now = new Date()): FarmAdvice[] {
  const advice: FarmAdvice[] = []
  const next24Hours = forecast.filter(point => {
    const time = new Date(point.timestamp).getTime()
    return time >= now.getTime() && time <= now.getTime() + 24 * 60 * 60 * 1000
  })

  const maxRainProbability = Math.max(0, ...next24Hours.map(point => point.precipitationProbability))
  const maxTemperature = Math.max(-Infinity, ...next24Hours.map(point => point.temperatureC))

  if (maxRainProbability >= 70) {
    advice.push({
      severity: 'warning',
      code: 'RAIN_HOLD_IRRIGATION',
      message: 'Rain is likely today. Hold manual irrigation and delay nitrogen fertilizer until the heavy-rain window passes.',
    })
  } else if (maxRainProbability <= 20) {
    advice.push({
      severity: 'info',
      code: 'LOW_RAIN_CHECK_MOISTURE',
      message: 'Rain probability is low. Check soil moisture before deciding whether irrigation is needed.',
    })
  }

  if (Number.isFinite(maxTemperature) && maxTemperature >= 34) {
    advice.push({
      severity: 'warning',
      code: 'HEAT_STRESS',
      message: 'High heat is forecast. Irrigate early morning where needed, reduce midday handling, and watch young plants for wilting.',
    })
  }

  for (const crop of crops) {
    if (['Harvested', 'Failed'].includes(crop.status)) continue
    const harvestDate = new Date(crop.expectedHarvestDate)
    const days = Math.ceil((harvestDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    if (days >= 0 && days <= 7) {
      advice.push({
        severity: days <= 2 ? 'urgent' : 'info',
        code: 'HARVEST_WINDOW',
        message: `${crop.cropType} is expected to reach its harvest window in ${days === 0 ? 'less than a day' : `${days} day${days === 1 ? '' : 's'}`}. Prepare labour, containers, buyers, and post-harvest handling.`,
      })
    }
  }

  return advice.length
    ? advice
    : [{ severity: 'info', code: 'NO_EXCEPTION', message: 'No major weather or harvest exceptions detected for today. Continue routine field checks.' }]
}
