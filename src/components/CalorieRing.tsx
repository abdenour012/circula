import { cn } from '../lib/cn'

export function CalorieRing({
  consumed,
  target,
}: {
  consumed: number
  target: number
}) {
  const size = 132
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = target <= 0 ? 0 : Math.min(1, consumed / target)
  const over = consumed > target

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect when over */}
        {over && (
          <div className="absolute inset-0 rounded-full bg-[#DC2626]/20 blur-xl anim-pulse-glow" />
        )}
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={stroke}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={over ? '#DC2626' : '#DC2626'}
            strokeWidth={stroke}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={over ? '4 6' : `${c}`}
            strokeDashoffset={over ? 0 : c * (1 - pct)}
            className={cn(
              'motion-safe:transition-[stroke-dashoffset,stroke] motion-safe:duration-700 motion-safe:ease-out',
              over && 'drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]',
            )}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className={cn('text-2xl font-semibold anim-count-up', over && 'text-[#DC2626]')}>
              {Math.round(consumed)}
            </div>
            <div className="text-xs text-black/60">/ {Math.round(target)} kcal</div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="text-sm font-semibold">Daily energy</div>
        <div className={cn('text-xs text-black/60', over && 'text-[#DC2626]')}>
          {over ? 'Over target — adjust dinner/workout.' : 'On track.'}
        </div>
      </div>
    </div>
  )
}
