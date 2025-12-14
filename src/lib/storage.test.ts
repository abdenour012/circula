import { describe, it, expect, beforeEach } from 'vitest'
import { loadState, saveState, clearState, exportState, importState } from './storage'
import type { AppState } from '../types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('saveState and loadState', () => {
    it('saves and loads valid state', () => {
      const state: AppState = {
        tier: 'free',
        consumed: { calories: 1000, proteinG: 50, carbsG: 100, fatG: 30 },
        scans: [],
        plan: { dinner: 'Rice Bowl', workout: 'Walk (30 min)' },
        hydrationCups: 5,
        hydrationHistory: [],
        fasting: { isActive: false, goalHours: 16 },
        fastingHistory: [],
        history: [],
      }

      saveState(state)
      const loaded = loadState()

      expect(loaded).toEqual(state)
    })

    it('returns undefined for invalid state', () => {
      localStorage.setItem('circula_state_v1', 'invalid json')
      const loaded = loadState()
      expect(loaded).toBeUndefined()
    })

    it('returns undefined when localStorage is empty', () => {
      const loaded = loadState()
      expect(loaded).toBeUndefined()
    })
  })

  describe('clearState', () => {
    it('clears state from localStorage', () => {
      const state: AppState = {
        tier: 'free',
        consumed: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
        scans: [],
        plan: { dinner: 'Rice Bowl', workout: 'Walk (30 min)' },
        hydrationCups: 0,
        hydrationHistory: [],
        fasting: { isActive: false, goalHours: 16 },
        fastingHistory: [],
        history: [],
      }

      saveState(state)
      clearState()
      const loaded = loadState()
      expect(loaded).toBeUndefined()
    })
  })

  describe('exportState and importState', () => {
    it('exports and imports state correctly', () => {
      const state: AppState = {
        tier: 'premium',
        consumed: { calories: 2000, proteinG: 100, carbsG: 200, fatG: 50 },
        scans: [],
        plan: { dinner: 'Chicken', workout: 'Run' },
        hydrationCups: 8,
        hydrationHistory: [],
        fasting: { isActive: true, startedAt: Date.now(), goalHours: 16 },
        fastingHistory: [],
        history: [],
      }

      saveState(state)
      const exported = exportState()
      expect(exported).toBeTruthy()
      expect(exported).toContain('premium')

      clearState()
      const importResult = importState(exported!)
      expect(importResult.success).toBe(true)

      const loaded = loadState()
      expect(loaded?.tier).toBe('premium')
    })

    it('returns error for invalid import data', () => {
      const result = importState('invalid json')
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })
})
