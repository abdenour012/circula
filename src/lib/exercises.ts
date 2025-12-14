import type { Biometrics } from '../types'

export type ExerciseType = 
  | 'walking'
  | 'running'
  | 'cycling'
  | 'jogging'
  | 'pushups'
  | 'squats'
  | 'plank'
  | 'jumping_jacks'
  | 'burpees'
  | 'lunges'
  | 'mountain_climbers'
  | 'sit_ups'
  | 'high_knees'
  | 'wall_sit'
  | 'dancing'
  | 'yoga'
  | 'stair_climbing'
  | 'swimming'

export type Exercise = {
  id: ExerciseType
  name: string
  description: string
  icon: string // Emoji or icon identifier
  caloriesPerMinute: (bio: Biometrics) => number // Function to calculate calories per minute
  getDuration: (caloriesToBurn: number, bio: Biometrics) => { duration: number; unit: string; description: string }
  intensity: 'low' | 'moderate' | 'high'
  category: 'cardio' | 'strength' | 'flexibility'
  instructions: string[]
}

// Calculate calories burned per minute based on MET (Metabolic Equivalent of Task) values
// MET values are adjusted by weight
function calcCaloriesPerMinute(met: number, weightKg: number): number {
  // MET × weight (kg) × 0.0175 = kcal/min
  return (met * weightKg * 0.0175)
}

// Calculate calories burned per step (walking/running) - kept for future use
// function calcCaloriesPerStep(weightKg: number, isRunning: boolean = false): number {
//   // Approximate: 0.04-0.05 kcal per step for walking, 0.06-0.08 for running
//   const base = isRunning ? 0.07 : 0.045
//   return base * (weightKg / 70) // Normalize to 70kg person
// }

export const exercises: Exercise[] = [
  {
    id: 'walking',
    name: 'Walking',
    description: 'Low-impact cardio perfect for burning calories throughout the day',
    icon: '🚶',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(3.5, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(3.5, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const steps = Math.round(minutes * 100) // ~100 steps per minute
      return {
        duration: steps,
        unit: 'steps',
        description: `Walk ${steps.toLocaleString()} steps (about ${Math.round(minutes)} minutes)`
      }
    },
    intensity: 'low',
    category: 'cardio',
    instructions: [
      'Maintain an upright posture',
      'Swing your arms naturally',
      'Take comfortable strides',
      'Aim for 100-120 steps per minute'
    ]
  },
  {
    id: 'running',
    name: 'Running',
    description: 'High-intensity cardio that burns calories quickly',
    icon: '🏃',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(11.5, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(11.5, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const distance = Math.round(minutes * 0.15 * 10) / 10 // ~9.6 km/h average
      return {
        duration: minutes,
        unit: 'minutes',
        description: `Run for ${Math.round(minutes)} minutes (about ${distance} km)`
      }
    },
    intensity: 'high',
    category: 'cardio',
    instructions: [
      'Start with a 5-minute warm-up walk',
      'Maintain steady breathing',
      'Land on midfoot, not heel',
      'Keep a comfortable pace'
    ]
  },
  {
    id: 'jogging',
    name: 'Jogging',
    description: 'Moderate-intensity running at a comfortable pace',
    icon: '🏃‍♂️',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(7.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(7.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      return {
        duration: minutes,
        unit: 'minutes',
        description: `Jog for ${Math.round(minutes)} minutes`
      }
    },
    intensity: 'moderate',
    category: 'cardio',
    instructions: [
      'Start slow and build pace gradually',
      'Maintain conversation pace',
      'Focus on consistent rhythm',
      'Cool down with 5 minutes walking'
    ]
  },
  {
    id: 'cycling',
    name: 'Cycling',
    description: 'Great low-impact exercise for burning calories',
    icon: '🚴',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(8.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(8.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const distance = Math.round(minutes * 0.2 * 10) / 10 // ~12 km/h average
      return {
        duration: minutes,
        unit: 'minutes',
        description: `Cycle for ${Math.round(minutes)} minutes (about ${distance} km)`
      }
    },
    intensity: 'moderate',
    category: 'cardio',
    instructions: [
      'Adjust seat height to hip level',
      'Maintain steady pedaling rhythm',
      'Keep back straight, core engaged',
      'Use gears to maintain effort'
    ]
  },
  {
    id: 'pushups',
    name: 'Push-ups',
    description: 'Build upper body strength while burning calories',
    icon: '💪',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(8.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(8.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const reps = Math.round(minutes * 15) // ~15 reps per minute
      return {
        duration: reps,
        unit: 'reps',
        description: `Do ${reps} push-ups (in sets of 10-15)`
      }
    },
    intensity: 'moderate',
    category: 'strength',
    instructions: [
      'Start in plank position, hands shoulder-width',
      'Lower body until chest nearly touches floor',
      'Push back up to starting position',
      'Keep core tight, body straight'
    ]
  },
  {
    id: 'squats',
    name: 'Squats',
    description: 'Target legs and glutes while burning calories',
    icon: '🦵',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(5.5, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(5.5, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const reps = Math.round(minutes * 20) // ~20 reps per minute
      return {
        duration: reps,
        unit: 'reps',
        description: `Do ${reps} squats (in sets of 15-20)`
      }
    },
    intensity: 'moderate',
    category: 'strength',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower as if sitting in a chair',
      'Keep knees behind toes',
      'Return to standing position'
    ]
  },
  {
    id: 'plank',
    name: 'Plank',
    description: 'Core strengthening exercise that burns calories',
    icon: '🧘',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(3.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(3.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const seconds = Math.round(minutes * 60)
      return {
        duration: seconds,
        unit: 'seconds',
        description: `Hold plank for ${seconds} seconds (in sets of 30-60s)`
      }
    },
    intensity: 'moderate',
    category: 'strength',
    instructions: [
      'Start in push-up position on forearms',
      'Keep body straight from head to heels',
      'Engage core, don\'t let hips sag',
      'Breathe normally'
    ]
  },
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    description: 'Full-body cardio exercise for quick calorie burn',
    icon: '🤸',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(8.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(8.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const reps = Math.round(minutes * 30) // ~30 reps per minute
      return {
        duration: reps,
        unit: 'reps',
        description: `Do ${reps} jumping jacks (in sets of 20-30)`
      }
    },
    intensity: 'high',
    category: 'cardio',
    instructions: [
      'Stand with feet together, arms at sides',
      'Jump while spreading legs and raising arms',
      'Return to starting position',
      'Maintain steady rhythm'
    ]
  },
  {
    id: 'burpees',
    name: 'Burpees',
    description: 'High-intensity full-body exercise',
    icon: '🔥',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(10.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(10.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const reps = Math.round(minutes * 8) // ~8 reps per minute
      return {
        duration: reps,
        unit: 'reps',
        description: `Do ${reps} burpees (in sets of 5-10)`
      }
    },
    intensity: 'high',
    category: 'cardio',
    instructions: [
      'Start standing, drop into squat',
      'Jump feet back to plank position',
      'Do a push-up (optional)',
      'Jump feet forward, jump up with arms raised'
    ]
  },
  {
    id: 'lunges',
    name: 'Lunges',
    description: 'Leg strengthening exercise',
    icon: '🦵',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(5.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(5.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const reps = Math.round(minutes * 12) // ~12 reps per minute
      return {
        duration: reps,
        unit: 'reps',
        description: `Do ${reps} lunges (alternating legs)`
      }
    },
    intensity: 'moderate',
    category: 'strength',
    instructions: [
      'Step forward with one leg',
      'Lower until both knees are at 90°',
      'Push back to starting position',
      'Alternate legs'
    ]
  },
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    description: 'High-intensity core and cardio exercise',
    icon: '⛰️',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(8.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(8.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const seconds = Math.round(minutes * 60)
      return {
        duration: seconds,
        unit: 'seconds',
        description: `Do mountain climbers for ${seconds} seconds (in sets of 30-60s)`
      }
    },
    intensity: 'high',
    category: 'cardio',
    instructions: [
      'Start in plank position',
      'Alternate bringing knees to chest',
      'Keep core engaged, back straight',
      'Maintain steady pace'
    ]
  },
  {
    id: 'sit_ups',
    name: 'Sit-ups',
    description: 'Core strengthening exercise',
    icon: '🧘‍♀️',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(4.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(4.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const reps = Math.round(minutes * 20) // ~20 reps per minute
      return {
        duration: reps,
        unit: 'reps',
        description: `Do ${reps} sit-ups (in sets of 15-20)`
      }
    },
    intensity: 'moderate',
    category: 'strength',
    instructions: [
      'Lie on back, knees bent, feet flat',
      'Place hands behind head or crossed on chest',
      'Lift upper body toward knees',
      'Lower back down with control'
    ]
  },
  {
    id: 'high_knees',
    name: 'High Knees',
    description: 'Cardio exercise that raises heart rate quickly',
    icon: '🦘',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(8.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(8.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const seconds = Math.round(minutes * 60)
      return {
        duration: seconds,
        unit: 'seconds',
        description: `Do high knees for ${seconds} seconds (in sets of 30-60s)`
      }
    },
    intensity: 'high',
    category: 'cardio',
    instructions: [
      'Stand in place, run on spot',
      'Bring knees up toward chest',
      'Pump arms naturally',
      'Maintain quick pace'
    ]
  },
  {
    id: 'wall_sit',
    name: 'Wall Sit',
    description: 'Isometric leg strengthening exercise',
    icon: '🧱',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(3.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(3.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const seconds = Math.round(minutes * 60)
      return {
        duration: seconds,
        unit: 'seconds',
        description: `Hold wall sit for ${seconds} seconds (in sets of 30-60s)`
      }
    },
    intensity: 'moderate',
    category: 'strength',
    instructions: [
      'Lean back against wall',
      'Slide down until knees at 90°',
      'Keep back flat against wall',
      'Hold position'
    ]
  },
  {
    id: 'dancing',
    name: 'Dancing',
    description: 'Fun cardio exercise that burns calories',
    icon: '💃',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(6.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(6.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      return {
        duration: minutes,
        unit: 'minutes',
        description: `Dance for ${Math.round(minutes)} minutes`
      }
    },
    intensity: 'moderate',
    category: 'cardio',
    instructions: [
      'Put on your favorite music',
      'Move your body freely',
      'Keep moving for the duration',
      'Have fun!'
    ]
  },
  {
    id: 'yoga',
    name: 'Yoga',
    description: 'Low-impact exercise for flexibility and strength',
    icon: '🧘',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(3.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(3.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      return {
        duration: minutes,
        unit: 'minutes',
        description: `Practice yoga for ${Math.round(minutes)} minutes`
      }
    },
    intensity: 'low',
    category: 'flexibility',
    instructions: [
      'Find a quiet space',
      'Follow a yoga routine or flow',
      'Focus on breathing',
      'Move mindfully'
    ]
  },
  {
    id: 'stair_climbing',
    name: 'Stair Climbing',
    description: 'High-intensity lower body exercise',
    icon: '📶',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(9.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(9.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      const flights = Math.round(minutes * 3) // ~3 flights per minute
      return {
        duration: flights,
        unit: 'flights',
        description: `Climb ${flights} flights of stairs (about ${Math.round(minutes)} minutes)`
      }
    },
    intensity: 'high',
    category: 'cardio',
    instructions: [
      'Use stairs at home or building',
      'Climb at steady pace',
      'Use handrail if needed',
      'Descend carefully'
    ]
  },
  {
    id: 'swimming',
    name: 'Swimming',
    description: 'Full-body low-impact exercise',
    icon: '🏊',
    caloriesPerMinute: (bio) => calcCaloriesPerMinute(7.0, bio.weightKg),
    getDuration: (caloriesToBurn, bio) => {
      const cpm = calcCaloriesPerMinute(7.0, bio.weightKg)
      const minutes = caloriesToBurn / cpm
      return {
        duration: minutes,
        unit: 'minutes',
        description: `Swim for ${Math.round(minutes)} minutes`
      }
    },
    intensity: 'moderate',
    category: 'cardio',
    instructions: [
      'Warm up with easy strokes',
      'Use any stroke you prefer',
      'Maintain steady pace',
      'Cool down with easy swimming'
    ]
  }
]

// Calculate recommended exercises based on calories consumed and user situation
export function getRecommendedExercises(
  consumedCalories: number,
  targetCalories: number,
  bio: Biometrics,
  maxExercises: number = 6
): Array<{ exercise: Exercise; caloriesToBurn: number; duration: ReturnType<Exercise['getDuration']> }> {
  const caloriePercentage = (consumedCalories / targetCalories) * 100
  const remainingCalories = targetCalories - consumedCalories
  const excessCalories = Math.max(0, consumedCalories - targetCalories)
  
  // Determine how many calories need to be burned
  let caloriesToBurn = 0
  let priorityExercises: ExerciseType[] = []
  
  if (excessCalories > 0) {
    // User has exceeded limit - recommend high-intensity exercises
    caloriesToBurn = excessCalories * 1.2 // Burn 20% more than excess
    priorityExercises = ['running', 'burpees', 'jumping_jacks', 'stair_climbing', 'high_knees', 'mountain_climbers']
  } else if (caloriePercentage >= 80) {
    // Near limit - recommend moderate to high intensity
    caloriesToBurn = Math.abs(remainingCalories) + 100 // Burn remaining + buffer
    priorityExercises = ['jogging', 'cycling', 'running', 'jumping_jacks', 'pushups', 'squats']
  } else if (caloriePercentage >= 60) {
    // Getting close - recommend moderate exercises
    caloriesToBurn = Math.abs(remainingCalories) * 0.5 // Burn half of remaining
    priorityExercises = ['walking', 'cycling', 'jogging', 'dancing', 'yoga', 'pushups']
  } else {
    // On track - recommend light to moderate exercises for maintenance
    caloriesToBurn = 50 + (targetCalories - consumedCalories) * 0.1 // Light activity
    priorityExercises = ['walking', 'yoga', 'cycling', 'dancing', 'stair_climbing', 'swimming']
  }
  
  // Filter exercises based on user's activity level and age
  let availableExercises = exercises.filter(ex => {
    // Adjust based on age - older users get lower intensity options
    if (bio.age > 60) {
      return ex.intensity !== 'high' && ex.id !== 'burpees' && ex.id !== 'jumping_jacks'
    }
    if (bio.age > 50) {
      return ex.intensity !== 'high' || ex.id === 'running' // Allow running but not burpees
    }
    return true
  })
  
  // Sort: prioritize exercises from priority list, then by intensity
  availableExercises.sort((a, b) => {
    const aPriority = priorityExercises.indexOf(a.id)
    const bPriority = priorityExercises.indexOf(b.id)
    
    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority
    if (aPriority !== -1) return -1
    if (bPriority !== -1) return 1
    
    // If excess calories, prefer high intensity
    if (excessCalories > 0) {
      const intensityOrder = { high: 0, moderate: 1, low: 2 }
      return intensityOrder[a.intensity] - intensityOrder[b.intensity]
    }
    
    return 0
  })
  
  // Select top exercises and calculate their durations
  const selected = availableExercises.slice(0, maxExercises).map(exercise => {
    const duration = exercise.getDuration(caloriesToBurn, bio)
    return {
      exercise,
      caloriesToBurn: Math.round(caloriesToBurn),
      duration
    }
  })
  
  return selected
}
