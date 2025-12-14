import { Droplets, Minus, Plus } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'

export function HydrationCard({
  cups,
  onChange,
}: {
  cups: number
  onChange: (next: number) => void
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Droplets className="h-4 w-4" /> Hydration
          </div>
          <div className="text-xs text-black/60">Simple counter</div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onChange(Math.max(0, cups - 1))} aria-label="Decrease">
            <Minus className="h-4 w-4" />
          </Button>
          <div key={cups} className="min-w-10 text-center text-lg font-semibold anim-pop">
            {cups}
          </div>
          <Button size="sm" variant="ghost" onClick={() => onChange(cups + 1)} aria-label="Increase">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
