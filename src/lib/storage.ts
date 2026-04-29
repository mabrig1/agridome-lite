// LocalStorage-backed persistence layer with JSON serialization

const KEYS = {
  CLIMATE_LOGS: 'agridome_climate_logs',
  CROP_STAGES: 'agridome_crop_stages',
  PEST_SCANS: 'agridome_pest_scans',
  CHAT_HISTORY: 'agridome_chat_history',
  YIELD_RECORDS: 'agridome_yield_records',
  SETTINGS: 'agridome_settings',
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

export const storage = {
  getClimateLogs: () => get<ClimateLog[]>(KEYS.CLIMATE_LOGS, []),
  saveClimateLog: (log: ClimateLog) => {
    const logs = get<ClimateLog[]>(KEYS.CLIMATE_LOGS, [])
    set(KEYS.CLIMATE_LOGS, [log, ...logs].slice(0, 500))
  },
  deleteClimateLog: (id: string) => {
    const logs = get<ClimateLog[]>(KEYS.CLIMATE_LOGS, []).filter(l => l.id !== id)
    set(KEYS.CLIMATE_LOGS, logs)
  },

  getCropStages: () => get<CropStage[]>(KEYS.CROP_STAGES, []),
  saveCropStage: (stage: CropStage) => {
    const stages = get<CropStage[]>(KEYS.CROP_STAGES, []).filter(s => s.cropId !== stage.cropId)
    set(KEYS.CROP_STAGES, [stage, ...stages])
  },

  getPestScans: () => get<PestScan[]>(KEYS.PEST_SCANS, []),
  savePestScan: (scan: PestScan) => {
    const scans = get<PestScan[]>(KEYS.PEST_SCANS, [])
    set(KEYS.PEST_SCANS, [scan, ...scans].slice(0, 50))
  },

  getChatHistory: () => get<ChatMessage[]>(KEYS.CHAT_HISTORY, []),
  saveChatMessage: (msg: ChatMessage) => {
    const msgs = get<ChatMessage[]>(KEYS.CHAT_HISTORY, [])
    set(KEYS.CHAT_HISTORY, [...msgs, msg].slice(-100))
  },
  clearChatHistory: () => set(KEYS.CHAT_HISTORY, []),

  getYieldRecords: () => get<YieldRecord[]>(KEYS.YIELD_RECORDS, []),
  saveYieldRecord: (record: YieldRecord) => {
    const records = get<YieldRecord[]>(KEYS.YIELD_RECORDS, [])
    set(KEYS.YIELD_RECORDS, [record, ...records])
  },

  getSettings: () => get<AppSettings>(KEYS.SETTINGS, { language: 'en' }),
  saveSettings: (settings: AppSettings) => set(KEYS.SETTINGS, settings),
}
