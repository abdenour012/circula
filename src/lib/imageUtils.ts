/**
 * Compress image before uploading to reduce payload size
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width
        let height = img.height
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to JPEG for better compression
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Get image size in MB from base64 data URL
 */
export function getImageSizeMB(dataUrl: string): number {
  // Remove data URL prefix to get base64 string
  const base64 = dataUrl.split(',')[1]
  if (!base64) return 0
  
  // Calculate size: base64 is ~33% larger than binary
  const binarySize = (base64.length * 3) / 4
  return binarySize / 1024 / 1024 // Convert to MB
}

/**
 * Validate image size before processing
 */
export function validateImageSize(dataUrl: string, maxSizeMB = 10): { valid: boolean; sizeMB: number; error?: string } {
  const sizeMB = getImageSizeMB(dataUrl)
  
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      sizeMB,
      error: `Image too large (${sizeMB.toFixed(2)}MB). Maximum size is ${maxSizeMB}MB.`,
    }
  }
  
  return { valid: true, sizeMB }
}
