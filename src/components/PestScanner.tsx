'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { storage, PestScan } from '@/lib/storage'
import { formatDate, formatTime } from '@/lib/utils'
import { Camera, Upload, Bug, AlertTriangle, CheckCircle, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { CROPS } from '@/lib/crops'
import { cn } from '@/lib/utils'

interface PestScannerProps {
  isOnline: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function PestScanner({ isOnline }: PestScannerProps) {
  const [scans, setScans] = useState<PestScan[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [selectedCrop, setSelectedCrop] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [expandedScan, setExpandedScan] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setScans(storage.getPestScans())
  }, [])

  const handleFile = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    const b64 = await fileToBase64(file)
    setImageBase64(b64)
    setResult(null)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!imageBase64) return
    setAnalyzing(true)
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/api/pest-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageBase64,
          crop_context: selectedCrop || undefined,
        }),
      })
      if (!response.ok) throw new Error('API error')
      const data = await response.json()
      const analysisResult = data.result as string
      setResult(analysisResult)

      const scan: PestScan = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        imageBase64,
        result: analysisResult,
        cropContext: selectedCrop || undefined,
      }
      storage.savePestScan(scan)
      setScans(storage.getPestScans())
    } catch {
      setResult('Could not connect to the analysis server. Please check your internet connection and try again.')
    } finally {
      setAnalyzing(false)
    }
  }, [imageBase64, selectedCrop])

  const clearImage = () => {
    setPreview(null)
    setImageBase64(null)
    setResult(null)
    if (fileRef.current) fileRef.current.value = ''
    if (cameraRef.current) cameraRef.current.value = ''
  }

  const getSeverityColor = (text: string) => {
    const lower = text.toLowerCase()
    if (lower.includes('severe') || lower.includes('urgent') || lower.includes('critical')) return 'text-red-400'
    if (lower.includes('moderate') || lower.includes('warning') || lower.includes('attention')) return 'text-amber-400'
    return 'text-emerald-400'
  }

  const getSeverityIcon = (text: string) => {
    const lower = text.toLowerCase()
    if (lower.includes('severe') || lower.includes('urgent') || lower.includes('critical')) return AlertTriangle
    if (lower.includes('moderate') || lower.includes('warning')) return AlertTriangle
    return CheckCircle
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="font-serif text-xl font-semibold">Pest Scanner</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload a photo for AI-powered pest identification</p>
      </div>

      {/* Offline warning */}
      {!isOnline && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p>Analysis requires internet. You can still take photos and they’ll be ready when reconnected.</p>
        </div>
      )}

      {/* Upload area */}
      <Card className={cn('border-dashed', preview && 'border-solid')}>
        <CardContent className="p-4">
          {preview ? (
            <div className="space-y-3">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Crop photo"
                  className="w-full max-h-56 object-cover rounded-lg"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-background/80 rounded-full p-1 text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Crop type (optional)</label>
                <select
                  value={selectedCrop}
                  onChange={e => setSelectedCrop(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value="">Select crop...</option>
                  {CROPS.map(c => (
                    <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzing || !isOnline}
                variant="gold"
                className="w-full gap-2"
              >
                {analyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analysing...</>
                ) : (
                  <><Bug className="w-4 h-4" /> Identify Pest / Disease</>
                )}
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center space-y-4">
              <Bug className="w-12 h-12 mx-auto text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">Take or upload a photo of your crop</p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => cameraRef.current?.click()}
                >
                  <Camera className="w-4 h-4" /> Camera
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="w-4 h-4" /> Gallery
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden file inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {/* Result */}
      {result && (
        <Card className="border-accent">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = getSeverityIcon(result)
                return <Icon className={cn('w-5 h-5', getSeverityColor(result))} />
              })()}
              <CardTitle className="text-base">Analysis Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose-sm text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan history */}
      {scans.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">Previous Scans</h3>
          {scans.slice(0, 10).map(scan => (
            <Card key={scan.id}>
              <button
                className="w-full text-left"
                onClick={() => setExpandedScan(expandedScan === scan.id ? null : scan.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/jpeg;base64,${scan.imageBase64}`}
                      alt=""
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {scan.cropContext && <Badge variant="forest" className="text-xs">{scan.cropContext}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(scan.timestamp)} · {formatTime(scan.timestamp)}
                      </p>
                      <p className="text-xs text-foreground/70 truncate mt-0.5">{scan.result}</p>
                    </div>
                    {expandedScan === scan.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  {expandedScan === scan.id && (
                    <div className="mt-3 pt-3 border-t border-border text-sm text-foreground/90 whitespace-pre-wrap">
                      {scan.result}
                    </div>
                  )}
                </CardContent>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
