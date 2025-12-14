import { useState } from 'react'
import { X, ChefHat, Loader2, Camera } from 'lucide-react'
import type { RecipeCard, UserTier } from '../types'
import { Button } from './Button'
import { Card } from './Card'
import { LockedOverlay } from './LockedOverlay'
import { processImageFile } from '../lib/api'
import { fridgeChefWithAi } from '../lib/api'

export function FridgeChefView({
  tier,
  targets,
  consumed,
  onClose,
  onRecipeGenerated,
}: {
  tier: UserTier
  targets: { calories: number; proteinG: number; carbsG: number; fatG: number }
  consumed: { calories: number; proteinG: number; carbsG: number; fatG: number }
  onClose: () => void
  onRecipeGenerated?: (recipe: RecipeCard) => void
}) {
  const [loading, setLoading] = useState(false)
  const [recipe, setRecipe] = useState<RecipeCard | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const imageBase64 = await processImageFile(file)
      const result = await fridgeChefWithAi({
        tier,
        imageBase64,
        targets,
        consumed,
      })
      setRecipe(result)
      onRecipeGenerated?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recipe')
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md anim-fade-up max-h-[90vh] overflow-y-auto">
        <Card className="relative">
          <div className="p-4 border-b border-black/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-[#DC2626]" />
              <div>
                <div className="text-lg font-bold">Fridge Chef</div>
                <div className="text-xs text-black/60">Scan your fridge for recipe suggestions</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 space-y-4">
          {tier !== 'premium' && (
            <div className="relative">
              <LockedOverlay>
                <div className="rounded-xl border-2 border-dashed border-black/20 bg-black/5 p-8 text-center">
                  <ChefHat className="h-12 w-12 text-black/20 mx-auto mb-3" />
                  <div className="text-sm font-semibold mb-1">Fridge Chef (PRO)</div>
                  <div className="text-xs text-black/60">
                    Scan your fridge and get AI-generated recipes that fit your remaining macros
                  </div>
                </div>
              </LockedOverlay>
            </div>
          )}

            {tier === 'premium' && !recipe && !loading && (
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-dashed border-black/20 bg-black/5 p-8 text-center">
                  <ChefHat className="h-12 w-12 text-black/20 mx-auto mb-3" />
                  <div className="text-sm font-semibold mb-1">Scan Your Fridge</div>
                  <div className="text-xs text-black/60 mb-4">
                    Take a photo of your fridge contents and get personalized recipe suggestions
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.capture = 'environment'
                      input.onchange = (e) => {
                        handleFileSelect(e as any)
                      }
                      input.click()
                    }}
                  >
                    <Camera className="h-4 w-4" /> Scan Fridge
                  </Button>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#DC2626] mb-4" />
                <div className="text-sm font-semibold">Analyzing your fridge...</div>
                <div className="text-xs text-black/60 mt-1">AI is identifying ingredients and creating a recipe</div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-4">
                <div className="text-sm font-semibold text-red-800 mb-1">Error</div>
                <div className="text-xs text-red-700">{error}</div>
              </div>
            )}

            {recipe && (
              <div className="space-y-4 anim-fade-in">
                <div className="rounded-xl border border-black/10 bg-gradient-to-br from-[#DC2626]/5 to-white p-4">
                  <div className="text-lg font-bold mb-2">{recipe.title}</div>
                  <div className="text-xs text-black/60 mb-3">
                    Estimated: {Math.round(recipe.estimatedMacros.calories)} kcal • P{' '}
                    {Math.round(recipe.estimatedMacros.proteinG)}g • C {Math.round(recipe.estimatedMacros.carbsG)}g
                    • F {Math.round(recipe.estimatedMacros.fatG)}g
                  </div>
                </div>

                <div className="rounded-xl border border-black/10 bg-white p-4">
                  <div className="text-sm font-semibold mb-3">Ingredients</div>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <span className="text-[#DC2626] mt-1">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-black/10 bg-white p-4">
                  <div className="text-sm font-semibold mb-3">Steps</div>
                  <ol className="space-y-3">
                    {recipe.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DC2626]/10 text-[#DC2626] font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="flex-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <Button variant="secondary" className="w-full" onClick={() => setRecipe(null)}>
                  Generate Another Recipe
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
