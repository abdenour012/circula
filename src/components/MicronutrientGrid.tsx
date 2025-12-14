import type { Micronutrients, UserTier } from '../types'
import { Card } from './Card'
import { LockedOverlay } from './LockedOverlay'

function Grid({ micros }: { micros: Micronutrients }) {
  const items = [
    { k: 'Sugar', v: `${micros.sugarG}g` },
    { k: 'Sodium', v: `${micros.sodiumMg}mg` },
    { k: 'Iron', v: `${micros.ironMg}mg` },
    { k: 'Sat Fat', v: `${micros.saturatedFatG}g` },
    { k: 'Fiber', v: `${micros.fiberG}g` },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((i) => (
        <div key={i.k} className="rounded-xl border border-black/10 p-3">
          <div className="text-[11px] text-black/60">{i.k}</div>
          <div className="mt-1 text-sm font-semibold">{i.v}</div>
        </div>
      ))}
    </div>
  )
}

export function MicronutrientGrid({ tier, micros }: { tier: UserTier; micros?: Micronutrients }) {
  const fallback: Micronutrients = micros ?? {
    sugarG: 0,
    sodiumMg: 0,
    ironMg: 0,
    saturatedFatG: 0,
    fiberG: 0,
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Micronutrients</div>
          <div className="text-xs text-black/60">Vitamins / sugar / sodium insights</div>
        </div>
        <div className="rounded-full border border-black/10 px-2 py-1 text-[11px] font-medium">PRO</div>
      </div>

      {tier === 'premium' ? <Grid micros={fallback} /> : <LockedOverlay><Grid micros={fallback} /></LockedOverlay>}
    </Card>
  )
}
