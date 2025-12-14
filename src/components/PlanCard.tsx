import { Dumbbell, Utensils, AlertTriangle } from 'lucide-react'
import type { DailyPlan, UserTier } from '../types'
import { Card } from './Card'
import { cn } from '../lib/cn'

function Inner({ plan, isNearCalorieLimit, remainingCalories }: { plan: DailyPlan; isNearCalorieLimit: boolean; remainingCalories: number }) {
  return (
    <div className="space-y-3">
      {isNearCalorieLimit && (
        <div className={cn(
          "rounded-xl border-2 p-3 mb-2",
          "border-[#DC2626]/30 bg-[#DC2626]/5"
        )}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-[#DC2626]">Calorie Warning</div>
              <div className="text-[11px] text-black/70 mt-0.5">
                {remainingCalories > 0 
                  ? `Only ${Math.round(remainingCalories)} kcal remaining. Choose lighter dinner options.`
                  : 'Daily limit exceeded. Consider very light dinner options.'}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={cn(
          "grid h-9 w-9 place-items-center rounded-xl border",
          isNearCalorieLimit 
            ? "border-[#DC2626]/30 bg-[#DC2626]/5" 
            : "border-black/10"
        )}>
          <Utensils className={cn("h-4 w-4", isNearCalorieLimit && "text-[#DC2626]")} />
        </div>
        <div>
          <div className="text-[11px] text-black/60">Dinner plan</div>
          <div className={cn(
            "text-sm font-semibold",
            isNearCalorieLimit && "text-[#DC2626]"
          )}>
            {plan.dinner}
          </div>
          {isNearCalorieLimit && (
            <div className="text-[10px] text-[#DC2626]/80 mt-1">
              ⚠️ This meal may exceed your remaining calories
            </div>
          )}
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-black/10">
          <Dumbbell className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[11px] text-black/60">Workout</div>
          <div className="text-sm font-semibold">{plan.workout}</div>
          {plan.workoutNote && <div className="text-xs text-black/60">{plan.workoutNote}</div>}
        </div>
      </div>
    </div>
  )
}

export function PlanCard({ 
  tier, 
  plan, 
  isNearCalorieLimit = false, 
  remainingCalories = 0 
}: { 
  tier: UserTier
  plan: DailyPlan
  isNearCalorieLimit?: boolean
  remainingCalories?: number
}) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Today</div>
          <div className="text-xs text-black/60">Dinner + workout plan</div>
        </div>
        <div className="rounded-full border border-black/10 px-2 py-1 text-[11px] font-medium">{tier === 'premium' ? 'PRO' : 'CORE'}</div>
      </div>

      <Inner plan={plan} isNearCalorieLimit={isNearCalorieLimit} remainingCalories={remainingCalories} />

      {tier === 'free' && (
        <div className="mt-3 text-xs text-black/60">
          Upgrade to PRO to enable dynamic adjustments (“Reaction”).
        </div>
      )}
    </Card>
  )
}
