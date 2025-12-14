import { useMemo } from 'react'
import { TrendingUp, Calendar } from 'lucide-react'
import type { HistoryEntry } from '../types'
import { Card } from './Card'

export function NutritionTrends({
  history,
  targets,
}: {
  history: HistoryEntry[]
  targets: { calories: number }
}) {
  // Calculate weekly data
  const weeklyData = useMemo(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const weekHistory = history.filter(entry => entry.at >= weekAgo && (entry.type === 'meal' || entry.type === 'snack'))
    
    const dailyTotals: Record<string, number> = {}
    weekHistory.forEach(entry => {
      const date = new Date(entry.at).toLocaleDateString()
      dailyTotals[date] = (dailyTotals[date] || 0) + (entry.data.calories || 0)
    })

    const days = Object.keys(dailyTotals).sort()
    const maxCalories = Math.max(...Object.values(dailyTotals), targets.calories)

    return { days, dailyTotals, maxCalories }
  }, [history, targets.calories])

  if (weeklyData.days.length === 0) {
    return (
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#DC2626]" />
          <div className="text-sm font-semibold">Weekly Trends</div>
        </div>
        <div className="text-center py-8 text-sm text-black/50">
          Not enough data yet. Track meals for a week to see trends.
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#DC2626]" />
          <div className="text-sm font-semibold">Weekly Trends</div>
        </div>
        <Calendar className="h-4 w-4 text-black/40" />
      </div>

      <div className="space-y-3">
        {weeklyData.days.map((date) => {
          const calories = weeklyData.dailyTotals[date]
          const percentage = (calories / weeklyData.maxCalories) * 100
          const isOverTarget = calories > targets.calories

          return (
            <div key={date} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-black/70">{date}</span>
                <span className={isOverTarget ? 'font-semibold text-[#DC2626]' : 'font-semibold text-black'}>
                  {Math.round(calories)} / {Math.round(targets.calories)} kcal
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverTarget ? 'bg-[#DC2626]' : 'bg-[#DC2626]/60'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-black/5 text-[10px] text-black/50 text-center">
        Last 7 days • Target: {Math.round(targets.calories)} kcal/day
      </div>
    </Card>
  )
}
