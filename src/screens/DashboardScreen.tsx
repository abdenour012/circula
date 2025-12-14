import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Crown, Loader2, Settings, Trash2, AlertTriangle, ScanLine, Cookie, ChefHat, Undo2, Download, X } from 'lucide-react'
import type { Biometrics, FavoriteMeal, Goal, HistoryEntry, ScanKind, ScanResult, UserTier, WeightEntry } from '../types'
import { cn } from '../lib/cn'
import { exportState, importState } from '../lib/storage'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CalorieRing } from '../components/CalorieRing'
import { MacroRow } from '../components/MacroRow'
import { MicronutrientGrid } from '../components/MicronutrientGrid'
import { PlanCard } from '../components/PlanCard'
import { HydrationCard } from '../components/HydrationCard'
import { FastingCard } from '../components/FastingCard'
import { ScanLogEnhanced } from '../components/ScanLogEnhanced'
import { NutritionTrends } from '../components/NutritionTrends'
import { Modal } from '../components/Modal'
import { Toast } from '../components/Toast'
import { ScanResultView } from '../components/ScanResultView'
import { TodaysExercises } from '../components/TodaysExercises'
import { BarcodeScanner } from '../components/BarcodeScanner'
import { FridgeChefView } from '../components/FridgeChefView'
import { LockedOverlay } from '../components/LockedOverlay'

export function DashboardScreen({
  tier,
  now,
  targets,
  consumed,
  scans,
  plan,
  hydrationCups,
  lastMealAt,
  fasting,
  proReaction,
  goal,
  biometrics,
  history,
  onScan,
  onHydration,
  onToggleFasting,
  onResetFasting,
  onToggleTier,
  onResetAll,
  onConfirmMeal,
  favorites,
  weightHistory,
  canUndo,
  onUndo,
  onAddToFavorites,
  onRemoveFromFavorites,
  onAddWeight,
}: {
  tier: UserTier
  now: number
  targets: { calories: number; proteinG: number; carbsG: number; fatG: number }
  consumed: { calories: number; proteinG: number; carbsG: number; fatG: number }
  scans: ScanResult[]
  plan: { dinner: string; workout: string; workoutNote?: string }
  hydrationCups: number
  lastMealAt?: number
  fasting: { isActive: boolean; startedAt?: number; goalHours: number }
  proReaction?: { at: number; title: string; message: string }
  goal: Goal
  biometrics?: Biometrics
  history: HistoryEntry[]
  onScan: (kind: ScanKind, file?: File) => Promise<ScanResult>
  onConfirmMeal: (scanResult: ScanResult) => void
  onHydration: (next: number) => void
  onToggleFasting: () => void
  onResetFasting: () => void
  onToggleTier: () => void
  onResetAll: () => void
  favorites?: FavoriteMeal[]
  weightHistory?: WeightEntry[]
  canUndo?: boolean
  onUndo?: () => void
  onAddToFavorites?: (scanResult: ScanResult) => void
  onRemoveFromFavorites?: (favoriteId: string) => void
  onAddWeight?: (weightKg: number) => void
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [busyLabel, setBusyLabel] = useState<string>('Working…')
  const [busyProgress, setBusyProgress] = useState(0)
  const [error, setError] = useState<string | undefined>()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'loading' } | null>(null)
  const [pendingKind, setPendingKind] = useState<ScanKind>('meal')
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showFridgeChef, setShowFridgeChef] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const progressIntervalRef = useRef<number | undefined>(undefined)

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = undefined
      }
    }
  }, [])

  const latestMicros = useMemo(() => {
    for (const s of scans) {
      if (s.micros) return s.micros
    }
    return undefined
  }, [scans])

  const lastScan = scans[0]

  // Calculate calorie warning threshold (80% of daily target)
  const calorieWarningThreshold = useMemo(() => targets.calories * 0.8, [targets.calories])
  const isNearCalorieLimit = consumed.calories >= calorieWarningThreshold
  const caloriePercentage = (consumed.calories / targets.calories) * 100
  const remainingCalories = Math.max(0, targets.calories - consumed.calories)

  async function runScan(kind: ScanKind) {
    setError(undefined)
    if (kind === 'meal') {
      setBusyLabel('Opening camera…')
      setBusyProgress(0)
      setPendingKind(kind)
      fileInputRef.current?.click()
      return
    }
    
    // Clean up any existing interval
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = undefined
    }
    
    setBusy(true)
    setBusyProgress(0)
    setBusyLabel(kind === 'snack' ? 'Analyzing snack with AI…' : 'Analyzing meal with AI…')
    
    // Simulate progress
    progressIntervalRef.current = window.setInterval(() => {
      setBusyProgress((p) => Math.min(95, p + 10))
    }, 150)

    try {
      const result = await onScan(kind)
      setBusyProgress(100)
      // Show result view if image exists
      if (result.imageUrl) {
        setScanResult(result)
      } else {
        setToast({ message: `✓ ${kind === 'snack' ? 'Snack' : 'Meal'} analyzed successfully`, type: 'success' })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed')
      setToast({ message: `✗ Failed to analyze ${kind}`, type: 'error' })
    } finally {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = undefined
      }
      setBusy(false)
      setBusyProgress(0)
    }
  }


  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      {busy && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="mx-auto mt-6 w-full max-w-md px-4">
            <div className="anim-fade-up rounded-2xl border border-black/10 bg-white/95 backdrop-blur-md p-4 shadow-elevated">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Loader2 className="h-5 w-5 animate-spin text-[#DC2626]" />
                  <div className="absolute inset-0 anim-pulse-glow" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-black">{busyLabel}</div>
                  <div className="mt-1 text-xs text-black/60">AI is analyzing your image…</div>
                </div>
              </div>
              {busyProgress > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-black/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#DC2626] to-[#b91c1c] rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${busyProgress}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-black/50 text-right">{Math.round(busyProgress)}%</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {scanResult && scanResult.imageUrl && (
        <ScanResultView
          imageUrl={scanResult.imageUrl}
          mealName={scanResult.name}
          macros={scanResult.macros}
          micros={scanResult.micros}
          targets={targets}
          goal={goal}
          dietaryStyle={biometrics?.dietaryStyle}
          mealKind={scanResult.kind}
          consumed={consumed}
          onClose={() => setScanResult(null)}
          onConfirm={(confirmed) => {
            if (confirmed) {
              onConfirmMeal(scanResult)
              if (onAddToFavorites) {
                // Show option to add to favorites
                setTimeout(() => {
                  if (window.confirm('Add this meal to favorites?')) {
                    onAddToFavorites(scanResult)
                    setToast({ message: '✓ Added to favorites', type: 'success' })
                  }
                }, 500)
              }
            }
            setScanResult(null)
          }}
          isMock={scanResult.isMock}
          portionBreakdown={scanResult.portionBreakdown}
        />
      )}

      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={async () => {
            setShowBarcodeScanner(false)
            setBusy(true)
            setBusyLabel('Analyzing barcode…')
            try {
              // For barcode scanning, we can pass the barcode as a hint
              // The API will handle barcode lookup
              const result = await onScan('barcode')
              setBusy(false)
              if (result.imageUrl) {
                setScanResult(result)
              } else {
                setToast({ message: '✓ Barcode scanned successfully', type: 'success' })
                onConfirmMeal(result)
              }
            } catch (err) {
              setBusy(false)
              setToast({ message: '✗ Failed to scan barcode', type: 'error' })
            }
          }}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {showFridgeChef && (
        <FridgeChefView
          tier={tier}
          targets={targets}
          consumed={consumed}
          onClose={() => setShowFridgeChef(false)}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.currentTarget.value = ''
          
          // Clean up any existing interval
          if (progressIntervalRef.current) {
            window.clearInterval(progressIntervalRef.current)
            progressIntervalRef.current = undefined
          }
          
          setBusy(true)
          setBusyProgress(0)
          setBusyLabel(file ? 'Processing image…' : 'Analyzing meal…')
          
          progressIntervalRef.current = window.setInterval(() => {
            setBusyProgress((p) => Math.min(95, p + 8))
          }, 120)

          try {
            const result = await onScan(pendingKind, file)
            setBusyProgress(100)
            // Always show result view when image is provided
            if (result.imageUrl) {
              setScanResult(result)
            } else {
              setToast({ message: `✓ ${pendingKind === 'meal' ? 'Meal' : 'Snack'} analyzed successfully`, type: 'success' })
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Scan failed')
            setToast({ message: '✗ Failed to analyze image', type: 'error' })
          } finally {
            if (progressIntervalRef.current) {
              window.clearInterval(progressIntervalRef.current)
              progressIntervalRef.current = undefined
            }
            setBusy(false)
            setBusyProgress(0)
          }
        }}
      />

      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold tracking-wider text-[#DC2626] uppercase">CIRCULA</div>
          <div className="mt-1.5 text-2xl font-bold tracking-tight">Dashboard</div>
          <div className="mt-1.5 text-xs text-black/60 font-medium">Snap & forget. Rings update instantly.</div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "rounded-full border px-3 py-1.5 text-[11px] font-bold shadow-modern",
            tier === 'premium' 
              ? "bg-gradient-to-br from-black to-zinc-800 border-black/20 text-white shadow-glow-black"
              : "bg-white border-black/10 text-black"
          )}>
            {tier === 'premium' ? (
              <span className="inline-flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5" /> PRO
              </span>
            ) : (
              'CORE'
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)} aria-label="Open settings" className="hover:bg-black/5">
            <Settings className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {error && (
          <div className="anim-fade-in rounded-2xl border border-black/10 bg-gradient-to-br from-black/5 to-black/3 backdrop-blur-sm p-3 text-xs text-black/70 shadow-modern">
            <span className="text-[#DC2626] font-medium">⚠ {error}</span>
          </div>
        )}

        {isNearCalorieLimit && (
          <div className="anim-fade-in rounded-2xl border-2 border-[#DC2626]/40 bg-gradient-to-br from-[#DC2626]/10 to-[#DC2626]/5 backdrop-blur-sm p-4 shadow-modern">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-bold text-[#DC2626] mb-1">
                  Approaching Daily Calorie Limit
                </div>
                <div className="text-xs text-black/80 leading-relaxed">
                  You've consumed {Math.round(caloriePercentage)}% of your daily calories ({Math.round(consumed.calories)}/{Math.round(targets.calories)} kcal).
                  {remainingCalories > 0 ? (
                    <> Only <span className="font-semibold">{Math.round(remainingCalories)} kcal</span> remaining. Choose lighter options to stay within your goal.</>
                  ) : (
                    <> You've exceeded your daily target. Consider lighter meals for the rest of the day.</>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <Card className="anim-fade-up anim-stagger-1">
          <CalorieRing consumed={consumed.calories} target={targets.calories} />
          <div className="mt-4">
            <MacroRow
              protein={consumed.proteinG}
              carbs={consumed.carbsG}
              fat={consumed.fatG}
              targets={targets}
            />
          </div>
        </Card>

        <Card className="anim-fade-up anim-stagger-2 border-2 border-black/5 bg-gradient-to-br from-white to-black/5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-base font-bold">Scan</div>
              <div className="text-xs text-black/60 font-medium mt-0.5">
                {tier === 'premium' ? 'AI-powered analysis with micronutrients' : 'AI-powered analysis (basic macros)'}
              </div>
            </div>
            <div className="rounded-full border-2 border-black/10 bg-white/80 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold shadow-modern">
              {lastScan ? new Date(lastScan.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="primary" className="w-full" onClick={() => runScan('meal')} disabled={busy} aria-label="Scan meal">
                <Camera className="h-4 w-4" aria-hidden="true" /> Meal
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => runScan('snack')} disabled={busy} aria-label="Scan snack">
                <Cookie className="h-4 w-4" aria-hidden="true" /> Snack
              </Button>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => setShowBarcodeScanner(true)} disabled={busy} aria-label="Scan barcode">
              <ScanLine className="h-4 w-4" aria-hidden="true" /> Scan Barcode
            </Button>
            {tier === 'premium' && (
              <Button variant="secondary" className="w-full" onClick={() => setShowFridgeChef(true)} disabled={busy}>
                <ChefHat className="h-4 w-4" /> Fridge Chef
              </Button>
            )}
            {tier !== 'premium' && (
              <div className="relative">
                <LockedOverlay>
                  <Button variant="secondary" className="w-full opacity-50" disabled>
                    <ChefHat className="h-4 w-4" /> Fridge Chef (PRO)
                  </Button>
                </LockedOverlay>
              </div>
            )}
          </div>

          {tier === 'premium' && proReaction && now - proReaction.at < 1000 * 60 * 60 && (
            <div className="mt-3 anim-pop rounded-2xl border border-[#DC2626]/30 bg-[#DC2626]/5 p-3">
              <div className="text-sm font-semibold text-[#DC2626]">{proReaction.title}</div>
              <div className="mt-1 text-xs text-black/70">{proReaction.message}</div>
            </div>
          )}
        </Card>

        <TodaysExercises consumed={consumed} targets={targets} biometrics={biometrics} />

        {canUndo && onUndo && (
          <Card className="anim-fade-up">
            <Button variant="secondary" className="w-full" onClick={onUndo} aria-label="Undo last meal">
              <Undo2 className="h-4 w-4" aria-hidden="true" /> Undo Last Meal
            </Button>
          </Card>
        )}

        <ScanLogEnhanced history={history} now={now} />

        <NutritionTrends history={history} targets={targets} />

        <MicronutrientGrid tier={tier} micros={latestMicros} />

        <HydrationCard cups={hydrationCups} onChange={onHydration} />

        <FastingCard
          tier={tier}
          now={now}
          lastMealAt={lastMealAt}
          fasting={fasting}
          onToggle={onToggleFasting}
          onReset={onResetFasting}
        />

        <PlanCard tier={tier} plan={plan} isNearCalorieLimit={isNearCalorieLimit} remainingCalories={remainingCalories} />
      </div>

      <Modal title="Settings" open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="rounded-2xl border border-black/10 p-3">
            <div className="text-[11px] text-black/60">User tier</div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">{tier === 'premium' ? 'Circula PRO' : 'Circula Core'}</div>
              <Button variant={tier === 'premium' ? 'secondary' : 'pro'} size="sm" onClick={onToggleTier}>
                {tier === 'premium' ? 'Switch to Core' : 'Upgrade to Pro'}
              </Button>
            </div>
          </div>

          {biometrics && onAddWeight && (
            <div className="rounded-2xl border border-black/10 p-3">
              <div className="text-[11px] text-black/60 mb-2">Weight Tracking</div>
              <div className="text-sm font-semibold mb-2">Current: {Math.round(biometrics.weightKg)} kg</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="New weight (kg)"
                  step="0.1"
                  min="30"
                  max="300"
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget
                      const weight = parseFloat(input.value)
                      if (!isNaN(weight) && weight >= 30 && weight <= 300) {
                        onAddWeight(weight)
                        input.value = ''
                        setToast({ message: '✓ Weight updated', type: 'success' })
                      }
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement
                    if (input) {
                      const weight = parseFloat(input.value)
                      if (!isNaN(weight) && weight >= 30 && weight <= 300) {
                        onAddWeight(weight)
                        input.value = ''
                        setToast({ message: '✓ Weight updated', type: 'success' })
                      }
                    }
                  }}
                >
                  Update
                </Button>
              </div>
              {weightHistory && weightHistory.length > 0 && (
                <div className="mt-2 text-xs text-black/60">
                  Last entry: {new Date(weightHistory[0].date).toLocaleDateString()} ({Math.round(weightHistory[0].weightKg)} kg)
                </div>
              )}
            </div>
          )}

          {favorites && favorites.length > 0 && (
            <div className="rounded-2xl border border-black/10 p-3">
              <div className="text-[11px] text-black/60 mb-2">Favorite Meals ({favorites.length})</div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {favorites.slice(0, 5).map((fav) => (
                  <div key={fav.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{fav.name}</div>
                      <div className="text-xs text-black/60">
                        {Math.round(fav.macros.calories)} kcal • P {Math.round(fav.macros.proteinG)}g
                      </div>
                    </div>
                    {onRemoveFromFavorites && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onRemoveFromFavorites(fav.id)
                          setToast({ message: '✓ Removed from favorites', type: 'success' })
                        }}
                        aria-label="Remove from favorites"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {favorites.length > 5 && (
                  <div className="text-xs text-black/60 text-center">+{favorites.length - 5} more</div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-black/10 p-3">
            <div className="text-[11px] text-black/60 mb-2">Data Management</div>
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  try {
                    const exported = exportState()
                    if (exported) {
                      const blob = new Blob([exported], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `circula-backup-${new Date().toISOString().split('T')[0]}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                      setToast({ message: '✓ Data exported successfully', type: 'success' })
                    } else {
                      setToast({ message: '✗ Failed to export data', type: 'error' })
                    }
                  } catch (err) {
                    setToast({ message: '✗ Failed to export data', type: 'error' })
                  }
                }}
              >
                <Download className="h-4 w-4" /> Export JSON
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  try {
                    // Export as CSV
                    const state = exportState()
                    if (!state) {
                      setToast({ message: '✗ Failed to export data', type: 'error' })
                      return
                    }
                    const data = JSON.parse(state)
                    let csv = 'Date,Type,Name,Calories,Protein (g),Carbs (g),Fat (g)\n'
                    data.history?.forEach((entry: HistoryEntry) => {
                      if (entry.type === 'meal' || entry.type === 'snack') {
                        const date = new Date(entry.at).toLocaleDateString()
                        csv += `${date},${entry.type},${entry.data.name || ''},${entry.data.calories || 0},${entry.data.macros?.proteinG || 0},${entry.data.macros?.carbsG || 0},${entry.data.macros?.fatG || 0}\n`
                      }
                    })
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `circula-export-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    URL.revokeObjectURL(url)
                    setToast({ message: '✓ CSV exported successfully', type: 'success' })
                  } catch (err) {
                    setToast({ message: '✗ Failed to export CSV', type: 'error' })
                  }
                }}
              >
                <Download className="h-4 w-4" /> Export CSV
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'application/json'
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      try {
                        const text = await file.text()
                        const result = importState(text)
                        if (result.success) {
                          setToast({ message: '✓ Data imported successfully. Reloading...', type: 'success' })
                          setTimeout(() => window.location.reload(), 1000)
                        } else {
                          setToast({ message: `✗ Import failed: ${result.error}`, type: 'error' })
                        }
                      } catch (err) {
                        setToast({ message: '✗ Failed to read file', type: 'error' })
                      }
                    }
                  }
                  input.click()
                }}
              >
                Import Data
              </Button>
            </div>
          </div>

          <Button variant="secondary" className="w-full" onClick={() => { onResetAll(); setSettingsOpen(false) }}>
            <Trash2 className="h-4 w-4" /> Reset all data
          </Button>
        </div>
      </Modal>

    </div>
  )
}
