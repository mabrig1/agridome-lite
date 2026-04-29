export type AdviceLevel = 'optimal' | 'warning' | 'danger'

export interface ClimateAdvice {
  level: AdviceLevel
  title: string
  message: string
  actions: string[]
}

export function getClimateAdvice(temp: number, humidity: number): ClimateAdvice {
  if (temp > 38) {
    return {
      level: 'danger',
      title: 'Heat Emergency',
      message: 'Temperature is critically high. Crops will suffer permanent damage within hours.',
      actions: [
        'Open ALL ventilation panels and doors immediately',
        'Drape wet cloth over the roof frame to cool air fast',
        'Mist pathways and walls — not leaves — to drop temperature',
        'Move heat-sensitive seedlings outside into shade',
        'Check plants for wilting every 30 minutes',
      ],
    }
  }

  if (temp > 32) {
    return {
      level: 'warning',
      title: 'High Heat',
      message: 'Temperature is above optimal range. Sustained heat reduces fruit set and stresses roots.',
      actions: [
        'Open side vents and roof ventilation now',
        'Add shade netting to reduce solar heat gain',
        'Water the soil (not leaves) to cool the root zone',
        'Check again in 1 hour — escalate if above 36°C',
      ],
    }
  }

  if (humidity > 82) {
    return {
      level: 'warning',
      title: 'High Humidity — Fungal Risk',
      message: 'Humidity above 82% creates ideal conditions for blight, mildew and botrytis.',
      actions: [
        'Increase air circulation — open vents on both sides',
        'Remove any yellowing or diseased leaves immediately',
        'Stop overhead irrigation until humidity drops below 75%',
        'Apply preventive copper fungicide to tomatoes and peppers',
        'Space plants further apart if overcrowded',
      ],
    }
  }

  if (humidity < 38) {
    return {
      level: 'warning',
      title: 'Low Humidity',
      message: 'Air is too dry. Crops lose water through leaves faster than roots can supply, causing wilting and tip burn.',
      actions: [
        'Mist pathways and walls (not crop leaves) to raise humidity',
        'Place shallow trays of water between plant rows',
        'Confirm drip irrigation or bottle drips are running',
        'Mulch soil surface with dry grass to reduce evaporation',
      ],
    }
  }

  if (temp >= 20 && temp <= 30 && humidity >= 55 && humidity <= 72) {
    return {
      level: 'optimal',
      title: 'Perfect Conditions',
      message: 'Temperature and humidity are in the ideal greenhouse range. Excellent growing conditions.',
      actions: [
        'Maintain current ventilation settings',
        'Continue regular watering schedule',
        'Good time to transplant seedlings or apply fertilizer',
      ],
    }
  }

  return {
    level: 'warning',
    title: 'Monitor Conditions',
    message: 'Conditions are outside the ideal range. Watch your crops closely for signs of stress.',
    actions: [
      'Check ventilation panels are correctly open or closed',
      'Inspect leaves for curling, yellowing or spots',
      'Log another reading in 2 hours to track the trend',
    ],
  }
}
