import { useMemo, useState } from 'react'
import { Search, Filter, X, Barcode, Camera, Cookie, Droplet, Moon, Sun } from 'lucide-react'
import type { HistoryEntry } from '../types'
import { cn } from '../lib/cn'
import { Card } from './Card'
import { Button } from './Button'

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

export function ScanLogEnhanced({ 
  history, 
  now 
}: { 
  history: HistoryEntry[]
  now: number 
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<HistoryEntry['type'] | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredHistory = useMemo(() => {
    let filtered = [...history]

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.type === filterType)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(entry => {
        const name = entry.data.name?.toLowerCase() || ''
        return name.includes(query)
      })
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => b.at - a.at)
  }, [history, searchQuery, filterType])

  const typeOptions: Array<{ value: HistoryEntry['type'] | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'meal', label: 'Meals' },
    { value: 'snack', label: 'Snacks' },
    { value: 'water', label: 'Water' },
    { value: 'fasting_start', label: 'Fasting Start' },
    { value: 'fasting_end', label: 'Fasting End' },
  ]

  if (history.length === 0) {
    return (
      <Card>
        <div className="mb-2 text-sm font-semibold">Activity History</div>
        <div className="text-center py-8 text-sm text-black/50">
          No activity recorded
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold">Activity History</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="mb-4 space-y-3 anim-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
            <input
              type="text"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-black/40" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterType(option.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-full border transition-all',
                  filterType === option.value
                    ? 'bg-[#DC2626] text-white border-[#DC2626]'
                    : 'bg-white text-black/70 border-black/10 hover:border-[#DC2626]/30'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!showFilters && searchQuery && (
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
          <input
            type="text"
            placeholder="Search meals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-black/40" />
            </button>
          )}
        </div>
      )}

      {filteredHistory.length === 0 ? (
        <div className="text-center py-8 text-sm text-black/50">
          {searchQuery || filterType !== 'all' ? 'No results found' : 'No activity recorded'}
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredHistory.map((entry) => {
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
                    <div className="text-[10px] opacity-50 mt-1">
                      {new Date(entry.at).toLocaleDateString()} {new Date(entry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      )}
    </Card>
  )
}
