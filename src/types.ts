export type UserTier = 'free' | 'premium'

export type DietaryStyle = 'balanced' | 'keto' | 'vegan'
export type Goal = 'lose' | 'maintain' | 'gain'
export type Sex = 'male' | 'female'

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'

export type Biometrics = {
  age: number
  sex: Sex
  heightCm: number
  weightKg: number
  activity: ActivityLevel
  goal: Goal
  dietaryStyle: DietaryStyle
}

export type Targets = {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export type MacroBreakdown = {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export type Micronutrients = {
  sugarG: number
  sodiumMg: number
  ironMg: number
  saturatedFatG: number
  fiberG: number
}

export type ScanKind = 'meal' | 'snack' | 'barcode'

export type PortionBreakdown = {
  ingredient: string
  amount: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export type ScanResult = {
  id: string
  at: number // epoch ms
  kind: ScanKind
  name: string
  macros: MacroBreakdown
  micros?: Micronutrients
  notes?: string[]
  imageUrl?: string // Data URL of the scanned image
  isMock?: boolean // Indicates if this is mock/fallback data
  portionBreakdown?: PortionBreakdown[] // Detailed breakdown of portions
}

export type DailyPlan = {
  dinner: string
  workout: string
  workoutNote?: string
}

export type RecipeCard = {
  title: string
  ingredients: string[]
  steps: string[]
  estimatedMacros: MacroBreakdown
}

export type HistoryEntry = {
  id: string
  at: number // epoch ms
  type: 'meal' | 'snack' | 'water' | 'fasting_start' | 'fasting_end'
  data: {
    // For meals/snacks
    name?: string
    calories?: number
    macros?: MacroBreakdown
    // For water
    cups?: number
    // For fasting
    hours?: number
  }
}

export type FavoriteMeal = {
  id: string
  name: string
  macros: MacroBreakdown
  micros?: Micronutrients
  createdAt: number
}

export type WeightEntry = {
  date: number
  weightKg: number
}

export type AppState = {
  tier: UserTier
  biometrics?: Biometrics
  targets?: Targets
  consumed: MacroBreakdown
  scans: ScanResult[]
  plan: DailyPlan
  hydrationCups: number
  hydrationHistory: Array<{ at: number; cups: number }> // Track when water was drunk
  fasting: {
    isActive: boolean
    startedAt?: number
    goalHours: number
  }
  fastingHistory: Array<{ startedAt: number; endedAt?: number; hours?: number }> // Track fasting periods
  history: HistoryEntry[] // Combined history of all activities
  lastMealAt?: number
  proReaction?: {
    at: number
    title: string
    message: string
    dinnerOverride?: string
    workoutOverride?: string
  }
  favorites?: FavoriteMeal[] // Favorite meals
  weightHistory?: WeightEntry[] // Weight tracking history
  undoStack?: AppState[] // For undo functionality
}
