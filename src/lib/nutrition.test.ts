import { describe, it, expect } from 'vitest'
import { calcBmr, calcTdee, calcTargets } from './nutrition'
import type { Biometrics } from '../types'

describe('nutrition calculations', () => {
  const baseBiometrics: Biometrics = {
    age: 30,
    sex: 'male',
    heightCm: 180,
    weightKg: 80,
    activity: 'moderate',
    goal: 'maintain',
    dietaryStyle: 'balanced',
  }

  describe('calcBmr', () => {
    it('calculates BMR correctly for male', () => {
      const bmr = calcBmr(baseBiometrics)
      expect(bmr).toBeGreaterThan(1500)
      expect(bmr).toBeLessThan(2500)
    })

    it('calculates BMR correctly for female', () => {
      const bmr = calcBmr({ ...baseBiometrics, sex: 'female' })
      expect(bmr).toBeGreaterThan(1200)
      expect(bmr).toBeLessThan(2000)
    })

    it('returns different BMR for different weights', () => {
      const bmr1 = calcBmr(baseBiometrics)
      const bmr2 = calcBmr({ ...baseBiometrics, weightKg: 100 })
      expect(bmr2).toBeGreaterThan(bmr1)
    })
  })

  describe('calcTdee', () => {
    it('calculates TDEE correctly', () => {
      const tdee = calcTdee(baseBiometrics)
      expect(tdee).toBeGreaterThan(calcBmr(baseBiometrics))
    })

    it('returns higher TDEE for more active users', () => {
      const sedentary = calcTdee({ ...baseBiometrics, activity: 'sedentary' })
      const veryActive = calcTdee({ ...baseBiometrics, activity: 'very_active' })
      expect(veryActive).toBeGreaterThan(sedentary)
    })
  })

  describe('calcTargets', () => {
    it('calculates targets correctly', () => {
      const targets = calcTargets(baseBiometrics)
      expect(targets.calories).toBeGreaterThan(1200)
      expect(targets.proteinG).toBeGreaterThan(50)
      expect(targets.carbsG).toBeGreaterThan(0)
      expect(targets.fatG).toBeGreaterThan(0)
    })

    it('adjusts calories for weight loss goal', () => {
      const maintain = calcTargets({ ...baseBiometrics, goal: 'maintain' })
      const lose = calcTargets({ ...baseBiometrics, goal: 'lose' })
      expect(lose.calories).toBeLessThan(maintain.calories)
    })

    it('adjusts calories for weight gain goal', () => {
      const maintain = calcTargets({ ...baseBiometrics, goal: 'maintain' })
      const gain = calcTargets({ ...baseBiometrics, goal: 'gain' })
      expect(gain.calories).toBeGreaterThan(maintain.calories)
    })

    it('adjusts macros for keto dietary style', () => {
      const balanced = calcTargets({ ...baseBiometrics, dietaryStyle: 'balanced' })
      const keto = calcTargets({ ...baseBiometrics, dietaryStyle: 'keto' })
      expect(keto.carbsG).toBeLessThan(balanced.carbsG)
      expect(keto.fatG).toBeGreaterThan(balanced.fatG)
    })

    it('adjusts macros for vegan dietary style', () => {
      const balanced = calcTargets({ ...baseBiometrics, dietaryStyle: 'balanced' })
      const vegan = calcTargets({ ...baseBiometrics, dietaryStyle: 'vegan' })
      expect(vegan.carbsG).toBeGreaterThan(balanced.carbsG)
    })

    it('ensures minimum calorie target', () => {
      const targets = calcTargets({ ...baseBiometrics, weightKg: 50, activity: 'sedentary' })
      expect(targets.calories).toBeGreaterThanOrEqual(1200)
    })
  })
})
