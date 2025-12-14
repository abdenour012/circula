import { Barcode, Camera, Cookie, Droplet, Moon, Sun } from 'lucide-react'
import type { HistoryEntry } from '../types'
import { cn } from '../lib/cn'
import { Card } from './Card'

function shortenName(name: string, maxLength = 25): string {
  if (name.length <= maxLength) return name
  return name.substring(0, maxLength - 3) + '...'
}

function getTimeAgo(now: number, timestamp: number): string {
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getEntryIcon(entry: HistoryEntry) {
  switch (entry.type) {
    case 'meal':
      return <Camera className="h-4 w-4" />
    case 'snack':
      return <Cookie className="h-4 w-4" />
    case 'water':
      return <Droplet className="h-4 w-4" />
    case 'fasting_start':
      return <Moon className="h-4 w-4" />
    case 'fasting_end':
      return <Sun className="h-4 w-4" />
    default:
      return <Barcode className="h-4 w-4" />
  }
}

function getEntryColor(entry: HistoryEntry): string {
  switch (entry.type) {
    case 'meal':
      return 'bg-blue-50 border-blue-200 text-blue-900'
    case 'snack':
      return 'bg-orange-50 border-orange-200 text-orange-900'
    case 'water':
      return 'bg-cyan-50 border-cyan-200 text-cyan-900'
    case 'fasting_start':
      return 'bg-purple-50 border-purple-200 text-purple-900'
    case 'fasting_end':
      return 'bg-green-50 border-green-200 text-green-900'
    default:
      return 'bg-gray-50 border-gray-200 text-gray-900'
  }
}

function getEntryLabel(entry: HistoryEntry): string {
  switch (entry.type) {
    case 'meal':
      return shortenName(entry.data.name || 'Meal')
    case 'snack':
      return shortenName(entry.data.name || 'Snack')
    case 'water':
      return `${entry.data.cups || 1} cup${(entry.data.cups || 1) > 1 ? 's' : ''} of water`
    case 'fasting_start':
      return 'Fasting started'
    case 'fasting_end':
      return `Fasting ended (${entry.data.hours?.toFixed(1) || 0}h)`
    default:
      return 'Activity'
  }
}

function getEntryDetails(entry: HistoryEntry): string {
  switch (entry.type) {
    case 'meal':
    case 'snack':
      return `${Math.round(entry.data.calories || 0)} kcal`
    case 'water':
      return 'Hydration'
    case 'fasting_start':
      return 'Intermittent fasting'
    case 'fasting_end':
      return `${entry.data.hours?.toFixed(1) || 0} hours fasted`
    default:
      return ''
  }
}

export function ScanLog({ 
  history, 
  now 
}: { 
  history: HistoryEntry[]
  now: number 
}) {
  // Filter to today's entries only
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const todayStart = today.getTime()
  
  const todayHistory = history.filter(entry => entry.at >= todayStart)
  
  if (todayHistory.length === 0) {
    return (
      <Card>
        <div className="mb-2 text-sm font-semibold">Today's Activity</div>
        <div className="text-center py-8 text-sm text-black/50">
          No activity recorded today
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-4 text-sm font-semibold">Today's Activity</div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {todayHistory.map((entry) => {
          const colorClasses = getEntryColor(entry)
          const isRecent = now - entry.at < 300000 // 5 minutes
          
          return (
            <div
              key={entry.id}
              className={cn(
                'flex items-start justify-between gap-3 rounded-xl border p-3',
                colorClasses,
                'motion-safe:transition-all motion-safe:duration-300 hover:scale-[1.01] hover:shadow-modern-hover',
                isRecent ? 'anim-fade-up' : '',
              )}
            >
              <div className="flex min-w-0 items-start gap-2 flex-1">
                <div className={cn(
                  'mt-0.5 grid h-8 w-8 place-items-center rounded-lg border flex-shrink-0',
                  entry.type === 'meal' ? 'bg-blue-100 border-blue-300' :
                  entry.type === 'snack' ? 'bg-orange-100 border-orange-300' :
                  entry.type === 'water' ? 'bg-cyan-100 border-cyan-300' :
                  entry.type === 'fasting_start' ? 'bg-purple-100 border-purple-300' :
                  entry.type === 'fasting_end' ? 'bg-green-100 border-green-300' :
                  'bg-gray-100 border-gray-300'
                )}>
                  {getEntryIcon(entry)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{getEntryLabel(entry)}</div>
                  <div className="text-xs opacity-70 mt-0.5">
                    {getEntryDetails(entry)}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs opacity-70 whitespace-nowrap">
                  {getTimeAgo(now, entry.at)}
                </div>
                {(entry.type === 'meal' || entry.type === 'snack') && entry.data.macros && (
                  <div className="text-[10px] opacity-60 mt-0.5">
                    P {Math.round(entry.data.macros.proteinG)} • C {Math.round(entry.data.macros.carbsG)} • F {Math.round(entry.data.macros.fatG)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
