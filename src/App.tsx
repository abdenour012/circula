import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppState, Biometrics, HistoryEntry, ScanKind, ScanResult } from './types'
import { calcTargets } from './lib/nutrition'
import { clearState, loadState, saveState, setStorageErrorHandler } from './lib/storage'
import { addMacros, applyReaction, defaultPlan, shouldTriggerReaction, simulateScan } from './lib/mockAi'
import { processImageFile, scanWithAi } from './lib/api'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { DashboardScreen } from './screens/DashboardScreen'
import { PhoneFrame } from './components/PhoneFrame'

function initialState(): AppState {
  return {
    tier: 'free',
    consumed: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    scans: [],
    plan: defaultPlan(),
    hydrationCups: 0,
    hydrationHistory: [],
    fasting: { isActive: false, goalHours: 16 },
    fastingHistory: [],
    history: [],
  }
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState() ?? initialState())
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])


  // Debounced state saving
  const saveTimeoutRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      saveState(state)
    }, 500) // Debounce by 500ms
    
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [state])

  // Set up storage error handler
  useEffect(() => {
    setStorageErrorHandler((error: Error) => {
      console.error('Storage error:', error.message)
    })
  }, [])

  const targets = useMemo(() => {
    if (state.targets) return state.targets
    if (state.biometrics) return calcTargets(state.biometrics)
    return undefined
  }, [state.biometrics, state.targets])

  function completeOnboarding(bio: Biometrics) {
    const t = calcTargets(bio)
    setState((s) => ({ ...s, biometrics: bio, targets: t }))
  }

  function sleep(ms: number) {
    return new Promise<void>((r) => window.setTimeout(r, ms))
  }

  const scanAbortControllerRef = useRef<AbortController | undefined>(undefined)

  async function scan(kind: ScanKind, file?: File, options?: { signal?: AbortSignal }): Promise<ScanResult> {
    const started = performance.now()
    
    // Cancel previous scan if any
    if (scanAbortControllerRef.current) {
      scanAbortControllerRef.current.abort()
    }
    scanAbortControllerRef.current = new AbortController()
    const signal = options?.signal || scanAbortControllerRef.current.signal

    // Process image once (fix duplicate call)
    let imageDataUrl: string | undefined
    let imageFileName: string | undefined
    if (file) {
      try {
        imageDataUrl = await processImageFile(file)
        imageFileName = file.name // Extract filename for AI context
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to process image'
        console.error(`Image error: ${errorMsg}`)
        throw err
      }
    }

    let name: string
    let macros: ScanResult['macros']
    let micros: ScanResult['micros']
    let notes: ScanResult['notes']
    let isMock = false

    try {
      const out = await scanWithAi({ tier: state.tier, kind, imageBase64: imageDataUrl, imageFileName, signal })
      name = out.name
      macros = out.macros
      micros = out.micros
      notes = out.notes
    } catch (err) {
      // Don't use mock data if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        throw err
      }
      
      // Fallback to mock data if AI fails
      const fallback = simulateScan(state.tier, kind)
      name = fallback.name
      macros = fallback.macros
      micros = fallback.micros
      notes = fallback.notes
      isMock = true
    } finally {
      // Make actions feel deliberate (not instant).
      const elapsed = performance.now() - started
      if (elapsed < 900) await sleep(900 - elapsed)
    }

    const res: ScanResult = {
      id: (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2)) + Date.now().toString(16),
      at: Date.now(),
      kind,
      name,
      macros,
      micros,
      notes,
      imageUrl: imageDataUrl,
      isMock, // Add flag to indicate if this is mock data
    }

    // Don't add to consumed yet - wait for user confirmation
    // Just store the scan result temporarily
    return res
  }

  function confirmMeal(scanResult: ScanResult) {
    setState((s) => {
      const t = s.targets ?? (s.biometrics ? calcTargets(s.biometrics) : undefined)
      const consumed = addMacros(s.consumed, scanResult.macros)
      const now = Date.now()

      // Save current state to undo stack (keep last 10)
      const undoStack = [...(s.undoStack || []), { ...s }].slice(-10)

      // Add to history
      const historyEntry: HistoryEntry = {
        id: `history-${now}-${Math.random().toString(16).slice(2)}`,
        at: scanResult.at,
        type: scanResult.kind === 'snack' ? 'snack' : 'meal',
        data: {
          name: scanResult.name,
          calories: scanResult.macros.calories,
          macros: scanResult.macros,
        },
      }

      const next: AppState = {
        ...s,
        consumed,
        scans: [scanResult, ...s.scans],
        lastMealAt: scanResult.at,
        history: [historyEntry, ...s.history],
        undoStack,
      }

      // Smart fasting: sync to last meal time (PRO)
      if (s.tier === 'premium') {
        next.fasting = { ...s.fasting, isActive: true, startedAt: scanResult.at }
        
        // Add fasting start to history
        const fastingStartEntry: HistoryEntry = {
          id: `fasting-start-${now}-${Math.random().toString(16).slice(2)}`,
          at: scanResult.at,
          type: 'fasting_start',
          data: {},
        }
        next.history = [fastingStartEntry, ...next.history]
      }

      // Dynamic adaptation (PRO)
      if (s.tier === 'premium') {
        const overSoftLimit = t ? consumed.calories >= t.calories * 0.8 : false
        const triggers = shouldTriggerReaction(scanResult) || overSoftLimit
        if (triggers) {
          const plan = applyReaction(s.plan, scanResult)
          next.plan = plan
          next.proReaction = {
            at: now,
            title: 'Reaction',
            message: plan.workoutNote ?? 'Plan adjusted based on intake.',
          }
        }
      }

      return next
    })
  }

  function toggleTier() {
    setState((s) => {
      const nextTier = s.tier === 'premium' ? 'free' : 'premium'
      return {
        ...s,
        tier: nextTier,
        plan: nextTier === 'free' ? defaultPlan() : s.plan,
      }
    })
  }

  function resetAll() {
    clearState()
    setState(initialState())
  }

  function setHydration(next: number) {
    setState((s) => {
      const now = Date.now()
      const cupsAdded = next - s.hydrationCups
      
      // Add hydration to history if cups increased
      const newHistory = [...s.history]
      if (cupsAdded > 0) {
        const hydrationEntry: HistoryEntry = {
          id: `water-${now}-${Math.random().toString(16).slice(2)}`,
          at: now,
          type: 'water',
          data: { cups: cupsAdded },
        }
        newHistory.unshift(hydrationEntry)
      }

      return {
        ...s,
        hydrationCups: next,
        hydrationHistory: cupsAdded > 0 
          ? [{ at: now, cups: cupsAdded }, ...s.hydrationHistory]
          : s.hydrationHistory,
        history: newHistory,
      }
    })
  }

  function toggleFasting() {
    setState((s) => {
      if (s.tier === 'premium') return s
      const now = Date.now()
      const isActive = !s.fasting.isActive
      
      const newHistory = [...s.history]
      
      if (isActive) {
        // Starting fast
        const fastingStartEntry: HistoryEntry = {
          id: `fasting-start-${now}-${Math.random().toString(16).slice(2)}`,
          at: now,
          type: 'fasting_start',
          data: {},
        }
        newHistory.unshift(fastingStartEntry)
      } else if (s.fasting.startedAt) {
        // Ending fast
        const hours = Math.round((now - s.fasting.startedAt) / (1000 * 60 * 60) * 10) / 10
        const fastingEndEntry: HistoryEntry = {
          id: `fasting-end-${now}-${Math.random().toString(16).slice(2)}`,
          at: now,
          type: 'fasting_end',
          data: { hours },
        }
        newHistory.unshift(fastingEndEntry)
        
        // Add to fasting history
        const fastingHistory = [...s.fastingHistory]
        const lastFast = fastingHistory.find(f => !f.endedAt && f.startedAt === s.fasting.startedAt)
        if (lastFast) {
          lastFast.endedAt = now
          lastFast.hours = hours
        } else {
          fastingHistory.unshift({ startedAt: s.fasting.startedAt, endedAt: now, hours })
        }
        
        return {
          ...s,
          fasting: {
            ...s.fasting,
            isActive: false,
          },
          fastingHistory,
          history: newHistory,
        }
      }
      
      return {
        ...s,
        fasting: {
          ...s.fasting,
          isActive,
          startedAt: isActive ? now : s.fasting.startedAt,
        },
        history: newHistory,
      }
    })
  }

  function resetFasting() {
    setState((s) => {
      const now = Date.now()
      const newHistory = [...s.history]
      
      // If fasting was active, add end entry
      if (s.fasting.isActive && s.fasting.startedAt) {
        const hours = Math.round((now - s.fasting.startedAt) / (1000 * 60 * 60) * 10) / 10
        const fastingEndEntry: HistoryEntry = {
          id: `fasting-end-${now}-${Math.random().toString(16).slice(2)}`,
          at: now,
          type: 'fasting_end',
          data: { hours },
        }
        newHistory.unshift(fastingEndEntry)
        
        // Update fasting history
        const fastingHistory = [...s.fastingHistory]
        const lastFast = fastingHistory.find(f => !f.endedAt && f.startedAt === s.fasting.startedAt)
        if (lastFast) {
          lastFast.endedAt = now
          lastFast.hours = hours
        } else {
          fastingHistory.unshift({ startedAt: s.fasting.startedAt, endedAt: now, hours })
        }
        
        return {
          ...s,
          fasting: { ...s.fasting, isActive: s.tier === 'premium', startedAt: undefined },
          fastingHistory,
          history: newHistory,
        }
      }
      
      return { ...s, fasting: { ...s.fasting, isActive: s.tier === 'premium', startedAt: undefined } }
    })
  }

  function undoLastMeal() {
    setState((s) => {
      const undoStack = s.undoStack || []
      if (undoStack.length === 0) return s
      const previousState = undoStack[undoStack.length - 1]
      return {
        ...previousState,
        undoStack: undoStack.slice(0, -1),
      }
    })
  }

  function addToFavorites(scanResult: ScanResult) {
    setState((s) => {
      const favorites = s.favorites || []
      const favorite: import('./types').FavoriteMeal = {
        id: scanResult.id,
        name: scanResult.name,
        macros: scanResult.macros,
        micros: scanResult.micros,
        createdAt: Date.now(),
      }
      return {
        ...s,
        favorites: [favorite, ...favorites.filter(f => f.id !== favorite.id)].slice(0, 50), // Max 50 favorites
      }
    })
  }

  function removeFromFavorites(favoriteId: string) {
    setState((s) => ({
      ...s,
      favorites: (s.favorites || []).filter(f => f.id !== favoriteId),
    }))
  }

  function addWeightEntry(weightKg: number) {
    setState((s) => {
      const weightHistory = s.weightHistory || []
      const entry: import('./types').WeightEntry = {
        date: Date.now(),
        weightKg,
      }
      // Update biometrics if exists
      const updatedBiometrics = s.biometrics ? { ...s.biometrics, weightKg } : s.biometrics
      const updatedTargets = updatedBiometrics ? calcTargets(updatedBiometrics) : s.targets
      return {
        ...s,
        biometrics: updatedBiometrics,
        targets: updatedTargets,
        weightHistory: [entry, ...weightHistory].slice(0, 365), // Keep last year
      }
    })
  }


  if (!state.biometrics || !targets) {
    return (
      <PhoneFrame>
        <OnboardingScreen onComplete={completeOnboarding} />
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      <DashboardScreen
        tier={state.tier}
        now={now}
        targets={targets}
        consumed={state.consumed}
        scans={state.scans}
        plan={state.plan}
        hydrationCups={state.hydrationCups}
        lastMealAt={state.lastMealAt}
        fasting={state.fasting}
        proReaction={state.proReaction}
        goal={state.biometrics?.goal ?? 'maintain'}
        biometrics={state.biometrics}
        onScan={scan}
        onConfirmMeal={confirmMeal}
        onHydration={setHydration}
        onToggleFasting={toggleFasting}
        onResetFasting={resetFasting}
        onToggleTier={toggleTier}
        onResetAll={resetAll}
        history={state.history}
        favorites={state.favorites}
        weightHistory={state.weightHistory}
        canUndo={(state.undoStack?.length || 0) > 0}
        onUndo={undoLastMeal}
        onAddToFavorites={addToFavorites}
        onRemoveFromFavorites={removeFromFavorites}
        onAddWeight={addWeightEntry}
      />
    </PhoneFrame>
  )
}
