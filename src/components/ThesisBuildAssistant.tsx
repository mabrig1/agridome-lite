'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Hammer, Leaf, Recycle, ShieldCheck, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { storage } from '@/lib/storage'

type MaterialKey = 'frame' | 'cover' | 'fasteners' | 'containers' | 'water'
type BuildMode = 'build' | 'soil'

const MATERIALS: Array<{ key: MaterialKey; label: string; safe: string }> = [
  { key: 'frame', label: 'Frame material', safe: 'Sound bamboo or untreated, structurally sound recovered timber' },
  { key: 'cover', label: 'Crop cover', safe: 'Serviceable greenhouse film or insect net without dangerous contamination' },
  { key: 'fasteners', label: 'Fasteners', safe: 'Reusable wire, rope, cable ties or sound recovered fixings' },
  { key: 'containers', label: 'Bed / wall material', safe: 'Clean PET bottles, sacks or other washable non-hazardous material' },
  { key: 'water', label: 'Watering system', safe: 'Existing hose, containers or reusable drip components' },
]

const HAZARDS = [
  'Pesticide / herbicide containers',
  'Oil, fuel or chemical containers',
  'Medical waste',
  'Rotten / termite-damaged timber',
  'Brittle UV-damaged plastic used structurally',
]

const STORE_KEY = 'agridome_thesis_build_assistant_v1'

export default function ThesisBuildAssistant() {
  const [mode, setMode] = useState<BuildMode>('build')
  const [area, setArea] = useState('20')
  const [budget, setBudget] = useState('0')
  const [materials, setMaterials] = useState<Record<MaterialKey, boolean>>({
    frame: false, cover: false, fasteners: false, containers: false, water: false,
  })
  const [hazardFound, setHazardFound] = useState(false)
  const [evidenceSaved, setEvidenceSaved] = useState<'build' | 'soil' | null>(null)
  const [soil, setSoil] = useState({
    drainsWell: true,
    knownDisease: false,
    suspectedContamination: false,
    tested: false,
    matureOrganicMatter: false,
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw)
      if (saved.area) setArea(String(saved.area))
      if (saved.budget !== undefined) setBudget(String(saved.budget))
      if (saved.materials) setMaterials(saved.materials)
      if (saved.soil) setSoil(saved.soil)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ area, budget, materials, soil }))
    } catch {}
  }, [area, budget, materials, soil])

  const build = useMemo(() => {
    const missing = MATERIALS.filter(item => !materials[item.key])
    const cash = Math.max(0, Number(budget) || 0)
    if (hazardFound) return { level: 'stop', title: 'UNSAFE MATERIAL DETECTED', detail: 'Do not use hazardous or contaminated waste just to reach a ₦0 target.', missing }
    if (missing.length === 0 && cash === 0) return { level: 'good', title: 'ZERO-CASH STRUCTURAL BUILD FEASIBLE', detail: 'All core material categories are available from owned, recovered, donated or exchanged sources. Labour and transport still have economic value.', missing }
    if (missing.length <= 2) return { level: 'watch', title: 'NEAR-ZERO BUILD POSSIBLE', detail: 'Source or safely substitute the missing items before construction. Keep new-material spending within your selected ceiling.', missing }
    return { level: 'watch', title: 'MORE MATERIALS NEEDED', detail: 'Complete the resource audit before starting construction.', missing }
  }, [materials, budget, hazardFound])

  const soilResult = useMemo(() => {
    if (soil.suspectedContamination) return { level: 'stop', title: 'EXPERT REVIEW REQUIRED', detail: 'Do not plant until suspected chemical/heavy contamination is assessed by a qualified laboratory or extension service.' }
    if (!soil.drainsWell) return { level: 'stop', title: 'DRAINAGE CORRECTION REQUIRED', detail: 'Correct waterlogging risk with raised beds, channels or another locally appropriate drainage design before planting.' }
    if (soil.knownDisease) return { level: 'watch', title: 'PRE-PLANT TREATMENT REQUIRED', detail: 'Remove infected residues, sanitize tools and consider moist-soil solarization under tightly sealed clear polyethylene for about 4–6 hot, sunny weeks where conditions are suitable. Escalate severe/recurrent problems.' }
    if (!soil.tested) return { level: 'watch', title: 'SOIL CHECK RECOMMENDED', detail: 'Use a soil test or local extension assessment before applying lime, fertilizer or chemical treatment. Do not dose by guesswork.' }
    return { level: 'good', title: 'SOIL READINESS LOOKS GOOD', detail: 'Maintain sanitation and use only mature, safe organic matter. Record amendments and observations before planting.' }
  }, [soil])

  function saveBuildEvidence() {
    const feasibility = hazardFound
      ? 'unsafe'
      : build.missing.length === 0 && Math.max(0, Number(budget) || 0) === 0
        ? 'zero-cash'
        : build.missing.length <= 2
          ? 'near-zero'
          : 'more-materials'
    storage.saveBuildAssessment({
      recordedAt: new Date().toISOString(),
      areaSqm: Math.max(0, Number(area) || 0),
      cashBudgetNgn: Math.max(0, Number(budget) || 0),
      materials,
      missingMaterialKeys: build.missing.map(item => item.key),
      hazardFound,
      feasibility,
    })
    setEvidenceSaved('build')
    window.setTimeout(() => setEvidenceSaved(null), 1800)
  }

  function saveSoilEvidence() {
    const status = soil.suspectedContamination
      ? 'expert-review'
      : !soil.drainsWell
        ? 'drainage-required'
        : soil.knownDisease
          ? 'treatment-required'
          : !soil.tested
            ? 'soil-check'
            : 'ready'
    storage.saveSoilAssessment({ recordedAt: new Date().toISOString(), ...soil, status })
    setEvidenceSaved('soil')
    window.setTimeout(() => setEvidenceSaved(null), 1800)
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2"><Recycle className="w-5 h-5 text-gold" /><CardTitle className="text-base">Thesis Field Toolkit</CardTitle></div>
          <p className="text-xs text-muted-foreground">From available waste materials and soil condition to a safer, evidence-ready greenhouse plan — offline.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant={mode === 'build' ? 'gold' : 'outline'} onClick={() => setMode('build')} className="gap-2"><Hammer className="w-4 h-4" /> Zero-Cash Build</Button>
            <Button variant={mode === 'soil' ? 'gold' : 'outline'} onClick={() => setMode('soil')} className="gap-2"><Sprout className="w-4 h-4" /> Soil Treatment</Button>
          </div>
        </CardContent>
      </Card>

      {mode === 'build' ? (
        <>
          <StatusCard level={build.level} title={build.title} detail={build.detail} />
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">1. Resource audit</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <label className="text-xs text-muted-foreground block">Target greenhouse area (m²)</label>
              <Input type="number" min="4" value={area} onChange={e => setArea(e.target.value)} />
              <label className="text-xs text-muted-foreground block">Maximum new-material cash budget (₦)</label>
              <Input type="number" min="0" value={budget} onChange={e => setBudget(e.target.value)} />
              <p className="text-[11px] text-muted-foreground">“Zero cash” means ₦0 new-material outlay when safe materials are already owned, recovered, donated or exchanged. Transport, labour and opportunity cost remain real costs.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">2. Safe-material inventory</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {MATERIALS.map(item => (
                <label key={item.key} className="flex gap-3 rounded-xl border border-border p-3 cursor-pointer">
                  <input type="checkbox" className="mt-1" checked={materials[item.key]} onChange={e => setMaterials(v => ({ ...v, [item.key]: e.target.checked }))} />
                  <span><span className="text-sm font-medium block">{item.label}</span><span className="text-[11px] text-muted-foreground">{item.safe}</span></span>
                </label>
              ))}
              {build.missing.length > 0 && <div className="rounded-xl border border-amber-700/30 bg-amber-500/5 p-3 text-xs">Missing: {build.missing.map(x => x.label).join(', ')}. Source from owned stock, farms, sawmill/construction offcuts, organized waste collectors or donations — only if safe and serviceable.</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">3. Safety gate</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">Never use these simply to achieve a ₦0 build:</p>
              <ul className="text-xs space-y-1 list-disc pl-5">{HAZARDS.map(x => <li key={x}>{x}</li>)}</ul>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hazardFound} onChange={e => setHazardFound(e.target.checked)} /> I found a suspect/unsafe material</label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">4. Adaptive build sequence</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {['Choose a level, well-drained site and mark dimensions.', 'Sort, clean and inspect all recovered materials; reject unsafe items.', 'Set sound frame posts and cross-bracing; verify stability before covering.', 'Install serviceable crop cover/net with ventilation appropriate to local heat.', 'Prepare raised beds and water delivery; keep dirty construction waste out of crop beds.', 'Run the Soil Treatment Assistant before planting.', 'Record final materials, cash spent, labour and transport for pilot evidence.'].map((x,i) => (
                <div key={x} className="flex gap-3"><span className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center text-xs flex-shrink-0">{i+1}</span><p>{x}</p></div>
              ))}
              <Button variant="gold" className="w-full mt-4" onClick={saveBuildEvidence}>
                {evidenceSaved === 'build' ? 'Build assessment saved' : 'Save build assessment for pilot evidence'}
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <StatusCard level={soilResult.level} title={soilResult.title} detail={soilResult.detail} />
          <Card>
            <CardHeader className="pb-2"><div className="flex items-center gap-2"><Leaf className="w-5 h-5 text-gold" /><CardTitle className="text-base">Pre-plant soil assessment</CardTitle></div></CardHeader>
            <CardContent className="space-y-3">
              <Toggle label="Site drains well after rain/irrigation" value={soil.drainsWell} onChange={v => setSoil(s => ({ ...s, drainsWell:v }))} />
              <Toggle label="Known recurring soil-borne disease or nematode problem" value={soil.knownDisease} onChange={v => setSoil(s => ({ ...s, knownDisease:v }))} />
              <Toggle label="Suspected chemical / oil / heavy contamination" value={soil.suspectedContamination} onChange={v => setSoil(s => ({ ...s, suspectedContamination:v }))} />
              <Toggle label="Soil tested or assessed by a qualified extension service" value={soil.tested} onChange={v => setSoil(s => ({ ...s, tested:v }))} />
              <Toggle label="Only mature, safe organic matter will be incorporated" value={soil.matureOrganicMatter} onChange={v => setSoil(s => ({ ...s, matureOrganicMatter:v }))} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Treatment rules</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>• Remove diseased residues and weeds; clean tools between affected and clean beds.</p>
              <p>• Correct drainage before trying to “treat” waterlogged soil.</p>
              <p>• Solarization is a non-chemical option where climate permits: prepare and moisten soil, seal clear polyethylene tightly, and maintain treatment through a sustained hot/sunny period.</p>
              <p>• Do not automatically prescribe lime, fertilizer, fumigants or pesticides without diagnosis and locally appropriate rates.</p>
              <p>• Escalate suspected contamination, severe recurring disease or uncertain diagnosis to extension/laboratory support.</p>
              <Button variant="gold" className="w-full mt-4" onClick={saveSoilEvidence}>
                {evidenceSaved === 'soil' ? 'Soil assessment saved' : 'Save soil assessment for pilot evidence'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value:boolean)=>void }) {
  return <label className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm cursor-pointer"><input className="mt-1" type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} /><span>{label}</span></label>
}

function StatusCard({ level, title, detail }: { level: string; title: string; detail: string }) {
  const Icon = level === 'good' ? CheckCircle2 : level === 'stop' ? AlertTriangle : ShieldCheck
  const cls = level === 'good' ? 'border-emerald-700/40 bg-emerald-500/10 text-emerald-200' : level === 'stop' ? 'border-red-700/40 bg-red-500/10 text-red-200' : 'border-amber-700/40 bg-amber-500/10 text-amber-200'
  return <Card className={cls}><CardContent className="pt-5"><div className="flex gap-3"><Icon className="w-6 h-6 flex-shrink-0" /><div><p className="font-semibold text-sm">{title}</p><p className="text-xs mt-1 opacity-80 leading-relaxed">{detail}</p></div></div></CardContent></Card>
}
