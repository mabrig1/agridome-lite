'use client'

import { useState, useEffect } from 'react'
import { CROPS, CropInfo, CropStage } from '@/lib/crops'
import { storage } from '@/lib/storage'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { ChevronRight, ChevronLeft, CheckCircle2, Circle, Thermometer, Droplets, Calendar } from 'lucide-react'

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function CropGuide() {
  const [selectedCrop, setSelectedCrop] = useState<CropInfo | null>(null)
  const [cropStages, setCropStages] = useState<CropStage[]>([])
  const [activeStageIndex, setActiveStageIndex] = useState(0)

  useEffect(() => {
    setCropStages(storage.getCropStages())
  }, [])

  const getStageForCrop = (cropId: string) => cropStages.find(s => s.cropId === cropId)

  const startTracking = (crop: CropInfo) => {
    const existing = getStageForCrop(crop.id)
    if (!existing) {
      const stage: CropStage = {
        id: generateId(),
        cropId: crop.id,
        plantedDate: new Date().toISOString(),
        currentStage: 0,
        updatedAt: new Date().toISOString(),
      }
      storage.saveCropStage(stage)
      setCropStages(storage.getCropStages())
    }
  }

  const advanceStage = (crop: CropInfo) => {
    const existing = getStageForCrop(crop.id)
    if (!existing) return
    const nextStage = Math.min(existing.currentStage + 1, crop.stages.length - 1)
    const updated: CropStage = { ...existing, currentStage: nextStage, updatedAt: new Date().toISOString() }
    storage.saveCropStage(updated)
    setCropStages(storage.getCropStages())
  }

  const resetStage = (cropId: string) => {
    const stages = cropStages.filter(s => s.cropId !== cropId)
    // Directly update storage by saving with empty cropId filter
    storage.saveCropStage({ id: generateId(), cropId, plantedDate: new Date().toISOString(), currentStage: 0, updatedAt: new Date().toISOString() })
    setCropStages(storage.getCropStages())
  }

  if (selectedCrop) {
    const tracking = getStageForCrop(selectedCrop.id)
    const currentStageIdx = tracking?.currentStage ?? 0
    const currentStage = selectedCrop.stages[activeStageIndex]
    const isTracking = !!tracking

    return (
      <div className="p-4 space-y-4">
        {/* Back + header */}
        <div className="flex items-center gap-3">
          <button onClick={() => { setSelectedCrop(null); setActiveStageIndex(0) }} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedCrop.emoji}</span>
            <div>
              <h2 className="font-serif text-xl font-semibold">{selectedCrop.name}</h2>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(selectedCrop.localNames).map(([lang, name]) => (
                  <span key={lang} className="text-xs text-muted-foreground">{name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 text-center">
            <Calendar className="w-4 h-4 mx-auto mb-1 text-gold-400" />
            <p className="text-xs text-muted-foreground">Harvest</p>
            <p className="font-semibold text-sm">{selectedCrop.daysToHarvest}d</p>
          </Card>
          <Card className="p-3 text-center">
            <Thermometer className="w-4 h-4 mx-auto mb-1 text-orange-400" />
            <p className="text-xs text-muted-foreground">Temp</p>
            <p className="font-semibold text-sm">{selectedCrop.optimalTemp[0]}–{selectedCrop.optimalTemp[1]}°C</p>
          </Card>
          <Card className="p-3 text-center">
            <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="font-semibold text-sm">{selectedCrop.optimalHumidity[0]}–{selectedCrop.optimalHumidity[1]}%</p>
          </Card>
        </div>

        <p className="text-sm text-muted-foreground">{selectedCrop.description}</p>

        {/* Growth stage progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Growth Stages</CardTitle>
            {isTracking && tracking && (
              <p className="text-xs text-muted-foreground">
                Planted {formatDate(tracking.plantedDate)} · Stage {tracking.currentStage + 1}/{selectedCrop.stages.length}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {/* Stage timeline */}
            <div className="flex gap-1 mb-4">
              {selectedCrop.stages.map((stage, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStageIndex(i)}
                  className={cn(
                    'flex-1 h-2 rounded-full transition-all',
                    i < currentStageIdx ? 'bg-gold-500' :
                    i === currentStageIdx ? 'bg-gold-400 ring-2 ring-gold-400/40' :
                    'bg-muted'
                  )}
                />
              ))}
            </div>

            {/* Stage selector */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setActiveStageIndex(i => Math.max(0, i - 1))}
                disabled={activeStageIndex === 0}
                className="text-muted-foreground disabled:opacity-30 hover:text-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <p className="font-serif font-semibold">{currentStage.name}</p>
                <p className="text-xs text-muted-foreground">Day {currentStage.daysFromPlanting}+</p>
              </div>
              <button
                onClick={() => setActiveStageIndex(i => Math.min(selectedCrop.stages.length - 1, i + 1))}
                disabled={activeStageIndex === selectedCrop.stages.length - 1}
                className="text-muted-foreground disabled:opacity-30 hover:text-foreground"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{currentStage.description}</p>

            <div className="space-y-2">
              {currentStage.tasks.map((task, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{task}</p>
                </div>
              ))}
            </div>

            {/* Tracking controls */}
            <div className="mt-4 space-y-2">
              {!isTracking ? (
                <Button onClick={() => startTracking(selectedCrop)} variant="gold" className="w-full">
                  Start Tracking This Crop
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => advanceStage(selectedCrop)}
                    variant="gold"
                    disabled={tracking!.currentStage >= selectedCrop.stages.length - 1}
                    className="flex-1"
                  >
                    Advance Stage
                  </Button>
                  <Button onClick={() => resetStage(selectedCrop.id)} variant="ghost" size="sm">
                    Reset
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pro Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedCrop.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gold-400 mt-0.5">&#x2022;</span>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Common pests */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Watch Out For</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedCrop.commonPests.map(pest => (
                <Badge key={pest} variant="destructive" className="bg-red-900/40 text-red-300 border-red-700/40">
                  {pest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="font-serif text-xl font-semibold">Crop Guide</h2>
        <p className="text-sm text-muted-foreground mt-1">6 greenhouse crops optimised for Nigerian conditions</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {CROPS.map(crop => {
          const tracking = getStageForCrop(crop.id)
          const stageInfo = tracking ? crop.stages[tracking.currentStage] : null
          return (
            <button
              key={crop.id}
              onClick={() => { setSelectedCrop(crop); setActiveStageIndex(tracking?.currentStage ?? 0) }}
              className="text-left"
            >
              <Card className="hover:border-gold-600/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{crop.emoji}</span>
                      <div>
                        <h3 className="font-serif font-semibold">{crop.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {crop.daysToHarvest}d · {crop.optimalTemp[0]}–{crop.optimalTemp[1]}°C
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {stageInfo && (
                        <Badge variant="gold" className="text-xs">{stageInfo.name}</Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  {tracking && (
                    <div className="mt-3">
                      <div className="flex gap-1">
                        {crop.stages.map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex-1 h-1.5 rounded-full',
                              i <= tracking.currentStage ? 'bg-gold-500' : 'bg-muted'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Stage {tracking.currentStage + 1}/{crop.stages.length} · Planted {formatDate(tracking.plantedDate)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
