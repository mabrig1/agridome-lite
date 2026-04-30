'use client'

import { Tab } from '@/app/page'
import { cn } from '@/lib/utils'
import { Thermometer, Leaf, Bug, BarChart2, MessageCircle } from 'lucide-react'

const tabs = [
  { id: 'climate' as Tab, label: 'Climate', icon: Thermometer },
  { id: 'crops' as Tab, label: 'Crops', icon: Leaf },
  { id: 'pest' as Tab, label: 'Pest', icon: Bug },
  { id: 'yield' as Tab, label: 'Yield', icon: BarChart2 },
  { id: 'chat' as Tab, label: 'Advisor', icon: MessageCircle },
]

interface NavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-background/95 backdrop-blur border-t border-border">
      <div className="flex">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              activeTab === id
                ? 'text-gold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className={cn('w-5 h-5', activeTab === id && 'drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]')} />
            <span>{label}</span>
            {activeTab === id && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-gold rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
