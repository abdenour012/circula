import { Clock } from 'lucide-react'
import type { UserTier } from '../types'
import { Button } from './Button'
import { Card } from './Card'

function hoursBetween(start: number, end: number) {
  return Math.max(0, (end - start) / (1000 * 60 * 60))
}

function fmtHrs(n: number) {
  return `${n.toFixed(1)}h`
}

export function FastingCard({
  tier,
  now,
  lastMealAt,
  fasting,
  onToggle,
  onReset,
}: {
  tier: UserTier
  now: number
  lastMealAt?: number
  fasting: { isActive: boolean; startedAt?: number; goalHours: number }
  onToggle: () => void
  onReset: () => void
}) {
  const startedAt = tier === 'premium' ? lastMealAt ?? fasting.startedAt : fasting.startedAt

  const elapsed = startedAt ? hoursBetween(startedAt, now) : 0
  const remaining = Math.max(0, fasting.goalHours - elapsed)

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4" /> Fasting
          </div>
          <div className="text-xs text-black/60">
            {tier === 'premium' ? 'Smart fasting synced to last meal' : 'Manual timer'}
          </div>
        </div>
        <div className="rounded-full border border-black/10 px-2 py-1 text-[11px] font-medium">
          {tier === 'premium' ? 'PRO' : 'CORE'}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-black/10 p-3">
          <div className="text-[11px] text-black/60">Since start</div>
          <div className="mt-1 text-lg font-semibold">{startedAt ? fmtHrs(elapsed) : '—'}</div>
        </div>
        <div className="rounded-xl border border-black/10 p-3">
          <div className="text-[11px] text-black/60">To goal ({fasting.goalHours}h)</div>
          <div className="mt-1 text-lg font-semibold">{startedAt ? fmtHrs(remaining) : '—'}</div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {tier === 'premium' ? (
          <>
            <Button variant="secondary" className="flex-1" onClick={onReset}>
              Reset
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={fasting.isActive ? 'secondary' : 'primary'}
              className="flex-1"
              onClick={onToggle}
            >
              {fasting.isActive ? 'Pause' : 'Start'}
            </Button>
            <Button variant="secondary" className="flex-1" onClick={onReset}>
              Reset
            </Button>
          </>
        )}
      </div>

      {tier === 'premium' && !lastMealAt && (
        <div className="mt-3 text-xs text-black/60">Scan a meal to sync fasting start.</div>
      )}
    </Card>
  )
}
