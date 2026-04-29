import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  return (
    <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center gap-2 text-amber-300 text-sm">
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span>Offline — data saved locally and will sync when reconnected</span>
    </div>
  )
}
