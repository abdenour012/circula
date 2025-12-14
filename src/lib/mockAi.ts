import type {
  DailyPlan,
  MacroBreakdown,
  RecipeCard,
  ScanKind,
  ScanResult,
  Targets,
  UserTier,
} from '../types'

function id() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

const MEALS = [
  {
    name: 'Chicken Sandwich',
    macros: { calories: 450, proteinG: 30, carbsG: 42, fatG: 14 },
    proName: 'Fried Chicken Sandwich',
    proMicros: { sugarG: 6, sodiumMg: 1200, ironMg: 2.1, saturatedFatG: 6.5, fiberG: 3 },
    proNotes: ['High sodium', 'High saturated fat'],
  },
  {
    name: 'Greek Yogurt + Berries',
    macros: { calories: 280, proteinG: 20, carbsG: 28, fatG: 7 },
    proName: 'Greek Yogurt + Berries (Honey)',
    proMicros: { sugarG: 18, sodiumMg: 110, ironMg: 0.3, saturatedFatG: 2.2, fiberG: 5 },
    proNotes: ['Sugar elevated (honey)'],
  },
  {
    name: 'Rice Bowl',
    macros: { calories: 620, proteinG: 32, carbsG: 78, fatG: 18 },
    proName: 'Teriyaki Rice Bowl',
    proMicros: { sugarG: 14, sodiumMg: 980, ironMg: 3.2, saturatedFatG: 3.8, fiberG: 6 },
    proNotes: ['Sodium elevated (sauce)'],
  },
]

const SNACKS = [
  {
    name: 'Chocolate Bar',
    macros: { calories: 240, proteinG: 3, carbsG: 28, fatG: 13 },
    proName: 'Chocolate Bar (Sugary Snack)',
    proMicros: { sugarG: 24, sodiumMg: 60, ironMg: 1.4, saturatedFatG: 8.2, fiberG: 2 },
    proNotes: ['High sugar'],
    triggersReaction: true,
  },
  {
    name: 'Almonds (Handful)',
    macros: { calories: 180, proteinG: 6, carbsG: 6, fatG: 15 },
    proName: 'Roasted Almonds (Handful)',
    proMicros: { sugarG: 1, sodiumMg: 140, ironMg: 1.1, saturatedFatG: 1.1, fiberG: 4 },
    proNotes: [],
    triggersReaction: false,
  },
]

export function defaultPlan(): DailyPlan {
  return {
    dinner: 'Rice Bowl',
    workout: 'Walk (30 min)',
  }
}

export function simulateScan(tier: UserTier, kind: ScanKind): ScanResult {
  const at = Date.now()

  if (kind === 'snack') {
    const s = SNACKS[Math.floor(Math.random() * SNACKS.length)]
    return {
      id: id(),
      at,
      kind,
      name: tier === 'premium' ? s.proName : s.name,
      macros: s.macros,
      micros: tier === 'premium' ? s.proMicros : undefined,
      notes: tier === 'premium' ? s.proNotes : undefined,
    }
  }

  // meal or barcode
  const m = MEALS[Math.floor(Math.random() * MEALS.length)]
  return {
    id: id(),
    at,
    kind,
    name: tier === 'premium' ? m.proName : m.name,
    macros: m.macros,
    micros: tier === 'premium' ? m.proMicros : undefined,
    notes: tier === 'premium' ? m.proNotes : undefined,
  }
}

export function shouldTriggerReaction(scan: ScanResult) {
  if (scan.kind !== 'snack') return false
  const name = scan.name.toLowerCase()
  return name.includes('sugary') || (scan.micros?.sugarG ?? 0) >= 20
}

export function applyReaction(plan: DailyPlan, scan: ScanResult): DailyPlan {
  // Premium dynamic adaptation: simplify to a deterministic adjustment.
  if (!shouldTriggerReaction(scan)) return plan
  return {
    dinner: 'Low-Carb Salad',
    workout: 'Run (20 min)',
    workoutNote: 'Intensity increased due to high lunch/snack intake.',
  }
}

export function addMacros(a: MacroBreakdown, b: MacroBreakdown): MacroBreakdown {
  return {
    calories: a.calories + b.calories,
    proteinG: a.proteinG + b.proteinG,
    carbsG: a.carbsG + b.carbsG,
    fatG: a.fatG + b.fatG,
  }
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function simulateFridgeScan(tier: UserTier, targets?: Targets, consumed?: MacroBreakdown): RecipeCard {
  const ingredients = ['Eggs', 'Spinach', 'Tomato', 'Greek Yogurt']

  const remaining = targets && consumed
    ? {
        calories: Math.max(0, targets.calories - consumed.calories),
        proteinG: Math.max(0, targets.proteinG - consumed.proteinG),
        carbsG: Math.max(0, targets.carbsG - consumed.carbsG),
        fatG: Math.max(0, targets.fatG - consumed.fatG),
      }
    : { calories: 500, proteinG: 35, carbsG: 45, fatG: 18 }

  const title = tier === 'premium' ? 'Fridge Chef: Spinach-Tomato Omelet' : 'Recipe (PRO)'

  return {
    title,
    ingredients: tier === 'premium' ? ingredients : ['Locked'],
    steps:
      tier === 'premium'
        ? [
            'Whisk eggs with a pinch of salt.',
            'Sauté spinach and tomato 2–3 min.',
            'Add eggs; cook until set.',
            'Serve with a side of yogurt if protein is low.',
          ]
        : ['Upgrade to PRO to generate recipes.'],
    estimatedMacros: {
      calories: clamp(Math.round(remaining.calories * 0.45), 280, 650),
      proteinG: clamp(Math.round(remaining.proteinG * 0.55), 22, 55),
      carbsG: clamp(Math.round(remaining.carbsG * 0.35), 10, 60),
      fatG: clamp(Math.round(remaining.fatG * 0.45), 10, 35),
    },
  }
}
