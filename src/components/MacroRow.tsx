import { cn } from '../lib/cn'

export function MacroRow({
  protein,
  carbs,
  fat,
  targets,
}: {
  protein: number
  carbs: number
  fat: number
  targets?: { proteinG: number; carbsG: number; fatG: number }
}) {
  const items = [
    { label: 'Protein', value: protein, target: targets?.proteinG, color: 'bg-blue-500' },
    { label: 'Carbs', value: carbs, target: targets?.carbsG, color: 'bg-orange-500' },
    { label: 'Fat', value: fat, target: targets?.fatG, color: 'bg-yellow-500' },
  ]

  return (
    <div className="space-y-3">
      {items.map((i, idx) => {
        const pct = i.target && i.target > 0 ? Math.min(1, i.value / i.target) : 0
        const over = i.target ? i.value > i.target : false
        
        return (
          <div
            key={i.label}
            className={cn('anim-fade-up', `anim-stagger-${idx + 1}`)}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-xs font-semibold text-black/70">{i.label}</div>
              <div className="text-xs font-semibold text-black">
                {Math.round(i.value)}<span className="text-black/50"> / {i.target ? Math.round(i.target) : '—'}g</span>
              </div>
            </div>
            <div className="relative h-2 w-full rounded-full bg-black/5 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  i.color,
                  over && 'bg-red-500'
                )}
                style={{ width: `${Math.min(100, pct * 100)}%` }}
              />
              {over && (
                <div
                  className="absolute top-0 left-0 h-full bg-red-500 opacity-50"
                  style={{ width: '100%' }}
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
