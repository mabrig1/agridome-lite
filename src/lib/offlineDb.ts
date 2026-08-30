'use client'

import Dexie, { type EntityTable } from 'dexie'

export interface LocalFarmRecord {
  id: string
  userId: string
  payload: Record<string, unknown>
  updatedAt: string
  syncState: 'synced' | 'pending'
}

export interface SyncMutation {
  id: string
  userId: string
  endpoint: string
  method: 'POST' | 'PATCH' | 'DELETE'
  body: Record<string, unknown>
  createdAt: string
  updatedAt: string
  retries: number
  lastError?: string
}

class AgriDomeOfflineDB extends Dexie {
  farms!: EntityTable<LocalFarmRecord, 'id'>
  syncQueue!: EntityTable<SyncMutation, 'id'>

  constructor() {
    super('agridome-lite')
    this.version(1).stores({
      farms: '&id, userId, updatedAt, syncState',
      syncQueue: '&id, userId, createdAt, updatedAt, retries',
    })
  }
}

let instance: AgriDomeOfflineDB | null = null

function getDb() {
  if (typeof indexedDB === 'undefined') return null
  if (!instance) instance = new AgriDomeOfflineDB()
  return instance
}

export async function cacheFarm(record: LocalFarmRecord) {
  const db = getDb()
  if (!db) return
  await db.farms.put(record)
}

export async function getCachedFarms(userId: string) {
  const db = getDb()
  if (!db) return []
  return db.farms.where('userId').equals(userId).reverse().sortBy('updatedAt')
}

export async function queueMutation(input: Omit<SyncMutation, 'id' | 'createdAt' | 'updatedAt' | 'retries'> & { updatedAt?: string }) {
  const db = getDb()
  if (!db) return null

  const now = input.updatedAt ?? new Date().toISOString()
  const mutation: SyncMutation = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: now,
    retries: 0,
    body: { ...input.body, updatedAt: now },
  }

  await db.syncQueue.add(mutation)
  return mutation
}

export async function getPendingSyncCount() {
  const db = getDb()
  return db ? db.syncQueue.count() : 0
}

export async function syncPendingChanges() {
  const db = getDb()
  if (!db || typeof navigator === 'undefined' || !navigator.onLine) {
    return { synced: 0, remaining: db ? await db.syncQueue.count() : 0 }
  }

  const pending = await db.syncQueue.orderBy('createdAt').toArray()
  let synced = 0

  for (const mutation of pending) {
    try {
      const response = await fetch(mutation.endpoint, {
        method: mutation.method,
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: mutation.method === 'DELETE' ? undefined : JSON.stringify(mutation.body),
      })

      if (response.status === 401) {
        throw new Error('Your session expired. Sign in again before syncing queued changes.')
      }
      if (!response.ok) {
        const message = await response.text()
        throw new Error(`${response.status}: ${message.slice(0, 240)}`)
      }

      await db.syncQueue.delete(mutation.id)
      synced += 1
    } catch (error) {
      await db.syncQueue.update(mutation.id, {
        retries: mutation.retries + 1,
        lastError: error instanceof Error ? error.message : 'Sync failed',
      })
    }
  }

  return { synced, remaining: await db.syncQueue.count() }
}

export function installConnectivitySync(onSync?: (result: { synced: number; remaining: number }) => void) {
  if (typeof window === 'undefined') return () => undefined

  const handleOnline = async () => {
    const result = await syncPendingChanges()
    onSync?.(result)
  }

  window.addEventListener('online', handleOnline)
  if (navigator.onLine) void handleOnline()

  return () => window.removeEventListener('online', handleOnline)
}
