'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { storage, ClimateLog } from '@/lib/storage'
import { formatDate, formatTime } from '@/lib/utils'
import { Plus, Trash2, Thermometer, Droplets, Wind, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const TEMP_IDEAL = [21, 29]
const HUM_IDEAL = [60, 75]

function statusColor(val: number, [lo, hi]: [number, number]) {
  if (val < lo) return 'text-blue-400'
  if (val > hi) return 'text-red-400'
  return 'text-emerald-400'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}{p.name === 'Temp' ? '°C' : p.name === 'Humidity' ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

export default function ClimateTracker() {
  const [logs, setLogs] = useState<ClimateLog[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    temperature: '',
    humidity: '',
    co2: '',
    lightLevel: '',
    notes: '',
  })
  const [view, setView] = useState<'log' | 'chart'>('log')

  useEffect(() => {
    setLogs(storage.getClimateLogs())
  }, [])

  const handleSubmit = useCallback(() => {
    const temp = parseFloat(form.temperature)
    const hum = parseFloat(form.humidity)
    if (isNaN(temp) || isNaN(hum)) return
    const log: ClimateLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      temperature: temp,
      humidity: hum,
      co2: form.co2 ? parseFloat(form.co2) : undefined,
      lightLevel: form.lightLevel ? parseFloat(form.lightLevel) : undefined,
      notes: form.notes || undefined,
    }
    storage.saveClimateLog(log)
    setLogs(storage.getClimateLogs())
    setForm({ temperature: '', humidity: '', co2: '', lightLevel: '', notes: '' })
    setShowForm(false)
  }, [form])

  const handleDelete = useCallback((id: string) => {
    storage.deleteClimateLog(id)
    setLogs(storage.getClimateLogs())
  }, [])

  const latest = logs[0]

  const chartData = [...logs]
    .reverse()
    .slice(-20)
    .map(l => ({
      time: formatTime(l.timestamp),
      Temp: l.temperature,
      Humidity: l.humidity,
      CO2: l.co2,
    }))

  return (
    <div className="p-4 space-y-4">
      {/* Current readings */}
      {latest && (
        <Card className="grain-overlay overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Current Conditions</CardTitle>
            <p className="text-xs text-muted-foreground">
              {formatDate(latest.timestamp)} · {formatTime(latest.timestamp)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Temperature</p>
                  <p className={cn('text-2xl font-semibold font-serif', statusColor(latest.temperature, TEMP_IDEAL as [number,number]))}>
                    {latest.temperature}°C
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className={cn('text-2xl font-semibold font-serif', statusColor(latest.humidity, HUM_IDEAL as [number,number]))}>
                    {latest.humidity}%
                  </p>
                </div>
              </div>
              {latest.co2 && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Wind className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CO₂</p>
                    <p className="text-2xl font-semibold font-serif text-green-400">{latest.co2} ppm</p>
                  </div>
                </div>
              )}
              {latest.lightLevel && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Light</p>
                    <p className="text-2xl font-semibold font-serif text-yellow-400">{latest.lightLevel} lux</p>
                  </div>
                </div>
              )}
            </div>
            {latest.notes && (
              <p className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">{latest.notes}</p>
            )}
          </CardContent>
        </Card>
      )}

      {!latest && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Thermometer className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground text-sm">No readings yet.</p>
            <p className="text-muted-foreground text-xs mt-1">Log your first greenhouse measurement below.</p>
          </CardContent>
        </Card>
      )}

      {/* View toggle */}
      {logs.length > 1 && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === 'log' ? 'secondary' : 'ghost'}
            onClick={() => setView('log')}
            className="flex-1"
          >Log</Button>
          <Button
            size="sm"
            variant={view === 'chart' ? 'secondary' : 'ghost'}
            onClick={() => setView('chart')}
            className="flex-1"
          >Chart</Button>
        </div>
      )}

      {/* Chart */}
      {view === 'chart' && logs.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">History (last 20 readings)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(153 30% 16%)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(153 15% 55%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(153 15% 55%)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Temp" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Humidity" stroke="#60a5fa" strokeWidth={2} dot={false} />
                {chartData.some(d => d.CO2) && (
                  <Line type="monotone" dataKey="CO2" stroke="#4ade80" strokeWidth={2} dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Log list */}
      {view === 'log' && logs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">Recent Logs</h3>
          {logs.slice(0, 15).map(log => (
            <div
              key={log.id}
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="gold">{log.temperature}°C</Badge>
                  <Badge variant="forest">{log.humidity}%</Badge>
                  {log.co2 && <Badge variant="outline">{log.co2} ppm</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(log.timestamp)} · {formatTime(log.timestamp)}
                </p>
                {log.notes && <p className="text-xs text-foreground/70 mt-0.5 truncate">{log.notes}</p>}
              </div>
              <button
                onClick={() => handleDelete(log.id)}
                className="text-muted-foreground hover:text-red-400 p-1 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Log form */}
      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Reading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Temperature (°C) *</label>
                <Input
                  type="number"
                  placeholder="e.g. 25"
                  value={form.temperature}
                  onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Humidity (%) *</label>
                <Input
                  type="number"
                  placeholder="e.g. 70"
                  value={form.humidity}
                  onChange={e => setForm(f => ({ ...f, humidity: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">CO₂ (ppm)</label>
                <Input
                  type="number"
                  placeholder="e.g. 800"
                  value={form.co2}
                  onChange={e => setForm(f => ({ ...f, co2: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Light (lux)</label>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  value={form.lightLevel}
                  onChange={e => setForm(f => ({ ...f, lightLevel: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
              <Input
                placeholder="Optional observations..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSubmit} variant="gold" className="flex-1">Save Reading</Button>
              <Button onClick={() => setShowForm(false)} variant="ghost" className="flex-1">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          variant="gold"
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Log New Reading
        </Button>
      )}
    </div>
  )
}
