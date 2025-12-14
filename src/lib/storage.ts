import type { AppState } from '../types'
import { AppStateSchema, type ValidatedAppState } from './validation'

const KEY = 'circula_state_v1'
const CURRENT_VERSION = 1

// Callback for storage errors (can be set by app)
let onStorageError: ((error: Error) => void) | null = null

export function setStorageErrorHandler(handler: (error: Error) => void) {
  onStorageError = handler
}

function migrateState(data: any, _fromVersion: number): ValidatedAppState | null {
  // For now, just validate. In future, add migration logic when schema changes
  try {
    return AppStateSchema.parse(data)
  } catch {
    return null
  }
}

export function loadState(): AppState | undefined {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return undefined
    
    const parsed = JSON.parse(raw)
    const validated = migrateState(parsed, CURRENT_VERSION)
    
    if (!validated) {
      console.warn('Invalid state data in localStorage, clearing...')
      clearState()
      return undefined
    }
    
    return validated as AppState
  } catch (err) {
    console.error('Failed to load state:', err)
    // Clear corrupted data
    try {
      localStorage.removeItem(KEY)
    } catch {
      // Ignore
    }
    return undefined
  }
}

export function saveState(state: AppState) {
  try {
    // Validate before saving
    const validated = AppStateSchema.parse(state)
    localStorage.setItem(KEY, JSON.stringify(validated))
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown storage error')
    console.error('Failed to save state:', error)
    
    // Handle quota exceeded error
    if (error instanceof DOMException && error.code === 22) {
      const quotaError = new Error('Storage quota exceeded. Please clear some data.')
      if (onStorageError) {
        onStorageError(quotaError)
      }
    } else if (onStorageError) {
      onStorageError(error)
    }
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY)
  } catch (err) {
    console.error('Failed to clear state:', err)
  }
}

export function exportState(): string | null {
  try {
    const state = loadState()
    if (!state) return null
    return JSON.stringify(state, null, 2)
  } catch {
    return null
  }
}

export function exportStateSync(): string | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return raw
  } catch {
    return null
  }
}

export function importState(json: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(json)
    const validated = AppStateSchema.parse(parsed)
    saveState(validated as AppState)
    return { success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Invalid data format'
    return { success: false, error }
  }
}
