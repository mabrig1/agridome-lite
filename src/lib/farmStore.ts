'use client'

import { cacheFarm, getCachedFarms, queueMutation, syncPendingChanges } from '@/lib/offlineDb'

function objectId() {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

async function getFarm(userId: string, farmId: string) {
  const farms = await getCachedFarms(userId)
  return farms.find(farm => farm.id === farmId) ?? null
}

async function opportunisticSync() {
  if (typeof navigator !== 'undefined' && navigator.onLine) await syncPendingChanges()
}

export async function cacheCloudFarms(userId: string, farms: Array<Record<string, any>>) {
  await Promise.all(
    farms.map(farm => cacheFarm({
      id: String(farm._id),
      userId,
      payload: farm,
      updatedAt: String(farm.updatedAt ?? new Date().toISOString()),
      syncState: 'synced',
    }))
  )
}

export async function createFarmOfflineFirst(userId: string, input: {
  name: string
  region: string
  longitude: number
  latitude: number
  totalSizeAcres: number
}) {
  const id = objectId()
  const updatedAt = new Date().toISOString()
  const farm = {
    _id: id,
    userId,
    name: input.name,
    location: { type: 'Point', coordinates: [input.longitude, input.latitude], region: input.region },
    totalSizeAcres: input.totalSizeAcres,
    crops: [],
    financialLogs: [],
    createdAt: updatedAt,
    updatedAt,
  }

  await cacheFarm({ id, userId, payload: farm, updatedAt, syncState: 'pending' })
  await queueMutation({
    userId,
    endpoint: '/api/farms',
    method: 'POST',
    updatedAt,
    body: {
      id,
      name: input.name,
      location: farm.location,
      totalSizeAcres: input.totalSizeAcres,
    },
  })
  await opportunisticSync()
  return farm
}

export async function addCropOfflineFirst(userId: string, farmId: string, input: {
  cropType: string
  variety?: string
  plantingDate: string
  expectedHarvestDate: string
  expectedYieldKg?: number
  plotLabel?: string
  plotSizeAcres?: number
}) {
  const record = await getFarm(userId, farmId)
  if (!record) throw new Error('Farm is not available on this device yet')

  const id = objectId()
  const updatedAt = new Date().toISOString()
  const crop = {
    _id: id,
    ...input,
    expectedYieldKg: Number(input.expectedYieldKg ?? 0),
    plotSizeAcres: Number(input.plotSizeAcres ?? 0),
    status: 'Planted',
    tasks: [],
    updatedAt,
  }
  const farm: any = { ...record.payload }
  farm.crops = [...(farm.crops ?? []), crop]
  farm.updatedAt = updatedAt

  await cacheFarm({ ...record, payload: farm, updatedAt, syncState: 'pending' })
  await queueMutation({
    userId,
    endpoint: `/api/farms/${farmId}/crops`,
    method: 'POST',
    updatedAt,
    body: { id, ...input, status: 'Planted' },
  })
  await opportunisticSync()
  return crop
}

export async function logFinanceOfflineFirst(userId: string, farmId: string, input: {
  type: 'Expense' | 'Revenue'
  category: 'Seeds' | 'Fertilizer' | 'Labor' | 'Equipment' | 'Crop_Sales'
  amount: number
  date: string
  description?: string
  cropId?: string | null
}) {
  const record = await getFarm(userId, farmId)
  if (!record) throw new Error('Farm is not available on this device yet')

  const id = objectId()
  const updatedAt = new Date().toISOString()
  const log = { _id: id, ...input, amount: Number(input.amount), updatedAt }
  const farm: any = { ...record.payload }
  farm.financialLogs = [...(farm.financialLogs ?? []), log]
  farm.updatedAt = updatedAt

  await cacheFarm({ ...record, payload: farm, updatedAt, syncState: 'pending' })
  await queueMutation({
    userId,
    endpoint: '/api/finance',
    method: 'POST',
    updatedAt,
    body: { id, farmId, ...input },
  })
  await opportunisticSync()
  return log
}

export async function toggleTaskOfflineFirst(userId: string, farmId: string, cropId: string, taskId: string, completed: boolean) {
  const record = await getFarm(userId, farmId)
  if (!record) throw new Error('Farm is not available on this device yet')

  const updatedAt = new Date().toISOString()
  const farm: any = { ...record.payload }
  farm.crops = (farm.crops ?? []).map((crop: any) => crop._id !== cropId ? crop : {
    ...crop,
    tasks: (crop.tasks ?? []).map((task: any) => task._id !== taskId ? task : { ...task, completed, updatedAt }),
  })
  farm.updatedAt = updatedAt

  await cacheFarm({ ...record, payload: farm, updatedAt, syncState: 'pending' })
  await queueMutation({
    userId,
    endpoint: `/api/farms/${farmId}/crops`,
    method: 'PATCH',
    updatedAt,
    body: { cropId, taskId, taskPatch: { completed } },
  })
  await opportunisticSync()
}
