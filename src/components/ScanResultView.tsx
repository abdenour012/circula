import { useEffect, useState } from 'react'
import { CheckCircle2, Info, XCircle, AlertTriangle } from 'lucide-react'
import type { MacroBreakdown, Micronutrients, Targets, PortionBreakdown } from '../types'
import { cn } from '../lib/cn'
import { Button } from './Button'
import { Modal } from './Modal'

type Annotation = {
  x: number
  y: number
  label: string
  value: string
  delay: number
}

export function ScanResultView({
  imageUrl,
  mealName,
  macros,
  micros,
  targets,
  goal,
  dietaryStyle,
  mealKind,
  consumed,
  onClose,
  onConfirm,
  isMock,
  portionBreakdown,
}: {
  imageUrl: string
  mealName: string
  macros: MacroBreakdown
  micros?: Micronutrients
  targets: Targets
  goal: 'lose' | 'maintain' | 'gain'
  dietaryStyle?: 'balanced' | 'keto' | 'vegan'
  mealKind?: 'meal' | 'snack' | 'barcode'
  consumed?: MacroBreakdown
  onClose: () => void
  onConfirm: (confirmed: boolean) => void
  isMock?: boolean
  portionBreakdown?: PortionBreakdown[]
}) {
  const [annotationsVisible, setAnnotationsVisible] = useState(false)
  const [thumbsVisible, setThumbsVisible] = useState(false)
  const [explanationOpen, setExplanationOpen] = useState(false)

  useEffect(() => {
    // Show annotations after image loads
    const t1 = window.setTimeout(() => setAnnotationsVisible(true), 300)
    // Show thumbs up/down after annotations
    const t2 = window.setTimeout(() => setThumbsVisible(true), 1500)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  // Calculate if meal is good fit using nuanced scoring system
  const { isGoodFit, score, reasons, rating } = (() => {
    const carbsRatio = macros.carbsG / targets.carbsG
    const fatRatio = macros.fatG / targets.fatG
    
    const isSnack = mealKind === 'snack'
    const remainingCalories = consumed ? Math.max(0, targets.calories - consumed.calories) : targets.calories
    
    // Calculate score (0-100)
    let score = 50 // Start neutral
    const warnings: string[] = []
    const positives: string[] = []

    // CALORIE SCORING (more nuanced)
    if (isSnack) {
      // Snacks: 100-300 calories is ideal
      if (macros.calories >= 100 && macros.calories <= 300) {
        score += 15
        positives.push(`Good snack size (${Math.round(macros.calories)} kcal)`)
      } else if (macros.calories < 100) {
        score += 5
        warnings.push(`Very light snack (${Math.round(macros.calories)} kcal)`)
      } else if (macros.calories > 400) {
        score -= 10
        warnings.push(`Large snack (${Math.round(macros.calories)} kcal) - consider if this is a meal`)
      }
    } else {
      // Meals: 300-800 calories is typical and acceptable
      if (macros.calories >= 300 && macros.calories <= 800) {
        score += 20
        positives.push(`Reasonable meal size (${Math.round(macros.calories)} kcal)`)
      } else if (macros.calories >= 200 && macros.calories < 300) {
        score += 10
        positives.push(`Light meal (${Math.round(macros.calories)} kcal) - good for smaller appetites`)
      } else if (macros.calories > 800 && macros.calories <= 1200) {
        score += 5
        warnings.push(`Large meal (${Math.round(macros.calories)} kcal) - ensure you have room in your daily budget`)
      } else if (macros.calories > 1200) {
        score -= 15
        warnings.push(`Very large meal (${Math.round(macros.calories)} kcal) - may exceed daily needs`)
      } else {
        score -= 5
        warnings.push(`Very light meal (${Math.round(macros.calories)} kcal) - may not be sufficient`)
      }
    }

    // Check if meal fits remaining daily budget
    if (consumed) {
      const caloriePercentage = (consumed.calories / targets.calories) * 100
      const isNearLimit = caloriePercentage >= 80 // 80% threshold
      
      // When near limit, be much stricter
      if (isNearLimit) {
        // If this meal would exceed remaining calories, mark it as bad
        if (macros.calories > remainingCalories) {
          score -= 30 // Heavy penalty
          warnings.push(`⚠️ WARNING: This meal (${Math.round(macros.calories)} kcal) exceeds your remaining budget (${Math.round(remainingCalories)} kcal). You're at ${Math.round(caloriePercentage)}% of your daily limit.`)
        } else if (macros.calories > remainingCalories * 0.8) {
          // If it uses more than 80% of remaining, warn
          score -= 15
          warnings.push(`⚠️ CAUTION: This meal uses most of your remaining calories (${Math.round(remainingCalories)} kcal left). Consider a lighter option.`)
        } else if (macros.calories <= remainingCalories * 0.5) {
          // Light meals get bonus when near limit
          score += 15
          positives.push(`✓ Good choice! Light meal (${Math.round(macros.calories)} kcal) fits well within your remaining budget (${Math.round(remainingCalories)} kcal left)`)
        } else {
          score += 5
          positives.push(`Fits within your remaining budget (${Math.round(remainingCalories)} kcal left)`)
        }
      } else {
        // Normal scoring when not near limit
        const fitsBudget = macros.calories <= remainingCalories * 1.1 // Allow 10% over
        if (fitsBudget) {
          score += 10
          positives.push(`Fits well within your remaining daily budget (${Math.round(remainingCalories)} kcal left)`)
        } else {
          score -= 20
          warnings.push(`Exceeds remaining daily budget (${Math.round(remainingCalories)} kcal left)`)
        }
      }
    }

    // PROTEIN SCORING (goal-dependent)
    if (goal === 'lose') {
      // For weight loss: 20-40g protein per meal is good
      if (macros.proteinG >= 20 && macros.proteinG <= 50) {
        score += 15
        positives.push(`Good protein for weight loss (${Math.round(macros.proteinG)}g) - helps preserve muscle`)
      } else if (macros.proteinG < 15) {
        score -= 10
        warnings.push(`Low protein (${Math.round(macros.proteinG)}g) - aim for 20g+ to support muscle retention`)
      } else if (macros.proteinG > 60) {
        score += 5 // Very high protein is fine
        positives.push(`Excellent protein content (${Math.round(macros.proteinG)}g)`)
      }
    } else if (goal === 'gain') {
      // For weight gain: 25-50g protein per meal is ideal
      if (macros.proteinG >= 25 && macros.proteinG <= 60) {
        score += 15
        positives.push(`Good protein for muscle gain (${Math.round(macros.proteinG)}g)`)
      } else if (macros.proteinG < 20) {
        score -= 10
        warnings.push(`Low protein (${Math.round(macros.proteinG)}g) - aim for 25g+ for muscle building`)
      } else if (macros.proteinG > 60) {
        score += 10
        positives.push(`Excellent protein (${Math.round(macros.proteinG)}g) - great for recovery`)
      }
    } else {
      // Maintenance: 20-40g protein per meal
      if (macros.proteinG >= 20 && macros.proteinG <= 50) {
        score += 15
        positives.push(`Good protein content (${Math.round(macros.proteinG)}g)`)
      } else if (macros.proteinG < 15) {
        score -= 5
        warnings.push(`Moderate protein (${Math.round(macros.proteinG)}g) - consider adding protein sources`)
      } else if (macros.proteinG > 50) {
        score += 5
        positives.push(`High protein (${Math.round(macros.proteinG)}g) - excellent for satiety`)
      }
    }

    // DIETARY STYLE SCORING
    if (dietaryStyle === 'keto') {
      const carbsPct = (macros.carbsG * 4) / macros.calories * 100
      if (carbsPct <= 10) {
        score += 15
        positives.push(`Keto-friendly: low carbs (${Math.round(macros.carbsG)}g, ${Math.round(carbsPct)}% of calories)`)
      } else if (carbsPct <= 15) {
        score += 5
        warnings.push(`Moderate carbs for keto (${Math.round(macros.carbsG)}g) - watch your daily total`)
      } else {
        score -= 15
        warnings.push(`High carbs (${Math.round(macros.carbsG)}g) - not ideal for keto diet`)
      }
      
      if (fatRatio >= 0.5) {
        score += 10
        positives.push(`Good fat content for keto (${Math.round(macros.fatG)}g)`)
      }
    } else if (dietaryStyle === 'vegan') {
      // Vegan: higher carbs, moderate protein from plants
      if (carbsRatio >= 0.4) {
        score += 10
        positives.push(`Good carb content for vegan diet (${Math.round(macros.carbsG)}g)`)
      }
      if (macros.proteinG >= 15) {
        score += 10
        positives.push(`Good plant protein (${Math.round(macros.proteinG)}g)`)
      }
    }

    // MACRO BALANCE SCORING
    const totalMacroCalories = macros.proteinG * 4 + macros.carbsG * 4 + macros.fatG * 9
    const macroBalance = Math.abs(totalMacroCalories - macros.calories) / macros.calories
    if (macroBalance < 0.05) {
      score += 5
      positives.push(`Well-balanced macros`)
    }

    // MICRONUTRIENT SCORING
    if (micros) {
      // Sugar: context-dependent
      const sugarPct = (micros.sugarG * 4) / macros.calories * 100
      if (sugarPct > 25 && macros.calories > 300) {
        score -= 10
        warnings.push(`High sugar (${Math.round(micros.sugarG)}g, ${Math.round(sugarPct)}%) - may cause energy spikes`)
      } else if (sugarPct <= 10) {
        score += 5
        positives.push(`Low sugar content (${Math.round(micros.sugarG)}g)`)
      }

      // Sodium: context-dependent
      if (micros.sodiumMg > 1500) {
        score -= 10
        warnings.push(`Very high sodium (${Math.round(micros.sodiumMg)}mg) - watch daily intake`)
      } else if (micros.sodiumMg > 1000) {
        score -= 5
        warnings.push(`Moderate-high sodium (${Math.round(micros.sodiumMg)}mg)`)
      } else if (micros.sodiumMg < 300) {
        score += 5
        positives.push(`Low sodium (${Math.round(micros.sodiumMg)}mg)`)
      }

      // Saturated fat
      const satFatPct = (micros.saturatedFatG * 9) / macros.calories * 100
      if (satFatPct > 20) {
        score -= 10
        warnings.push(`High saturated fat (${Math.round(micros.saturatedFatG)}g, ${Math.round(satFatPct)}%)`)
      } else if (satFatPct < 10) {
        score += 5
        positives.push(`Low saturated fat (${Math.round(micros.saturatedFatG)}g)`)
      }

      // Fiber
      if (micros.fiberG >= 5) {
        score += 10
        positives.push(`Good fiber content (${Math.round(micros.fiberG)}g) - supports digestion`)
      } else if (micros.fiberG < 2) {
        score -= 5
        warnings.push(`Low fiber (${Math.round(micros.fiberG)}g) - consider adding vegetables or whole grains`)
      }

      // Iron
      if (micros.ironMg >= 3) {
        score += 5
        positives.push(`Good iron content (${Math.round(micros.ironMg)}mg)`)
      }
    }

    // Clamp score between 0-100
    score = Math.max(0, Math.min(100, score))

    // Determine rating
    let rating: 'excellent' | 'good' | 'acceptable' | 'poor'
    let isGood: boolean
    
    if (score >= 75) {
      rating = 'excellent'
      isGood = true
    } else if (score >= 60) {
      rating = 'good'
      isGood = true
    } else if (score >= 45) {
      rating = 'acceptable'
      isGood = true // Acceptable is still "good enough"
    } else {
      rating = 'poor'
      isGood = false
    }

    // Combine all reasons
    const allReasons = [
      ...positives,
      ...warnings,
    ]

    // Add summary based on rating
    if (rating === 'excellent') {
      allReasons.unshift(`Excellent choice! This meal aligns well with your goals and dietary preferences.`)
    } else if (rating === 'good') {
      allReasons.unshift(`Good meal choice! This fits well with your nutrition plan.`)
    } else if (rating === 'acceptable') {
      allReasons.unshift(`Acceptable meal. While not perfect, it can fit into your daily plan.`)
    } else {
      allReasons.unshift(`This meal may not be ideal for your goals. Consider the suggestions below.`)
    }

    return { isGoodFit: isGood, score, reasons: allReasons, rating }
  })()

  // Generate annotation positions (circles on image)
  // Positioned lower to avoid overlap with meal name overlay at top (which takes ~15% from top)
  const annotations: Annotation[] = [
    { x: 20, y: 40, label: 'Calories', value: `${Math.round(macros.calories)} kcal`, delay: 0 },
    { x: 80, y: 40, label: 'Protein', value: `${Math.round(macros.proteinG)}g`, delay: 200 },
    { x: 15, y: 70, label: 'Carbs', value: `${Math.round(macros.carbsG)}g`, delay: 400 },
    { x: 85, y: 70, label: 'Fat', value: `${Math.round(macros.fatG)}g`, delay: 600 },
  ]

  if (micros) {
    annotations.push(
      { x: 50, y: 50, label: 'Sugar', value: `${Math.round(micros.sugarG)}g`, delay: 800 },
      { x: 50, y: 85, label: 'Sodium', value: `${Math.round(micros.sodiumMg)}mg`, delay: 1000 },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md anim-fade-up">
        <div className="relative rounded-3xl overflow-hidden bg-white shadow-elevated">
          {/* Image container */}
          <div className="relative aspect-[4/3] bg-black/5">
            <img src={imageUrl} alt="Scanned meal" className="w-full h-full object-cover" />

            {/* Meal name overlay - positioned at top, compact to avoid overlap */}
            <div className="absolute top-3 left-3 right-3 anim-fade-up z-30">
              <div className="rounded-xl bg-black/85 backdrop-blur-md border border-white/30 px-3 py-2 shadow-elevated">
                <div className="text-white font-bold text-sm leading-tight line-clamp-2">{mealName}</div>
                {isMock && (
                  <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-white/20">
                    <AlertTriangle className="h-3 w-3 text-yellow-400" />
                    <div className="text-[10px] text-yellow-200/90">Mock data - may not match image</div>
                  </div>
                )}
              </div>
            </div>

            {/* Annotations overlay */}
            {annotationsVisible && (
              <div className="absolute inset-0">
                {annotations.map((ann, idx) => {
                  // Calculate line direction from center
                  const centerX = 50
                  const centerY = 50
                  const dx = ann.x - centerX
                  const dy = ann.y - centerY
                  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
                  const distance = Math.sqrt(dx * dx + dy * dy)

                  return (
                    <div
                      key={idx}
                      className="absolute"
                      style={{
                        left: `${ann.x}%`,
                        top: `${ann.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {/* Connecting line from center */}
                      <div
                        className="absolute pointer-events-none anim-fade-in"
                        style={{
                          left: '50%',
                          top: '50%',
                          width: `${distance * 2}%`,
                          height: '2px',
                          background: `linear-gradient(to ${ann.x > 50 ? 'right' : 'left'}, #DC2626/60, transparent)`,
                          transformOrigin: 'left center',
                          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                          animationDelay: `${ann.delay}ms`,
                        }}
                      >
                        <div className="w-full h-full border-t-2 border-dashed border-[#DC2626]/40" />
                      </div>

                      {/* Circle annotation */}
                      <div
                        className="relative anim-fade-up anim-pop"
                        style={{ animationDelay: `${ann.delay + 200}ms` }}
                      >
                        <div className="absolute inset-0 rounded-full bg-[#DC2626]/20 blur-xl anim-pulse-glow" />
                        <div className="relative rounded-full bg-white/95 backdrop-blur-sm border-2 border-[#DC2626] p-2.5 shadow-elevated min-w-[70px]">
                          <div className="text-center">
                            <div className="text-[10px] font-medium text-black/60 leading-tight">{ann.label}</div>
                            <div className="text-xs font-bold text-[#DC2626] mt-0.5">{ann.value}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Rating indicator */}
            {thumbsVisible && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 anim-fade-up anim-pop z-20">
                <div
                  className={cn(
                    'rounded-2xl px-5 py-3.5 backdrop-blur-md border-2 shadow-elevated',
                    rating === 'excellent' ? 'bg-green-500/95 border-green-400 text-white' :
                    rating === 'good' ? 'bg-blue-500/95 border-blue-400 text-white' :
                    rating === 'acceptable' ? 'bg-yellow-500/95 border-yellow-400 text-white' :
                    'bg-orange-500/95 border-orange-400 text-white',
                  )}
                >
                  <div className="flex items-center gap-3">
                    {rating === 'excellent' || rating === 'good' || rating === 'acceptable' ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-bold leading-tight">
                            {rating === 'excellent' ? 'Excellent!' : rating === 'good' ? 'Good fit!' : 'Acceptable'}
                          </div>
                          <div className="text-xs opacity-90 leading-tight">
                            {rating === 'excellent' ? 'Perfect for your goals' : rating === 'good' ? 'Aligns with your plan' : 'Can fit your day'}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-6 w-6 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-bold leading-tight">Needs attention</div>
                          <div className="text-xs opacity-90 leading-tight">See suggestions below</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary below image */}
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-bold text-black">{Math.round(macros.calories)} kcal</div>
                <div className="text-xs text-black/60 mt-1">Total calories</div>
              </div>
              <div className="text-right">
                <div className="text-base font-semibold text-black">
                  P {Math.round(macros.proteinG)}g • C {Math.round(macros.carbsG)}g • F {Math.round(macros.fatG)}g
                </div>
                <div className="text-xs text-black/60 mt-1">Macros breakdown</div>
              </div>
            </div>

            {micros && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/10">
                <div className="text-xs">
                  <span className="text-black/60">Sugar:</span> <span className="font-semibold">{Math.round(micros.sugarG)}g</span>
                </div>
                <div className="text-xs">
                  <span className="text-black/60">Sodium:</span> <span className="font-semibold">{Math.round(micros.sodiumMg)}mg</span>
                </div>
                <div className="text-xs">
                  <span className="text-black/60">Fiber:</span> <span className="font-semibold">{Math.round(micros.fiberG)}g</span>
                </div>
                <div className="text-xs">
                  <span className="text-black/60">Sat Fat:</span> <span className="font-semibold">{Math.round(micros.saturatedFatG)}g</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant={isGoodFit ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => onConfirm(true)}
              >
                {rating === 'excellent' ? 'Eat it!' : rating === 'good' ? 'Add to log' : rating === 'acceptable' ? 'Add anyway' : 'Add anyway'}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setExplanationOpen(true)}
              >
                <Info className="h-4 w-4" />
                Learn more
              </Button>
            </div>
            
            {/* Cancel button */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => onConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Explanation modal with detailed breakdown */}
      <Modal
        title="Meal Details & Analysis"
        open={explanationOpen}
        onClose={() => setExplanationOpen(false)}
      >
        <div className="space-y-4">
          {/* Goal Analysis */}
          <div
            className={cn(
              'rounded-2xl p-4 border-2',
              rating === 'excellent' ? 'bg-green-50 border-green-200 text-green-900' :
              rating === 'good' ? 'bg-blue-50 border-blue-200 text-blue-900' :
              rating === 'acceptable' ? 'bg-yellow-50 border-yellow-200 text-yellow-900' :
              'bg-orange-50 border-orange-200 text-orange-900',
            )}
          >
            <div className="flex items-start gap-3">
              {rating === 'excellent' || rating === 'good' || rating === 'acceptable' ? (
                <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-semibold mb-2">
                  {rating === 'excellent' ? 'Excellent choice!' : 
                   rating === 'good' ? 'Good meal choice!' :
                   rating === 'acceptable' ? 'Acceptable meal' :
                   'Meal analysis'}
                </div>
                <div className="mb-3 text-xs opacity-70">
                  Score: {score}/100 • {rating.charAt(0).toUpperCase() + rating.slice(1)}
                </div>
                <ul className="space-y-2 text-sm">
                  {reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={cn(
                        "mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0",
                        reason.startsWith('Good') || reason.startsWith('Excellent') || reason.startsWith('Reasonable') || reason.startsWith('Fits') || reason.startsWith('Low') && reason.includes('sodium') || reason.includes('fiber') || reason.includes('iron') || reason.includes('protein')
                          ? "bg-green-500"
                          : "bg-current"
                      )} />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Detailed Portion Breakdown */}
          {portionBreakdown && portionBreakdown.length > 0 && (
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="text-sm font-semibold text-black mb-3">Detailed Portion Breakdown</div>
              <div className="space-y-2">
                {portionBreakdown.map((portion, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 p-2 rounded-lg bg-black/5">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-black">{portion.ingredient}</div>
                      <div className="text-xs text-black/60 mt-0.5">{portion.amount}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-black">{Math.round(portion.calories)} kcal</div>
                      <div className="text-[10px] text-black/60 mt-0.5">
                        P {Math.round(portion.proteinG)}g • C {Math.round(portion.carbsG)}g • F {Math.round(portion.fatG)}g
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-black/10 flex items-center justify-between text-xs">
                <span className="font-semibold text-black">Total:</span>
                <span className="text-black">
                  {Math.round(portionBreakdown.reduce((sum, p) => sum + p.calories, 0))} kcal • P{' '}
                  {Math.round(portionBreakdown.reduce((sum, p) => sum + p.proteinG, 0))}g • C{' '}
                  {Math.round(portionBreakdown.reduce((sum, p) => sum + p.carbsG, 0))}g • F{' '}
                  {Math.round(portionBreakdown.reduce((sum, p) => sum + p.fatG, 0))}g
                </span>
              </div>
            </div>
          )}

          {/* Goal Summary */}
          <div className="rounded-2xl border border-black/10 bg-black/5 p-3">
            <div className="text-xs font-semibold text-black/70 mb-2">Your goal: {goal === 'lose' ? 'Lose weight' : goal === 'gain' ? 'Gain weight' : 'Maintain weight'}</div>
            <div className="text-xs text-black/60">
              Daily targets: {targets.calories} kcal • P {targets.proteinG}g • C {targets.carbsG}g • F {targets.fatG}g
            </div>
          </div>

          <Button variant="primary" className="w-full" onClick={() => setExplanationOpen(false)}>
            Got it
          </Button>
        </div>
      </Modal>
    </div>
  )
}
