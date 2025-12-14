import type { MacroBreakdown, RecipeCard, ScanKind, UserTier } from '../types'
import { fetchWithRetry } from './apiUtils'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export async function scanWithAi({
  tier,
  kind,
  imageBase64,
  imageFileName,
  signal,
}: {
  tier: UserTier
  kind: ScanKind
  imageBase64?: string
  imageFileName?: string
  signal?: AbortSignal
}) {
  const res = await fetchWithRetry(
    `${API_BASE_URL}/api/scan`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, kind, imageBase64, imageFileName }),
      signal,
    },
    3, // retries
    1000 // base delay
  )

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(body.message ?? 'Scan failed')
  }

  return (await res.json()) as {
    name: string
    macros: MacroBreakdown
    micros?: {
      sugarG: number
      sodiumMg: number
      ironMg: number
      saturatedFatG: number
      fiberG: number
    }
    notes?: string[]
    portionBreakdown?: Array<{
      ingredient: string
      amount: string
      calories: number
      proteinG: number
      carbsG: number
      fatG: number
    }>
  }
}

export async function fridgeChefWithAi({
  tier,
  imageBase64,
  targets,
  consumed,
  signal,
}: {
  tier: UserTier
  imageBase64?: string
  targets?: { calories: number; proteinG: number; carbsG: number; fatG: number }
  consumed?: { calories: number; proteinG: number; carbsG: number; fatG: number }
  signal?: AbortSignal
}) {
  const res = await fetchWithRetry(
    `${API_BASE_URL}/api/fridge`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, imageBase64, targets, consumed }),
      signal,
    },
    3,
    1000
  )

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(body.message ?? 'Fridge scan failed')
  }

  return (await res.json()) as RecipeCard
}

export async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}

/**
 * Process image file: compress and validate
 */
export async function processImageFile(file: File): Promise<string> {
  const { compressImage, validateImageSize } = await import('./imageUtils')
  
  // Compress image
  const compressed = await compressImage(file, 1920, 1920, 0.8)
  
  // Validate size
  const validation = validateImageSize(compressed, 10)
  if (!validation.valid) {
    throw new Error(validation.error ?? 'Image validation failed')
  }
  
  return compressed
}
