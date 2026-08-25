// Versioned LocalStorage-backed persistence layer with JSON serialization.
// Pilot exports deliberately keep data on-device until the participant chooses to share it.

const KEYS = {
  CLIMATE_LOGS: 'agridome_climate_logs',
  CROP_STAGES: 'agridome_crop_stages',
  PEST_SCANS: 'agridome_pest_scans',
  CHAT_HISTORY: 'agridome_chat_history',
  YIELD_RECORDS: 'agridome_yield_records',
  SETTINGS: 'agridome_settings',
  PILOT_PROFILE_V1: 'agridome_pilot_profile_v1',
  PILOT_BASELINE_V1: 'agridome_pilot_baseline_v1',
  PILOT_OUTCOMES_V1: 'agridome_pilot_outcomes_v1',
} as const

function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export interface ClimateLog {
  id: string
  timestamp: string
  temperature: number
  humidity: number
  co2?: number
  lightLevel?: number
  notes?: string
}

export interface CropStage {
  id: string
  cropId: string
  plantedDate: string
  currentStage: number
  notes?: string
  updatedAt: string
}

export interface PestScan {
  id: string
  timestamp: string
  imageBase64: string
  result: string
  cropContext?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  language?: string
}

export interface YieldRecord {
  id: string
  cropId: string
  area: number
  plantCount: number
  expectedYield: number
  actualYield?: number
  recordedAt: string
}

export interface AppSettings {
  language: 'en' | 'ig' | 'ha' | 'yo'
  farmerName?: string
  location?: string
  greenhouseSize?: number
}

export interface PilotProfile {
  participantCode: string
  name?: string
  location: string
  phone?: string
  consentedAt: string
  consentVersion: '1.0'
}

export interface PilotBaseline {
  participantCode: string
  recordedAt: string
  crop: string
  farmType: 'greenhouse' | 'open-field' | 'mixed'
  areaSqm: number
  experienceYears: number
  weeklyHarvestKg: number
  weeklyIncomeNgn: number
  pestLossPercent: number
}

export interface PilotWeeklyOutcome {
  id: string
  participantCode: string
  recordedAt: string
  weekStart: string
  crop: string
  harvestKg: number
  incomeNgn: number
  costsNgn: number
  pestLossPercent: number
  appUsedDays: number
  notes?: string
}

export const storage = {
  getClimateLogs: () => get<ClimateLog[]>(KEYS.CLIMATE_LOGS, []),
  saveClimateLog: (log: ClimateLog) => {
    const logs = get<ClimateLog[]>(KEYS.CLIMATE_LOGS, [])
    set(KEYS.CLIMATE_LOGS, [log, ...logs].slice(0, 500))
  },
  deleteClimateLog: (id: string) => {
    const logs = get<ClimateLog[]>(KEYS.CLIMATE_LOGS, []).filter(log => log.id !== id)
    set(KEYS.CLIMATE_LOGS, logs)
  },

  getCropStages: () => get<CropStage[]>(KEYS.CROP_STAGES, []),
  saveCropStage: (stage: CropStage) => {
    const stages = get<CropStage[]>(KEYS.CROP_STAGES, []).filter(item => item.cropId !== stage.cropId)
    set(KEYS.CROP_STAGES, [stage, ...stages])
  },

  getPestScans: () => get<PestScan[]>(KEYS.PEST_SCANS, []),
  savePestScan: (scan: PestScan) => {
    const scans = get<PestScan[]>(KEYS.PEST_SCANS, [])
    set(KEYS.PEST_SCANS, [scan, ...scans].slice(0, 50))
  },

  getChatHistory: () => get<ChatMessage[]>(KEYS.CHAT_HISTORY, []),
  saveChatMessage: (message: ChatMessage) => {
    const messages = get<ChatMessage[]>(KEYS.CHAT_HISTORY, [])
    set(KEYS.CHAT_HISTORY, [...messages, message].slice(-100))
  },
  clearChatHistory: () => set(KEYS.CHAT_HISTORY, []),

  getYieldRecords: () => get<YieldRecord[]>(KEYS.YIELD_RECORDS, []),
  saveYieldRecord: (record: YieldRecord) => {
    const records = get<YieldRecord[]>(KEYS.YIELD_RECORDS, [])
    set(KEYS.YIELD_RECORDS, [record, ...records])
  },

  getSettings: () => get<AppSettings>(KEYS.SETTINGS, { language: 'en' }),
  saveSettings: (settings: AppSettings) => set(KEYS.SETTINGS, settings),

  getPilotProfile: () => get<PilotProfile | null>(KEYS.PILOT_PROFILE_V1, null),
  savePilotProfile: (profile: PilotProfile) => set(KEYS.PILOT_PROFILE_V1, profile),
  getPilotBaseline: () => get<PilotBaseline | null>(KEYS.PILOT_BASELINE_V1, null),
  savePilotBaseline: (baseline: PilotBaseline) => set(KEYS.PILOT_BASELINE_V1, baseline),
  getPilotOutcomes: () => get<PilotWeeklyOutcome[]>(KEYS.PILOT_OUTCOMES_V1, []),
  savePilotOutcome: (outcome: PilotWeeklyOutcome) => {
    const outcomes = get<PilotWeeklyOutcome[]>(KEYS.PILOT_OUTCOMES_V1, [])
    const withoutDuplicateWeek = outcomes.filter(item => item.weekStart !== outcome.weekStart || item.crop !== outcome.crop)
    set(KEYS.PILOT_OUTCOMES_V1, [outcome, ...withoutDuplicateWeek].slice(0, 104))
  },
  clearPilotData: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(KEYS.PILOT_PROFILE_V1)
    localStorage.removeItem(KEYS.PILOT_BASELINE_V1)
    localStorage.removeItem(KEYS.PILOT_OUTCOMES_V1)
  },
}
