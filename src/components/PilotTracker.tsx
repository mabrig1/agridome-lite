'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, ClipboardCheck, Download, ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  PilotBaseline,
  PilotProfile,
  PilotWeeklyOutcome,
  storage,
} from '@/lib/storage'
import { downloadPilotCsv, downloadPilotJson } from '@/lib/pilotExport'

type BaselineFormState = {
  crop: string
  farmType: PilotBaseline['farmType']
  areaSqm: string
  experienceYears: string
  weeklyHarvestKg: string
  weeklyIncomeNgn: string
  pestLossPercent: string
}

const EMPTY_BASELINE: BaselineFormState = {
  crop: '',
  farmType: 'greenhouse',
  areaSqm: '',
  experienceYears: '',
  weeklyHarvestKg: '',
  weeklyIncomeNgn: '',
  pestLossPercent: '',
}

const EMPTY_OUTCOME = {
  weekStart: new Date().toISOString().slice(0, 10),
  crop: '',
  harvestKg: '',
  incomeNgn: '',
  costsNgn: '',
  pestLossPercent: '',
  appUsedDays: '',
  notes: '',
}

function makeParticipantCode() {
  return `AGD-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).slice(2, 4).toUpperCase()}`
}

function numberOrZero(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function PilotTracker() {
  const [profile, setProfile] = useState<PilotProfile | null>(null)
  const [baseline, setBaseline] = useState<PilotBaseline | null>(null)
  const [outcomes, setOutcomes] = useState<PilotWeeklyOutcome[]>([])
  const [consent, setConsent] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', location: '', phone: '' })
  const [baselineForm, setBaselineForm] = useState(EMPTY_BASELINE)
  const [outcomeForm, setOutcomeForm] = useState(EMPTY_OUTCOME)

  useEffect(() => {
    setProfile(storage.getPilotProfile())
    setBaseline(storage.getPilotBaseline())
    setOutcomes(storage.getPilotOutcomes())
  }, [])

  const summary = useMemo(() => {
    if (!outcomes.length) return null
    const harvest = outcomes.reduce((sum, item) => sum + item.harvestKg, 0)
    const income = outcomes.reduce((sum, item) => sum + item.incomeNgn, 0)
    const costs = outcomes.reduce((sum, item) => sum + item.costsNgn, 0)
    const averageLoss = outcomes.reduce((sum, item) => sum + item.pestLossPercent, 0) / outcomes.length
    return { harvest, income, costs, averageLoss }
  }, [outcomes])

  function registerParticipant() {
    if (!consent || !profileForm.location.trim()) return
    const next: PilotProfile = {
      participantCode: makeParticipantCode(),
      name: profileForm.name.trim() || undefined,
      location: profileForm.location.trim(),
      phone: profileForm.phone.trim() || undefined,
      consentedAt: new Date().toISOString(),
      consentVersion: '1.0',
    }
    storage.savePilotProfile(next)
    setProfile(next)
  }

  function saveBaseline() {
    if (!profile || !baselineForm.crop.trim() || numberOrZero(baselineForm.areaSqm) <= 0) return
    const next: PilotBaseline = {
      participantCode: profile.participantCode,
      recordedAt: new Date().toISOString(),
      crop: baselineForm.crop.trim(),
      farmType: baselineForm.farmType,
      areaSqm: numberOrZero(baselineForm.areaSqm),
      experienceYears: numberOrZero(baselineForm.experienceYears),
      weeklyHarvestKg: numberOrZero(baselineForm.weeklyHarvestKg),
      weeklyIncomeNgn: numberOrZero(baselineForm.weeklyIncomeNgn),
      pestLossPercent: numberOrZero(baselineForm.pestLossPercent),
    }
    storage.savePilotBaseline(next)
    setBaseline(next)
  }

  function saveOutcome() {
    if (!profile || !outcomeForm.crop.trim() || !outcomeForm.weekStart) return
    const next: PilotWeeklyOutcome = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      participantCode: profile.participantCode,
      recordedAt: new Date().toISOString(),
      weekStart: outcomeForm.weekStart,
      crop: outcomeForm.crop.trim(),
      harvestKg: numberOrZero(outcomeForm.harvestKg),
      incomeNgn: numberOrZero(outcomeForm.incomeNgn),
      costsNgn: numberOrZero(outcomeForm.costsNgn),
      pestLossPercent: numberOrZero(outcomeForm.pestLossPercent),
      appUsedDays: Math.min(7, numberOrZero(outcomeForm.appUsedDays)),
      notes: outcomeForm.notes.trim() || undefined,
    }
    storage.savePilotOutcome(next)
    setOutcomes(storage.getPilotOutcomes())
    setOutcomeForm(current => ({ ...EMPTY_OUTCOME, crop: current.crop }))
  }

  function deletePilotData() {
    if (!window.confirm('Delete this participant profile and every pilot record stored on this device?')) return
    storage.clearPilotData()
    setProfile(null)
    setBaseline(null)
    setOutcomes([])
    setConsent(false)
    setProfileForm({ name: '', location: '', phone: '' })
    setBaselineForm(EMPTY_BASELINE)
    setOutcomeForm(EMPTY_OUTCOME)
  }

  if (!profile) {
    return (
      <div className="p-4 space-y-4">
        <Card className="border-gold/30">
          <CardHeader>
            <div className="flex items-center gap-2 text-gold">
              <ClipboardCheck className="w-5 h-5" />
              <CardTitle className="text-base">Join the AgriDome Pilot</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Record starting conditions and one short update each week. Your records help measure whether AgriDome improves harvests, income and pest response.
            </p>
            <div className="rounded-xl border border-emerald-700/40 bg-emerald-500/5 p-3 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <ShieldCheck className="w-4 h-4" /> Privacy and voluntary consent
              </div>
              <p>Participation is voluntary. Data stays on this device until you export it. You may stop and delete all records at any time. A name and phone number are optional.</p>
            </div>
            <div className="space-y-3">
              <div>
                <label htmlFor="pilot-name" className="text-xs text-muted-foreground mb-1 block">Name or nickname (optional)</label>
                <Input id="pilot-name" value={profileForm.name} onChange={event => setProfileForm(form => ({ ...form, name: event.target.value }))} />
              </div>
              <div>
                <label htmlFor="pilot-location" className="text-xs text-muted-foreground mb-1 block">Community and state *</label>
                <Input id="pilot-location" placeholder="e.g. Nsukka, Enugu" value={profileForm.location} onChange={event => setProfileForm(form => ({ ...form, location: event.target.value }))} />
              </div>
              <div>
                <label htmlFor="pilot-phone" className="text-xs text-muted-foreground mb-1 block">Phone (optional; for pilot follow-up)</label>
                <Input id="pilot-phone" inputMode="tel" value={profileForm.phone} onChange={event => setProfileForm(form => ({ ...form, phone: event.target.value }))} />
              </div>
              <label className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm cursor-pointer">
                <input type="checkbox" className="mt-1 accent-amber-500" checked={consent} onChange={event => setConsent(event.target.checked)} />
                <span>I understand the pilot and voluntarily agree to record my farm data for evaluation.</span>
              </label>
              <Button variant="gold" className="w-full gap-2" disabled={!consent || !profileForm.location.trim()} onClick={registerParticipant}>
                <UserPlus className="w-4 h-4" /> Create pilot profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="py-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Participant</p>
            <p className="font-mono text-gold font-semibold">{profile.participantCode}</p>
            <p className="text-xs text-muted-foreground">{profile.location}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="outline" onClick={() => downloadPilotJson(profile, baseline, outcomes)} disabled={!baseline && !outcomes.length} className="gap-2">
              <Download className="w-4 h-4" /> Pilot file
            </Button>
            <Button size="sm" variant="ghost" onClick={() => downloadPilotCsv(profile, baseline, outcomes)} disabled={!outcomes.length} className="gap-2 text-xs">
              CSV copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {!baseline ? (
        <Card className="border-gold/30">
          <CardHeader><CardTitle className="text-base">Record your starting point</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Complete this once, before relying on AgriDome advice. Use your best estimate if records are unavailable.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label htmlFor="baseline-crop" className="text-xs text-muted-foreground mb-1 block">Main crop *</label>
                <Input id="baseline-crop" placeholder="e.g. Tomato" value={baselineForm.crop} onChange={event => setBaselineForm(form => ({ ...form, crop: event.target.value }))} />
              </div>
              <div>
                <label htmlFor="farm-type" className="text-xs text-muted-foreground mb-1 block">Farm type</label>
                <select id="farm-type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={baselineForm.farmType} onChange={event => setBaselineForm(form => ({ ...form, farmType: event.target.value as PilotBaseline['farmType'] }))}>
                  <option value="greenhouse">Greenhouse</option>
                  <option value="open-field">Open field</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <NumberField id="baseline-area" label="Cultivated area (m²) *" value={baselineForm.areaSqm} onChange={value => setBaselineForm(form => ({ ...form, areaSqm: value }))} />
              <NumberField id="baseline-experience" label="Experience (years)" value={baselineForm.experienceYears} onChange={value => setBaselineForm(form => ({ ...form, experienceYears: value }))} />
              <NumberField id="baseline-harvest" label="Weekly harvest (kg)" value={baselineForm.weeklyHarvestKg} onChange={value => setBaselineForm(form => ({ ...form, weeklyHarvestKg: value }))} />
              <NumberField id="baseline-income" label="Weekly income (₦)" value={baselineForm.weeklyIncomeNgn} onChange={value => setBaselineForm(form => ({ ...form, weeklyIncomeNgn: value }))} />
              <NumberField id="baseline-loss" label="Pest loss estimate (%)" value={baselineForm.pestLossPercent} onChange={value => setBaselineForm(form => ({ ...form, pestLossPercent: value }))} max={100} />
            </div>
            <Button variant="gold" className="w-full" disabled={!baselineForm.crop.trim() || numberOrZero(baselineForm.areaSqm) <= 0} onClick={saveBaseline}>Save baseline</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {summary && (
            <Card>
              <CardHeader><div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-gold" /><CardTitle className="text-base">Pilot progress</CardTitle></div></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <Metric label="Weeks recorded" value={String(outcomes.length)} />
                <Metric label="Total harvest" value={`${summary.harvest.toFixed(1)} kg`} />
                <Metric label="Net income" value={`₦${Math.round(summary.income - summary.costs).toLocaleString()}`} />
                <Metric label="Average pest loss" value={`${summary.averageLoss.toFixed(1)}%`} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Weekly outcome</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="week-start" className="text-xs text-muted-foreground mb-1 block">Week starting *</label>
                  <Input id="week-start" type="date" value={outcomeForm.weekStart} onChange={event => setOutcomeForm(form => ({ ...form, weekStart: event.target.value }))} />
                </div>
                <div>
                  <label htmlFor="weekly-crop" className="text-xs text-muted-foreground mb-1 block">Crop *</label>
                  <Input id="weekly-crop" value={outcomeForm.crop} placeholder={baseline.crop} onChange={event => setOutcomeForm(form => ({ ...form, crop: event.target.value }))} />
                </div>
                <NumberField id="weekly-harvest" label="Harvest (kg)" value={outcomeForm.harvestKg} onChange={value => setOutcomeForm(form => ({ ...form, harvestKg: value }))} />
                <NumberField id="weekly-income" label="Sales income (₦)" value={outcomeForm.incomeNgn} onChange={value => setOutcomeForm(form => ({ ...form, incomeNgn: value }))} />
                <NumberField id="weekly-costs" label="Farm costs (₦)" value={outcomeForm.costsNgn} onChange={value => setOutcomeForm(form => ({ ...form, costsNgn: value }))} />
                <NumberField id="weekly-loss" label="Pest loss (%)" value={outcomeForm.pestLossPercent} onChange={value => setOutcomeForm(form => ({ ...form, pestLossPercent: value }))} max={100} />
                <NumberField id="weekly-use" label="Days AgriDome used" value={outcomeForm.appUsedDays} onChange={value => setOutcomeForm(form => ({ ...form, appUsedDays: value }))} max={7} />
                <div>
                  <label htmlFor="weekly-notes" className="text-xs text-muted-foreground mb-1 block">Notes</label>
                  <Input id="weekly-notes" placeholder="Pests, weather, actions…" value={outcomeForm.notes} onChange={event => setOutcomeForm(form => ({ ...form, notes: event.target.value }))} />
                </div>
              </div>
              <Button variant="gold" className="w-full" disabled={!outcomeForm.weekStart || !outcomeForm.crop.trim()} onClick={saveOutcome}>Save weekly outcome</Button>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardContent className="py-4 space-y-3">
          <p className="text-xs text-muted-foreground">AgriDome offers decision support, not a guaranteed diagnosis. Confirm serious crop disease or chemical-treatment decisions with a qualified extension officer.</p>
          <Button variant="ghost" className="w-full text-red-400 hover:text-red-300 gap-2" onClick={deletePilotData}>
            <Trash2 className="w-4 h-4" /> Withdraw and delete pilot data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function NumberField({ id, label, value, onChange, max }: { id: string; label: string; value: string; onChange: (value: string) => void; max?: number }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <Input id={id} type="number" min="0" max={max} step="any" inputMode="decimal" value={value} onChange={event => onChange(event.target.value)} />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/50 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="font-semibold text-foreground mt-1">{value}</p></div>
}
