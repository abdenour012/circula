import { useState } from 'react'
import { ChevronDown, ChevronUp, Activity, Zap, Target } from 'lucide-react'
import type { Exercise } from '../lib/exercises'
import { Card } from './Card'
import { cn } from '../lib/cn'

export function ExerciseCard({
  exercise,
  caloriesToBurn,
  duration,
  isUrgent = false,
}: {
  exercise: Exercise
  caloriesToBurn: number
  duration: ReturnType<Exercise['getDuration']>
  isUrgent?: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  const intensityColors = {
    low: 'bg-green-100 border-green-300 text-green-800',
    moderate: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    high: 'bg-red-100 border-red-300 text-red-800',
  }

  const intensityIcons = {
    low: Activity,
    moderate: Target,
    high: Zap,
  }

  const IntensityIcon = intensityIcons[exercise.intensity]

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      isUrgent && "border-2 border-[#DC2626]/40 bg-gradient-to-br from-[#DC2626]/5 to-white"
    )}>
      <div 
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          {/* Exercise Icon/Emoji */}
          <div className={cn(
            "flex h-14 w-14 items-center justify-center rounded-xl text-3xl border-2 transition-all",
            isUrgent 
              ? "border-[#DC2626]/30 bg-[#DC2626]/10" 
              : "border-black/10 bg-black/5"
          )}>
            {exercise.icon}
          </div>

          {/* Exercise Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-black">{exercise.name}</h3>
                  {isUrgent && (
                    <span className="text-[10px] font-bold text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-full">
                      URGENT
                    </span>
                  )}
                </div>
                <p className="text-xs text-black/60 line-clamp-1">{exercise.description}</p>
              </div>
              <button className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors">
                {expanded ? (
                  <ChevronUp className="h-4 w-4 text-black/60" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-black/60" />
                )}
              </button>
            </div>

            {/* Duration and Calories */}
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                  intensityColors[exercise.intensity]
                )}>
                  <div className="flex items-center gap-1">
                    <IntensityIcon className="h-3 w-3" />
                    {exercise.intensity.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="text-xs text-black/70">
                <span className="font-semibold">{duration.description}</span>
              </div>
            </div>

            {/* Calories to burn */}
            <div className="mt-2 flex items-center gap-2">
              <div className="text-xs text-black/50">Burns:</div>
              <div className="text-sm font-bold text-[#DC2626]">
                ~{caloriesToBurn} kcal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Instructions */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-black/10 anim-fade-in">
          <div className="mb-3">
            <div className="text-xs font-semibold text-black/70 mb-2">How to do it:</div>
            <ul className="space-y-2">
              {exercise.instructions.map((instruction, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-black/70">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#DC2626]/10 text-[#DC2626] font-bold text-[10px] flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-[10px] text-black/50">
            <span>Category: {exercise.category}</span>
            <span>•</span>
            <span>Intensity: {exercise.intensity}</span>
          </div>
        </div>
      )}
    </Card>
  )
}
