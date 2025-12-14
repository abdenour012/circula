import { z } from 'zod'

// Enums
export const UserTierSchema = z.enum(['free', 'premium'])
export const DietaryStyleSchema = z.enum(['balanced', 'keto', 'vegan'])
export const GoalSchema = z.enum(['lose', 'maintain', 'gain'])
export const SexSchema = z.enum(['male', 'female'])
export const ActivityLevelSchema = z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
export const ScanKindSchema = z.enum(['meal', 'snack', 'barcode'])

// Base schemas
export const MacroBreakdownSchema = z.object({
  calories: z.number().min(0).max(10000),
  proteinG: z.number().min(0).max(1000),
  carbsG: z.number().min(0).max(1000),
  fatG: z.number().min(0).max(1000),
})

export const MicronutrientsSchema = z.object({
  sugarG: z.number().min(0).max(500),
  sodiumMg: z.number().min(0).max(50000),
  ironMg: z.number().min(0).max(100),
  saturatedFatG: z.number().min(0).max(500),
  fiberG: z.number().min(0).max(200),
})

export const PortionBreakdownSchema = z.object({
  ingredient: z.string().min(1).max(200),
  amount: z.string().max(100),
  calories: z.number().min(0).max(5000),
  proteinG: z.number().min(0).max(500),
  carbsG: z.number().min(0).max(500),
  fatG: z.number().min(0).max(500),
})

export const BiometricsSchema = z.object({
  age: z.number().int().min(10).max(120),
  sex: SexSchema,
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  activity: ActivityLevelSchema,
  goal: GoalSchema,
  dietaryStyle: DietaryStyleSchema,
})

export const TargetsSchema = z.object({
  calories: z.number().min(800).max(5000),
  proteinG: z.number().min(50).max(500),
  carbsG: z.number().min(0).max(1000),
  fatG: z.number().min(0).max(500),
})

export const DailyPlanSchema = z.object({
  dinner: z.string().max(200),
  workout: z.string().max(200),
  workoutNote: z.string().max(500).optional(),
})

export const ScanResultSchema = z.object({
  id: z.string().min(1),
  at: z.number().int().positive(),
  kind: ScanKindSchema,
  name: z.string().min(1).max(200),
  macros: MacroBreakdownSchema,
  micros: MicronutrientsSchema.optional(),
  notes: z.array(z.string().max(200)).max(10).optional(),
  imageUrl: z.string().url().optional(),
  isMock: z.boolean().optional(),
  portionBreakdown: z.array(PortionBreakdownSchema).max(20).optional(),
})

export const FastingSchema = z.object({
  isActive: z.boolean(),
  startedAt: z.number().int().positive().optional(),
  goalHours: z.number().int().min(8).max(48),
})

export const ProReactionSchema = z.object({
  at: z.number().int().positive(),
  title: z.string().max(100),
  message: z.string().max(500),
  dinnerOverride: z.string().max(200).optional(),
  workoutOverride: z.string().max(200).optional(),
})

export const HistoryEntrySchema = z.object({
  id: z.string().min(1),
  at: z.number().int().positive(),
  type: z.enum(['meal', 'snack', 'water', 'fasting_start', 'fasting_end']),
  data: z.object({
    name: z.string().optional(),
    calories: z.number().min(0).optional(),
    macros: MacroBreakdownSchema.optional(),
    cups: z.number().int().min(1).max(20).optional(),
    hours: z.number().min(0).max(48).optional(),
  }),
})

export const FavoriteMealSchema = z.object({
  id: z.string(),
  name: z.string(),
  macros: MacroBreakdownSchema,
  micros: MicronutrientsSchema.optional(),
  createdAt: z.number().int().positive(),
})

export const WeightEntrySchema = z.object({
  date: z.number().int().positive(),
  weightKg: z.number().min(30).max(300),
})

export const AppStateSchema = z.object({
  tier: UserTierSchema,
  biometrics: BiometricsSchema.optional(),
  targets: TargetsSchema.optional(),
  consumed: MacroBreakdownSchema,
  scans: z.array(ScanResultSchema),
  plan: DailyPlanSchema,
  hydrationCups: z.number().int().min(0).max(50),
  hydrationHistory: z.array(z.object({
    at: z.number().int().positive(),
    cups: z.number().int().min(1).max(20),
  })).optional().default([]),
  fasting: FastingSchema,
  fastingHistory: z.array(z.object({
    startedAt: z.number().int().positive(),
    endedAt: z.number().int().positive().optional(),
    hours: z.number().min(0).max(48).optional(),
  })).optional().default([]),
  history: z.array(HistoryEntrySchema).optional().default([]),
  lastMealAt: z.number().int().positive().optional(),
  proReaction: ProReactionSchema.optional(),
  favorites: z.array(FavoriteMealSchema).optional(),
  weightHistory: z.array(WeightEntrySchema).optional(),
  undoStack: z.array(z.any()).optional(), // Allow any for undo stack
})

// Type exports
export type ValidatedAppState = z.infer<typeof AppStateSchema>
export type ValidatedBiometrics = z.infer<typeof BiometricsSchema>
export type ValidatedScanResult = z.infer<typeof ScanResultSchema>
