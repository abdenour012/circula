import { useMemo, useState, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { ChevronRight } from 'lucide-react'
import type { ActivityLevel, Biometrics, DietaryStyle, Goal, Sex } from '../types'
import { calcBmr, calcTdee, calcTargets } from '../lib/nutrition'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

function FieldLabel({ children }: { children: string }) {
  return <div className="mb-1 text-[11px] font-medium text-black/70">{children}</div>
}

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/30"
    />
  )
}

function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/30"
    />
  )
}

export function OnboardingScreen({
  onComplete,
}: {
  onComplete: (bio: Biometrics) => void
}) {
  const [age, setAge] = useState(24)
  const [sex, setSex] = useState<Sex>('male')
  const [heightCm, setHeightCm] = useState(175)
  const [weightKg, setWeightKg] = useState(72)
  const [activity, setActivity] = useState<ActivityLevel>('moderate')
  const [goal, setGoal] = useState<Goal>('maintain')
  const [dietaryStyle, setDietaryStyle] = useState<DietaryStyle>('balanced')

  const bio: Biometrics = useMemo(
    () => ({ age, sex, heightCm, weightKg, activity, goal, dietaryStyle }),
    [activity, age, dietaryStyle, goal, heightCm, sex, weightKg],
  )

  const bmr = useMemo(() => calcBmr(bio), [bio])
  const tdee = useMemo(() => calcTdee(bio), [bio])
  const targets = useMemo(() => calcTargets(bio), [bio])

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <div className="mb-6">
        <div className="text-xs font-semibold tracking-wide text-[#DC2626]">CIRCULA</div>
        <div className="mt-1 text-2xl font-semibold">Onboarding</div>
        <div className="mt-1 text-sm text-black/60">
          Bio-metrics → daily targets. Minimal input, maximum automation.
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Age</FieldLabel>
              <Input type="number" min={10} max={90} value={age} onChange={(e) => setAge(Number(e.target.value))} />
            </div>
            <div>
              <FieldLabel>Sex</FieldLabel>
              <Select value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>
            </div>
            <div>
              <FieldLabel>Height (cm)</FieldLabel>
              <Input
                type="number"
                min={120}
                max={220}
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
              />
            </div>
            <div>
              <FieldLabel>Weight (kg)</FieldLabel>
              <Input
                type="number"
                min={35}
                max={200}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Dietary style</FieldLabel>
              <Select value={dietaryStyle} onChange={(e) => setDietaryStyle(e.target.value as DietaryStyle)}>
                <option value="balanced">Balanced</option>
                <option value="keto">Keto</option>
                <option value="vegan">Vegan</option>
              </Select>
            </div>
            <div>
              <FieldLabel>Goal</FieldLabel>
              <Select value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
                <option value="lose">Lose</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Gain</option>
              </Select>
            </div>
            <div className="col-span-2">
              <FieldLabel>Activity level</FieldLabel>
              <Select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very_active">Very active</option>
              </Select>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">Output</div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-black/10 p-3">
              <div className="text-[11px] text-black/60">BMR</div>
              <div className="mt-1 text-lg font-semibold">{bmr} kcal</div>
            </div>
            <div className="rounded-xl border border-black/10 p-3">
              <div className="text-[11px] text-black/60">TDEE</div>
              <div className="mt-1 text-lg font-semibold">{tdee} kcal</div>
            </div>
            <div className="col-span-2 rounded-xl border border-black/10 p-3">
              <div className="text-[11px] text-black/60">Daily targets</div>
              <div className="mt-1 text-sm font-semibold">
                {targets.calories} kcal • P {targets.proteinG}g • C {targets.carbsG}g • F {targets.fatG}g
              </div>
            </div>
          </div>

          <Button className="mt-4 w-full" variant="primary" onClick={() => onComplete(bio)}>
            Continue <ChevronRight className="h-4 w-4" />
          </Button>
        </Card>

        <div className="text-center text-xs text-black/50">
          Freemium demo: you can toggle CORE/PRO later in Settings.
        </div>
      </div>
    </div>
  )
}
