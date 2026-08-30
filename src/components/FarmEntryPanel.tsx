'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Banknote, Mail, MapPin, Plus, Sprout, X } from 'lucide-react'
import ProfileBillingCard from '@/components/ProfileBillingCard'
import { addCropOfflineFirst, createFarmOfflineFirst, logFinanceOfflineFirst } from '@/lib/farmStore'

interface FarmOption {
  _id: string
  name: string
  crops?: Array<{ status?: string }>
}

interface ProfileData {
  name: string
  email?: string | null
  preferredLanguage: 'en' | 'ha' | 'sw' | 'fr'
}

interface Props {
  userId: string
  farms: FarmOption[]
  selectedFarmId: string
  tier: 'free' | 'pro'
  onChanged: () => void | Promise<void>
}

export default function FarmEntryPanel({ userId, farms, selectedFarmId, tier, onChanged }: Props) {
  const [mode, setMode] = useState<'farm' | 'crop' | 'finance' | 'profile' | null>(farms.length ? null : 'farm')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const activePlots = useMemo(
    () => farms.flatMap(farm => farm.crops ?? []).filter(crop => ['Planted', 'Growing'].includes(crop.status ?? '')).length,
    [farms]
  )
  const cropBlocked = tier === 'free' && activePlots >= 2

  async function loadProfile() {
    setError('')
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load profile')
      setProfile(payload.user as ProfileData)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load profile')
    }
  }

  async function openProfile() {
    setMode('profile')
    await loadProfile()
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">Record farm activity</h3>
          <p className="text-xs text-muted-foreground">Saved on this device first, then synced automatically.</p>
        </div>
        {mode ? <button onClick={() => setMode(null)} className="rounded-lg border border-border p-2" aria-label="Close entry form"><X className="h-4 w-4" /></button> : null}
      </div>

      {!mode ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          <Action icon={MapPin} label="Farm" onClick={() => setMode('farm')} />
          <Action icon={Sprout} label="Crop" onClick={() => setMode('crop')} disabled={!farms.length || cropBlocked} />
          <Action icon={Banknote} label="Money" onClick={() => setMode('finance')} disabled={!farms.length} />
          <Action icon={Mail} label="Profile" onClick={() => void openProfile()} />
        </div>
      ) : null}

      {cropBlocked && !mode ? <p className="mt-2 text-xs text-amber-500">Lite supports 2 active plots. Upgrade to Pro to add more.</p> : null}
      {error ? <p className="mt-3 rounded-lg bg-red-500/10 p-2 text-sm text-red-500">{error}</p> : null}

      {mode === 'farm' ? <FarmForm userId={userId} busy={busy} setBusy={setBusy} setError={setError} done={async () => { setMode(null); await onChanged() }} /> : null}
      {mode === 'crop' ? <CropForm userId={userId} farmId={selectedFarmId || farms[0]?._id} busy={busy} setBusy={setBusy} setError={setError} done={async () => { setMode(null); await onChanged() }} /> : null}
      {mode === 'finance' ? <FinanceForm userId={userId} farmId={selectedFarmId || farms[0]?._id} busy={busy} setBusy={setBusy} setError={setError} done={async () => { setMode(null); await onChanged() }} /> : null}
      {mode === 'profile' && profile ? <div className="mt-4"><ProfileBillingCard user={profile} onUpdated={loadProfile} /></div> : null}
      {mode === 'profile' && !profile && !error ? <p className="mt-4 text-sm text-muted-foreground">Loading profile…</p> : null}
    </div>
  )
}

function Action({ icon: Icon, label, onClick, disabled = false }: { icon: typeof Plus; label: string; onClick: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className="flex min-w-0 flex-col items-center gap-1 rounded-lg border border-border p-2.5 text-[11px] font-semibold disabled:opacity-40"><Icon className="h-5 w-5 text-gold" /><span className="truncate">{label}</span></button>
}

function FarmForm({ userId, busy, setBusy, setError, done }: FormProps) {
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [size, setSize] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  function useLocation() {
    if (!navigator.geolocation) return setError('Location is not supported on this device.')
    navigator.geolocation.getCurrentPosition(
      position => { setLatitude(String(position.coords.latitude)); setLongitude(String(position.coords.longitude)); setError('') },
      () => setError('Location permission was not granted.')
    )
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      await createFarmOfflineFirst(userId, { name: name.trim(), region: region.trim(), totalSizeAcres: Number(size), latitude: Number(latitude), longitude: Number(longitude) })
      await done()
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save farm') } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-2">
      <input required value={name} onChange={e => setName(e.target.value)} placeholder="Farm name" className="w-full rounded-lg border border-border bg-background p-3" />
      <input required value={region} onChange={e => setRegion(e.target.value)} placeholder="State / LGA / region" className="w-full rounded-lg border border-border bg-background p-3" />
      <input required min="0" step="0.01" type="number" value={size} onChange={e => setSize(e.target.value)} placeholder="Total acres" className="w-full rounded-lg border border-border bg-background p-3" />
      <div className="grid grid-cols-2 gap-2"><input required type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="Latitude" className="rounded-lg border border-border bg-background p-3" /><input required type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="Longitude" className="rounded-lg border border-border bg-background p-3" /></div>
      <button type="button" onClick={useLocation} className="w-full rounded-lg border border-border p-2 text-sm">Use my current location</button>
      <Save busy={busy} label="Save farm" />
    </form>
  )
}

function CropForm({ userId, farmId, busy, setBusy, setError, done }: FormProps & { farmId: string }) {
  const today = new Date().toISOString().slice(0, 10)
  const [cropType, setCropType] = useState('')
  const [variety, setVariety] = useState('')
  const [plantingDate, setPlantingDate] = useState(today)
  const [harvestDate, setHarvestDate] = useState('')
  const [plotLabel, setPlotLabel] = useState('')
  const [plotSize, setPlotSize] = useState('')
  const [yieldKg, setYieldKg] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      await addCropOfflineFirst(userId, farmId, { cropType: cropType.trim(), variety: variety.trim(), plantingDate, expectedHarvestDate: harvestDate, plotLabel: plotLabel.trim(), plotSizeAcres: Number(plotSize || 0), expectedYieldKg: Number(yieldKg || 0) })
      await done()
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save crop') } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-2">
      <input required value={cropType} onChange={e => setCropType(e.target.value)} placeholder="Crop (e.g. radish, onion)" className="w-full rounded-lg border border-border bg-background p-3" />
      <input value={variety} onChange={e => setVariety(e.target.value)} placeholder="Variety (optional)" className="w-full rounded-lg border border-border bg-background p-3" />
      <label className="block text-xs text-muted-foreground">Planting date<input required type="date" value={plantingDate} onChange={e => setPlantingDate(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-foreground" /></label>
      <label className="block text-xs text-muted-foreground">Expected harvest<input required type="date" value={harvestDate} onChange={e => setHarvestDate(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background p-3 text-foreground" /></label>
      <div className="grid grid-cols-2 gap-2"><input value={plotLabel} onChange={e => setPlotLabel(e.target.value)} placeholder="Plot label" className="rounded-lg border border-border bg-background p-3" /><input min="0" step="0.01" type="number" value={plotSize} onChange={e => setPlotSize(e.target.value)} placeholder="Plot acres" className="rounded-lg border border-border bg-background p-3" /></div>
      <input min="0" step="0.1" type="number" value={yieldKg} onChange={e => setYieldKg(e.target.value)} placeholder="Projected harvest kg" className="w-full rounded-lg border border-border bg-background p-3" />
      <Save busy={busy} label="Save crop" />
    </form>
  )
}

function FinanceForm({ userId, farmId, busy, setBusy, setError, done }: FormProps & { farmId: string }) {
  const [type, setType] = useState<'Expense' | 'Revenue'>('Expense')
  const [category, setCategory] = useState<'Seeds' | 'Fertilizer' | 'Labor' | 'Equipment' | 'Crop_Sales'>('Seeds')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      await logFinanceOfflineFirst(userId, farmId, { type, category: type === 'Revenue' ? 'Crop_Sales' : category, amount: Number(amount), date, description: description.trim() })
      await done()
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save transaction') } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-2">
      <div className="grid grid-cols-2 gap-2"><select value={type} onChange={e => setType(e.target.value as 'Expense' | 'Revenue')} className="rounded-lg border border-border bg-background p-3"><option>Expense</option><option>Revenue</option></select>{type === 'Expense' ? <select value={category} onChange={e => setCategory(e.target.value as typeof category)} className="rounded-lg border border-border bg-background p-3"><option>Seeds</option><option>Fertilizer</option><option>Labor</option><option>Equipment</option></select> : <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">Crop sales</div>}</div>
      <input required min="0" step="0.01" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (₦)" className="w-full rounded-lg border border-border bg-background p-3" />
      <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full rounded-lg border border-border bg-background p-3 text-foreground" />
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full rounded-lg border border-border bg-background p-3" />
      <Save busy={busy} label="Save transaction" />
    </form>
  )
}

interface FormProps { userId: string; busy: boolean; setBusy: (value: boolean) => void; setError: (value: string) => void; done: () => void | Promise<void> }
function Save({ busy, label }: { busy: boolean; label: string }) { return <button disabled={busy} className="w-full rounded-lg bg-gold px-4 py-3 font-semibold text-black disabled:opacity-50">{busy ? 'Saving…' : label}</button> }
