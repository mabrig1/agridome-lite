'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CROPS } from '@/lib/crops'
import { storage, YieldRecord } from '@/lib/storage'
import { formatDate } from '@/lib/utils'
import { BarChart2, TrendingUp, Plus, Trash2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts'

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const PRICE_PER_KG: Record<string, number> = {
  tomato: 450,
  pepper: 600,
  cucumber: 350,
  lettuce: 500,
  spinach: 400,
  okra: 300,
}

export default function YieldPredictor() {
  const [records, setRecords] = useState<YieldRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [form, setForm] = useState({
    cropId: 'tomato',
    area: '',
    plantCount: '',
    actualYield: '',
  })

  useEffect(() => {
    setRecords(storage.getYieldRecords())
  }, [])

  const selectedCrop = CROPS.find(c => c.id === form.cropId)

  const prediction = useMemo(() => {
    if (!selectedCrop) return null
    const area = parseFloat(form.area)
    const plants = parseFloat(form.plantCount)
    if (isNaN(area) && isNaN(plants)) return null

    const baseYield = isNaN(area)
      ? plants * (selectedCrop.yieldPerSqM / 4)
      : area * selectedCrop.yieldPerSqM

    const optimistic = baseYield * 1.25
    const conservative = baseYield * 0.75
    const pricePerKg = PRICE_PER_KG[selectedCrop.id] ?? 400
    const revenue = baseYield * pricePerKg

    return { base: baseYield, optimistic, conservative, revenue, pricePerKg }
  }, [selectedCrop, form.area, form.plantCount])

  const handleSave = () => {
    if (!prediction) return
    const record: YieldRecord = {
      id: generateId(),
      cropId: form.cropId,
      area: parseFloat(form.area) || 0,
      plantCount: parseFloat(form.plantCount) || 0,
      expectedYield: prediction.base,
      actualYield: form.actualYield ? parseFloat(form.actualYield) : undefined,
      recordedAt: new Date().toISOString(),
    }
    storage.saveYieldRecord(record)
    setRecords(storage.getYieldRecords())
    setForm({ cropId: 'tomato', area: '', plantCount: '', actualYield: '' })
    setShowForm(false)
  }

  const chartData = records.slice(0, 10).reverse().map(r => {
    const crop = CROPS.find(c => c.id === r.cropId)
    return {
      name: crop?.name ?? r.cropId,
      Expected: parseFloat(r.expectedYield.toFixed(1)),
      Actual: r.actualYield ? parseFloat(r.actualYield.toFixed(1)) : undefined,
    }
  })

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="font-serif text-xl font-semibold">Yield Predictor</h2>
        <p className="text-sm text-muted-foreground mt-1">Estimate your harvest and potential income</p>
      </div>

      {/* Calculator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Calculate Yield</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Crop selector */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Crop</label>
            <div className="grid grid-cols-3 gap-2">
              {CROPS.map(crop => (
                <button
                  key={crop.id}
                  onClick={() => setForm(f => ({ ...f, cropId: crop.id }))}
                  className={cn(
                    'p-2 rounded-lg border text-center text-xs transition-all',
                    form.cropId === crop.id
                      ? 'border-gold-500/60 bg-gold-500/10 text-gold-400'
                      : 'border-border bg-background text-muted-foreground hover:border-accent'
                  )}
                >
                  <div className="text-xl mb-0.5">{crop.emoji}</div>
                  <div>{crop.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Greenhouse area (m²)</label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={form.area}
                onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Plant count</label>
              <Input
                type="number"
                placeholder="e.g. 200"
                value={form.plantCount}
                onChange={e => setForm(f => ({ ...f, plantCount: e.target.value }))}
              />
            </div>
          </div>

          {selectedCrop && (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
              Based on {selectedCrop.yieldPerSqM} kg/m² greenhouse average for {selectedCrop.name}.
              Actual yield varies with management, variety, and season.
            </p>
          )}

          {/* Prediction result */}
          {prediction && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Conservative</p>
                  <p className="text-lg font-serif font-semibold text-blue-400">{prediction.conservative.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">kg</p>
                </div>
                <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-3">
                  <p className="text-xs text-gold-400 mb-1">Expected</p>
                  <p className="text-lg font-serif font-semibold text-gold-400">{prediction.base.toFixed(1)}</p>
                  <p className="text-xs text-gold-400/70">kg</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Optimistic</p>
                  <p className="text-lg font-serif font-semibold text-emerald-400">{prediction.optimistic.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">kg</p>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Revenue</p>
                  <p className="font-serif text-2xl font-semibold text-emerald-400">
                    ₦{prediction.revenue.toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground">at ₦{prediction.pricePerKg}/kg market rate</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-400/60" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Actual yield (kg) — fill after harvest</label>
                <Input
                  type="number"
                  placeholder="Enter actual yield to record..."
                  value={form.actualYield}
                  onChange={e => setForm(f => ({ ...f, actualYield: e.target.value }))}
                />
              </div>

              <Button onClick={handleSave} variant="gold" className="w-full gap-2">
                <Plus className="w-4 h-4" /> Save Prediction
              </Button>
            </div>
          )}

          {!prediction && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Enter greenhouse area or plant count to see prediction
            </p>
          )}
        </CardContent>
      </Card>

      {/* History chart */}
      {records.length > 0 && (
        <Card>
          <button
            className="w-full text-left"
            onClick={() => setShowHistory(!showHistory)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Yield History ({records.length})</CardTitle>
                <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', showHistory && 'rotate-180')} />
              </div>
            </CardHeader>
          </button>
          {showHistory && (
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(153 30% 16%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(153 15% 55%)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(153 15% 55%)' }} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(153 45% 8%)', border: '1px solid hsl(153 30% 16%)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: 'hsl(60 30% 92%)' }}
                  />
                  <Bar dataKey="Expected" fill="hsl(43 96% 56% / 0.6)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" fill="hsl(142 71% 45% / 0.8)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-3 space-y-2">
                {records.slice(0, 5).map(record => {
                  const crop = CROPS.find(c => c.id === record.cropId)
                  return (
                    <div key={record.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <span>{crop?.emoji}</span>
                        <span className="text-muted-foreground">{formatDate(record.recordedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="gold">{record.expectedYield.toFixed(1)} kg est.</Badge>
                        {record.actualYield && (
                          <Badge variant="forest">{record.actualYield} kg actual</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
