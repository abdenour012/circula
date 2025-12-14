import type { ActivityLevel, Biometrics, Goal, Targets } from '../types'

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function calcBmr(bio: Pick<Biometrics, 'sex' | 'age' | 'heightCm' | 'weightKg'>) {
  // Mifflin-St Jeor
  const base = 10 * bio.weightKg + 6.25 * bio.heightCm - 5 * bio.age
  return Math.round(bio.sex === 'male' ? base + 5 : base - 161)
}

export function calcTdee(bio: Pick<Biometrics, 'sex' | 'age' | 'heightCm' | 'weightKg' | 'activity'>) {
  const bmr = calcBmr(bio)
  return Math.round(bmr * activityMultipliers[bio.activity])
}

function goalCalorieAdjustment(goal: Goal) {
  switch (goal) {
    case 'lose':
      return -400
    case 'gain':
      return 300
    case 'maintain':
    default:
      return 0
  }
}

export function calcTargets(bio: Biometrics): Targets {
  const tdee = calcTdee(bio)
  const calories = Math.max(1200, tdee + goalCalorieAdjustment(bio.goal))

  // Simple macro defaults; adjust slightly by style.
  // Protein: ~1.6g/kg (capped a bit for UX)
  const proteinG = Math.round(Math.min(200, Math.max(80, bio.weightKg * 1.6)))

  let carbsRatio = 0.45
  let fatRatio = 0.30

  if (bio.dietaryStyle === 'keto') {
    carbsRatio = 0.10
    fatRatio = 0.60
  } else if (bio.dietaryStyle === 'vegan') {
    carbsRatio = 0.55
    fatRatio = 0.25
  }

  const proteinCalories = proteinG * 4
  const remaining = Math.max(0, calories - proteinCalories)

  const carbsG = Math.round((remaining * carbsRatio) / 4)
  const fatG = Math.round((remaining * fatRatio) / 9)

  return {
    calories,
    proteinG,
    carbsG,
    fatG,
  }
}

export function formatKcal(n: number) {
  return `${Math.round(n)} kcal`
}
