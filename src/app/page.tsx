'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { WalletCards } from 'lucide-react'
import Navigation from '@/components/Navigation'
import ClimateTracker from '@/components/ClimateTracker'
import CropGuide from '@/components/CropGuide'
import PestScanner from '@/components/PestScanner'
import YieldPredictor from '@/components/YieldPredictor'
import ChatAdvisor from '@/components/ChatAdvisor'
import PilotTracker from '@/components/PilotTracker'
import OfflineBanner from '@/components/OfflineBanner'

export type Tab = 'climate' | 'crops' | 'pest' | 'yield' | 'chat' | 'pilot'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('climate')
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative">
      {!isOnline && <OfflineBanner />}

      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl font-semibold text-gold leading-none">AgriDome Lite</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Smart Greenhouse Companion</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/farm-dashboard"
              className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-gold"
              aria-label="Open farm operations dashboard"
            >
              <WalletCards className="h-4 w-4" />
            </Link>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-amber-400'}`} />
            <span className="text-xs text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'climate' && <ClimateTracker />}
        {activeTab === 'crops' && <CropGuide />}
        {activeTab === 'pest' && <PestScanner isOnline={isOnline} />}
        {activeTab === 'yield' && <YieldPredictor />}
        {activeTab === 'chat' && <ChatAdvisor isOnline={isOnline} />}
        {activeTab === 'pilot' && <PilotTracker />}
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
