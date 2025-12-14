import { useMemo } from 'react'
import { Dumbbell, AlertTriangle, Info } from 'lucide-react'
import type { Biometrics, Targets } from '../types'
import { getRecommendedExercises } from '../lib/exercises'
import { Card } from './Card'
import { ExerciseCard } from './ExerciseCard'

export function TodaysExercises({
  consumed,
  targets,
  biometrics,
}: {
  consumed: { calories: number }
  targets: Targets
  biometrics?: Biometrics
}) {
  const exercises = useMemo(() => {
    if (!biometrics) return []
    return getRecommendedExercises(consumed.calories, targets.calories, biometrics, 6)
  }, [consumed.calories, targets.calories, biometrics])

  const caloriePercentage = (consumed.calories / targets.calories) * 100
  const remainingCalories = targets.calories - consumed.calories
  const excessCalories = Math.max(0, consumed.calories - targets.calories)
  const isUrgent = excessCalories > 0 || caloriePercentage >= 90

  if (!biometrics) {
    return null
  }

  return (
    <Card className="anim-fade-up anim-stagger-3">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="h-4 w-4 text-[#DC2626]" />
            <div className="text-base font-bold">Today's Exercises</div>
          </div>
          <div className="text-xs text-black/60">
            Personalized workouts based on your calorie intake
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {isUrgent ? (
        <div className="mb-4 rounded-xl border-2 border-[#DC2626]/40 bg-[#DC2626]/5 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-bold text-[#DC2626] mb-1">
                {excessCalories > 0 ? 'Calorie Limit Exceeded' : 'Approaching Daily Limit'}
              </div>
              <div className="text-[11px] text-black/80">
                {excessCalories > 0 ? (
                  <>You've consumed {Math.round(excessCalories)} extra calories. These exercises will help you burn them off.</>
                ) : (
                  <>You're at {Math.round(caloriePercentage)}% of your daily limit. Exercise now to stay on track.</>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : caloriePercentage >= 60 ? (
        <div className="mb-4 rounded-xl border border-yellow-300/40 bg-yellow-50/50 p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-yellow-800 mb-1">
                Getting Close to Limit
              </div>
              <div className="text-[11px] text-yellow-700/80">
                You've consumed {Math.round(caloriePercentage)}% of your daily calories. Consider light exercise to maintain balance.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-green-300/40 bg-green-50/50 p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-green-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-green-800 mb-1">
                On Track
              </div>
              <div className="text-[11px] text-green-700/80">
                You're doing well! {Math.round(remainingCalories)} kcal remaining. Optional light exercises for maintenance.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercises List */}
      {exercises.length > 0 ? (
        <div className="space-y-3">
          {exercises.map((item, idx) => (
            <ExerciseCard
              key={item.exercise.id}
              exercise={item.exercise}
              caloriesToBurn={item.caloriesToBurn}
              duration={item.duration}
              isUrgent={isUrgent && idx < 2} // Mark first 2 as urgent if over limit
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-black/60">
          No exercises recommended at this time.
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 pt-3 border-t border-black/5 text-[10px] text-black/50 text-center">
        Exercises are calculated based on your age ({biometrics.age}), weight ({Math.round(biometrics.weightKg)}kg), and activity level. 
        Adjust intensity as needed.
      </div>
    </Card>
  )
}
