'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, LogOut, RefreshCw, Sprout, TrendingDown, TrendingUp, WalletCards } from 'lucide-react'
import FarmEntryPanel from '@/components/FarmEntryPanel'
import PhoneAuthPanel from '@/components/PhoneAuthPanel'
import { cacheCloudFarms } from '@/lib/farmStore'
import { exportFinanceCsv, exportFinancePdf } from '@/lib/financialExport'
import { getCachedFarms, getPendingSyncCount, installConnectivitySync, syncPendingChanges } from '@/lib/offlineDb'
import { t, type SupportedLanguage } from '@/lib/i18n'

interface SessionUser {
  id: string
  name: string
  phone: string
  email?: string | null
  role: 'farmer' | 'coop_admin' | 'agronomist'
  preferredLanguage: SupportedLanguage
  subscription?: { tier?: 'free' | 'pro'; status?: string }
}

interface FarmCrop {
  _id: string
  cropType: string
  status: string
  plotLabel?: string
}

interface FarmLog {
  _id?: string
  type: 'Expense' | 'Revenue'
  category: string
  amount: number
  date: string
  description?: string
  cropId?: string | null
}

interface Farm {
  _id: string
  name: string
  totalSizeAcres: number
  location: { region: string }
  crops: FarmCrop[]
  financialLogs?: FarmLog[]
}

interface FinancePayload {
  logs: FarmLog[]
  summary: { expenses: number; revenue: number; netProfit: number; marginPercent: number }
  byCrop: Array<{ cropId: string; cropType: string; plotLabel?: string; revenue: number; expenses: number; netProfit: number; marginPercent: number }>
}

interface WeatherPayload {
  advice: Array<{ severity: 'info' | 'warning' | 'urgent'; code: string; message: string }>
}

interface SupplierOffer {
  _id: string
  supplierName: string
  title: string
  category: string
  url: string
}

const emptyFinance: FinancePayload = {
  logs: [],
  summary: { expenses: 0, revenue: 0, netProfit: 0, marginPercent: 0 },
  byCrop: [],
}

function summarizeLogs(logs: FarmLog[]) {
  const expenses = logs.filter(log => log.type === 'Expense').reduce((sum, log) => sum + Number(log.amount || 0), 0)
  const revenue = logs.filter(log => log.type === 'Revenue').reduce((sum, log) => sum + Number(log.amount || 0), 0)
  const netProfit = revenue - expenses
  return { expenses, revenue, netProfit, marginPercent: revenue > 0 ? (netProfit / revenue) * 100 : 0 }
}

function localFinance(farm: Farm | null): FinancePayload {
  if (!farm) return emptyFinance
  const logs = farm.financialLogs ?? []
  return {
    logs,
    summary: summarizeLogs(logs),
    byCrop: (farm.crops ?? []).map(crop => {
      const cropLogs = logs.filter(log => log.cropId && String(log.cropId) === crop._id)
      return { cropId: crop._id, cropType: crop.cropType, plotLabel: crop.plotLabel, ...summarizeLogs(cropLogs) }
    }),
  }
}

export default function FarmOperationsDashboard() {
  const [language, setLanguage] = useState<SupportedLanguage>('en')
  const [isOnline, setIsOnline] = useState(true)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [farms, setFarms] = useState<Farm[]>([])
  const [selectedFarmId, setSelectedFarmId] = useState('')
  const [finance, setFinance] = useState<FinancePayload>(emptyFinance)
  const [weather, setWeather] = useState<WeatherPayload | null>(null)
  const [suppliers, setSuppliers] = useState<SupplierOffer[]>([])
  const [pendingSync, setPendingSync] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedFarm = useMemo(
    () => farms.find(farm => farm._id === selectedFarmId) ?? farms[0] ?? null,
    [farms, selectedFarmId]
  )

  const loadSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!response.ok) {
        setUser(null)
        return
      }
      const payload = await response.json()
      const nextUser = payload.user as SessionUser
      setUser(nextUser)
      if (nextUser.preferredLanguage) setLanguage(nextUser.preferredLanguage)
    } finally {
      setAuthChecked(true)
    }
  }, [])

  const refreshSyncCount = useCallback(async () => {
    setPendingSync(await getPendingSyncCount())
  }, [])

  const loadCachedData = useCallback(async () => {
    if (!user?.id) return
    const cached = await getCachedFarms(user.id)
    const nextFarms = cached.map(record => record.payload as unknown as Farm)
    setFarms(nextFarms)
    if (nextFarms.length && !nextFarms.some(farm => farm._id === selectedFarmId)) {
      setSelectedFarmId(nextFarms[0]._id)
    }
  }, [selectedFarmId, user?.id])

  const loadCloudData = useCallback(async () => {
    if (!user?.id) return
    if (!navigator.onLine) {
      await loadCachedData()
      return
    }

    setLoading(true)
    setError('')
    try {
      const farmsResponse = await fetch('/api/farms', { cache: 'no-store' })
      if (farmsResponse.status === 401) {
        setUser(null)
        return
      }
      if (!farmsResponse.ok) throw new Error('Unable to load farms')
      const farmsPayload = await farmsResponse.json()
      const nextFarms: Farm[] = farmsPayload.farms ?? []
      setFarms(nextFarms)
      await cacheCloudFarms(user.id, nextFarms as unknown as Array<Record<string, any>>)
      if (nextFarms.length && !nextFarms.some(farm => farm._id === selectedFarmId)) {
        setSelectedFarmId(nextFarms[0]._id)
      }
    } catch (loadError) {
      await loadCachedData()
      setError(loadError instanceof Error ? `${loadError.message}. Showing saved device data.` : 'Showing saved device data.')
    } finally {
      setLoading(false)
    }
  }, [loadCachedData, selectedFarmId, user?.id])

  const loadFarmIntelligence = useCallback(async () => {
    if (!user?.id || !selectedFarm?._id) {
      setFinance(emptyFinance)
      return
    }

    if (!navigator.onLine) {
      setFinance(localFinance(selectedFarm))
      setWeather(null)
      return
    }

    const farmId = selectedFarm._id
    const [financeResponse, weatherResponse, supplierResponse] = await Promise.all([
      fetch(`/api/finance?farmId=${encodeURIComponent(farmId)}`, { cache: 'no-store' }),
      fetch(`/api/weather?farmId=${encodeURIComponent(farmId)}`, { cache: 'no-store' }),
      fetch(`/api/suppliers?region=${encodeURIComponent(selectedFarm.location.region)}`, { cache: 'no-store' }),
    ])

    if (financeResponse.ok) setFinance(await financeResponse.json())
    else setFinance(localFinance(selectedFarm))
    if (weatherResponse.ok) setWeather(await weatherResponse.json())
    if (supplierResponse.ok) setSuppliers((await supplierResponse.json()).offers ?? [])
  }, [selectedFarm, user?.id])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const online = () => setIsOnline(true)
    const offline = () => setIsOnline(false)
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    void loadSession()
    void refreshSyncCount()

    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
    }
  }, [loadSession, refreshSyncCount])

  useEffect(() => {
    if (!user?.id) return
    const uninstallSync = installConnectivitySync(() => {
      void refreshSyncCount()
      void loadCloudData()
    })
    return uninstallSync
  }, [loadCloudData, refreshSyncCount, user?.id])

  useEffect(() => {
    void loadCloudData()
  }, [isOnline, loadCloudData])

  useEffect(() => {
    void loadFarmIntelligence()
  }, [isOnline, loadFarmIntelligence])

  async function handleManualSync() {
    await syncPendingChanges()
    await refreshSyncCount()
    await loadCloudData()
  }

  async function handleEntryChanged() {
    await loadCachedData()
    await refreshSyncCount()
    if (navigator.onLine) await loadCloudData()
  }

  async function handleUpgrade() {
    if (!user) return
    const response = await fetch('/api/billing/initialize', { method: 'POST' })
    const payload = await response.json()
    if (response.ok && payload.authorizationUrl) window.location.assign(payload.authorizationUrl)
    else setError(payload.error || 'Unable to start Pro checkout')
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setFarms([])
    setSelectedFarmId('')
    setFinance(emptyFinance)
    setWeather(null)
  }

  return (
    <section className="min-h-screen bg-background px-4 py-4 text-foreground">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">AgriDome Lite</p>
            <h2 className="mt-1 text-2xl font-bold">{t(language, 'dashboard')}</h2>
            {user ? <p className="mt-1 text-xs text-muted-foreground">{user.name} • {user.subscription?.tier === 'pro' ? 'Pro' : 'Lite'}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <select value={language} onChange={event => setLanguage(event.target.value as SupportedLanguage)} className="rounded-lg border border-border bg-card px-2 py-2 text-sm" aria-label="Language">
              <option value="en">EN</option><option value="ha">HA</option><option value="sw">SW</option><option value="fr">FR</option>
            </select>
            {user ? <button onClick={handleLogout} className="rounded-lg border border-border p-2 text-muted-foreground" aria-label="Sign out"><LogOut className="h-4 w-4" /></button> : null}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`} />
            {isOnline ? t(language, 'online') : t(language, 'offline')}
            {pendingSync > 0 ? <span className="text-muted-foreground">• {pendingSync} queued</span> : null}
          </div>
          <button onClick={handleManualSync} disabled={!isOnline || !user} className="rounded-lg border border-border p-2 disabled:opacity-40" aria-label="Sync now"><RefreshCw className="h-4 w-4" /></button>
        </div>

        {authChecked && !user ? <PhoneAuthPanel onAuthenticated={loadSession} /> : null}
        {!authChecked ? <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Checking secure session…</div> : null}
        {error ? <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm">{error}</div> : null}

        {user ? (
          <>
            {farms.length > 1 ? (
              <select value={selectedFarm?._id ?? ''} onChange={event => setSelectedFarmId(event.target.value)} className="w-full rounded-xl border border-border bg-card p-3">
                {farms.map(farm => <option key={farm._id} value={farm._id}>{farm.name} — {farm.location.region}</option>)}
              </select>
            ) : null}

            <FarmEntryPanel
              userId={user.id}
              farms={farms}
              selectedFarmId={selectedFarm?._id ?? ''}
              tier={user.subscription?.tier ?? 'free'}
              onChanged={handleEntryChanged}
            />

            <div className="grid grid-cols-2 gap-3">
              <Metric icon={TrendingUp} label={t(language, 'revenue')} value={finance.summary.revenue} />
              <Metric icon={TrendingDown} label={t(language, 'expenses')} value={finance.summary.expenses} />
              <Metric icon={WalletCards} label={t(language, 'netProfit')} value={finance.summary.netProfit} />
              <Metric icon={Sprout} label="Margin" value={finance.summary.marginPercent} suffix="%" money={false} />
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{t(language, 'weatherAdvice')}</h3>{loading ? <span className="text-xs text-muted-foreground">Loading…</span> : null}</div>
              <div className="mt-3 space-y-2">
                {(weather?.advice ?? []).map(item => <div key={item.code} className="rounded-lg bg-muted/50 p-3 text-sm">{item.message}</div>)}
                {!weather?.advice?.length ? <p className="text-sm text-muted-foreground">{isOnline ? 'Weather advice will appear after you add a farm with location coordinates.' : 'Weather advice refreshes when connectivity returns.'}</p> : null}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">Crop profitability</h3><span className="text-xs text-muted-foreground">per plot</span></div>
              <div className="mt-3 space-y-2">
                {finance.byCrop.map(row => (
                  <div key={row.cropId} className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
                    <div><p className="font-medium">{row.cropType}</p><p className="text-xs text-muted-foreground">{row.plotLabel || 'Unlabelled plot'}</p></div>
                    <div className="text-right"><p className="font-semibold">₦{row.netProfit.toLocaleString()}</p><p className="text-xs text-muted-foreground">{row.marginPercent.toFixed(1)}% margin</p></div>
                  </div>
                ))}
                {!finance.byCrop.length ? <p className="text-sm text-muted-foreground">Assign finance entries to crops to see plot-level margins.</p> : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => selectedFarm && exportFinanceCsv(selectedFarm.name, finance.logs)} disabled={!selectedFarm} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-semibold disabled:opacity-40"><Download className="h-4 w-4" /> {t(language, 'exportCsv')}</button>
              <button onClick={() => selectedFarm && exportFinancePdf(selectedFarm.name, selectedFarm.location.region, finance.logs, finance.summary)} disabled={!selectedFarm} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-semibold disabled:opacity-40"><Download className="h-4 w-4" /> {t(language, 'exportPdf')}</button>
            </div>

            <div className="rounded-xl border border-gold/40 bg-gold/10 p-4">
              <h3 className="font-semibold">Pro — unlimited plots + sync</h3>
              <p className="mt-1 text-sm text-muted-foreground">Weather alerts, multi-device cloud sync and bank-ready PDF reporting.</p>
              <button onClick={handleUpgrade} disabled={user.subscription?.tier === 'pro'} className="mt-3 w-full rounded-lg bg-gold px-4 py-3 font-semibold text-black disabled:opacity-40">{user.subscription?.tier === 'pro' ? 'Pro active' : t(language, 'upgradePro')}</button>
            </div>

            {suppliers.length ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold">Verified input suppliers</h3>
                <div className="mt-3 space-y-2">
                  {suppliers.slice(0, 4).map(offer => (
                    <a key={offer._id} href={offer.url} target="_blank" rel="noreferrer sponsored" className="block rounded-lg bg-muted/50 p-3 text-sm"><p className="font-medium">{offer.title}</p><p className="text-xs text-muted-foreground">{offer.supplierName} • {offer.category}</p></a>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  )
}

function Metric({ icon: Icon, label, value, suffix = '', money = true }: { icon: typeof TrendingUp; label: string; value: number; suffix?: string; money?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4" />{label}</div>
      <p className="mt-2 text-lg font-bold">{money ? '₦' : ''}{Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: money ? 0 : 1 })}{suffix}</p>
    </div>
  )
}
