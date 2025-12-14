import 'dotenv/config'
import express from 'express'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const NODE_ENV = process.env.NODE_ENV ?? 'development'

const PORT = Number(process.env.PORT ?? 8787)
const AI_PROVIDER = process.env.AI_PROVIDER ?? 'openrouter'

// OpenRouter configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? 'x-ai/grok-4.1-fast'
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// OpenAI configuration (fallback)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

const app = express()

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174']
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || NODE_ENV === 'development') {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '12mb' }))

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // More restrictive for expensive AI operations
  message: 'Too many scan requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Image size validation middleware
function validateImageSize(req, res, next) {
  if (req.body.imageBase64) {
    try {
      // Remove data URL prefix
      const base64 = req.body.imageBase64.split(',')[1]
      if (base64) {
        // Calculate size: base64 is ~33% larger than binary
        const binarySize = (base64.length * 3) / 4
        const sizeInMB = binarySize / 1024 / 1024
        const maxSizeMB = 10

        if (sizeInMB > maxSizeMB) {
          return res.status(400).json({
            error: true,
            message: `Image too large (${sizeInMB.toFixed(2)}MB). Maximum size is ${maxSizeMB}MB.`,
          })
        }
      }
    } catch (err) {
      return res.status(400).json({
        error: true,
        message: 'Invalid image data format.',
      })
    }
  }
  next()
}

function requireKey() {
  if (AI_PROVIDER === 'openrouter') {
    if (!OPENROUTER_API_KEY) {
      const err = new Error('Missing OPENROUTER_API_KEY')
      // @ts-ignore
      err.statusCode = 400
      throw err
    }
    return OPENROUTER_API_KEY
  } else {
    if (!OPENAI_API_KEY) {
      const err = new Error('Missing OPENAI_API_KEY')
      // @ts-ignore
      err.statusCode = 400
      throw err
    }
    return OPENAI_API_KEY
  }
}

async function callAI(messages, options = {}) {
  if (AI_PROVIDER === 'openrouter') {
    // Use OpenRouter API (Grok 4.1 Fast)
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:8787', // Optional: for analytics
        'X-Title': 'CIRCULA Nutrition App', // Optional: for analytics
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: options.temperature ?? 0.1,
        max_tokens: options.max_tokens ?? 500,
        ...options,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content ?? '{}'
  } else {
    // Use OpenAI API (fallback)
    const client = new OpenAI({ apiKey: OPENAI_API_KEY })
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      temperature: options.temperature ?? 0.1,
      response_format: options.response_format,
      max_tokens: options.max_tokens ?? 500,
    })
    return completion.choices?.[0]?.message?.content ?? '{}'
  }
}

function asNumber(n, fallback = 0) {
  if (n == null) return fallback
  const x = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(x) || isNaN(x)) return fallback
  return x
}

function sanitizeError(err, isDev) {
  if (isDev) return err.message
  if (err.message?.includes('API_KEY') || err.message?.includes('Missing')) {
    return 'Configuration error'
  }
  if (err.message?.includes('CORS')) {
    return 'Request not allowed'
  }
  return 'Internal server error'
}

function normalizeScan(payload, tier) {
  const macros = payload?.macros ?? payload?.macro ?? {}
  const micros = payload?.micros ?? payload?.micro ?? undefined
  const portionBreakdown = payload?.portionBreakdown ?? undefined

  const out = {
    name: String(payload?.name ?? 'Unknown meal'),
    macros: {
      calories: Math.max(0, asNumber(macros.calories)),
      proteinG: Math.max(0, asNumber(macros.proteinG)),
      carbsG: Math.max(0, asNumber(macros.carbsG)),
      fatG: Math.max(0, asNumber(macros.fatG)),
    },
    micros:
      tier === 'premium' && micros
        ? {
            sugarG: Math.max(0, asNumber(micros.sugarG)),
            sodiumMg: Math.max(0, asNumber(micros.sodiumMg)),
            ironMg: Math.max(0, asNumber(micros.ironMg)),
            saturatedFatG: Math.max(0, asNumber(micros.saturatedFatG)),
            fiberG: Math.max(0, asNumber(micros.fiberG)),
          }
        : undefined,
    notes: Array.isArray(payload?.notes) ? payload.notes.map(String).slice(0, 5) : undefined,
    portionBreakdown:
      tier === 'premium' && Array.isArray(portionBreakdown)
        ? portionBreakdown
            .slice(0, 10)
            .map((p) => ({
              ingredient: String(p?.ingredient ?? ''),
              amount: String(p?.amount ?? ''),
              calories: Math.max(0, asNumber(p?.calories)),
              proteinG: Math.max(0, asNumber(p?.proteinG)),
              carbsG: Math.max(0, asNumber(p?.carbsG)),
              fatG: Math.max(0, asNumber(p?.fatG)),
            }))
            .filter((p) => p.ingredient)
        : undefined,
  }

  return out
}

// Health check endpoint
app.get('/api/health', apiLimiter, (_req, res) => {
  res.json({ ok: true })
})

// Serve static files in production (must be before API routes)
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath))
    console.log(`Serving static files from: ${distPath}`)
  }
}

// Test endpoint to scan local images from the images folder
app.post('/api/test-scan', scanLimiter, async (req, res, next) => {
  try {
    const { imageName, tier = 'free', kind = 'meal' } = req.body ?? {}
    
    if (!imageName) {
      return res.status(400).json({ error: true, message: 'imageName is required' })
    }

    // Path to images folder (one level up from server folder)
    const imagesPath = path.join(__dirname, '..', '..', 'images', imageName)
    
    if (!fs.existsSync(imagesPath)) {
      return res.status(404).json({ error: true, message: `Image not found: ${imageName}` })
    }

    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(imagesPath)
    const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`

    requireKey()

    // Extract potential dish name from filename
    let filenameHint = ''
    if (imageName) {
      let cleanName = imageName
        .replace(/\.[^/.]+$/, '')
        .replace(/^\d{8,14}-/, '')
        .replace(/-min$/, '')
        .replace(/[_-]/g, ' ')
        .trim()
      
      cleanName = cleanName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      
      if (cleanName && cleanName.length > 2) {
        filenameHint = `\n\nFILENAME CONTEXT: The image filename is "${imageName}" which suggests this might be "${cleanName}". Use this as a hint, but ALWAYS verify by examining the actual image. If the image clearly shows something different, trust your visual analysis over the filename.`
      }
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are an expert nutrition analysis engine with deep knowledge of food identification, nutritional science, and global cuisines. You specialize in accurately identifying dishes from images and providing precise nutritional information based on established nutritional databases and standard recipes. Return STRICT JSON only, no markdown. Your expertise includes: Middle Eastern, North African, Mediterranean, Asian, European, American, and fusion cuisines. You understand portion sizes, cooking methods, and how they affect nutritional values. Output schema: {name: string, macros:{calories:number, proteinG:number, carbsG:number, fatG:number}, micros?:{sugarG:number,sodiumMg:number,ironMg:number,saturatedFatG:number,fiberG:number}, notes?:string[] }',
      },
      {
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: `Analyze this ${kind} image with extreme precision and attention to detail.${filenameHint}

CRITICAL ANALYSIS PROCESS:

STEP 1 - VISUAL IDENTIFICATION (PRIMARY):
- Examine the image with extreme care - look at every visible detail
- Identify colors, textures, shapes, presentation style, serving vessels
- Note visible ingredients, garnishes, sauces, cooking methods
- Consider portion size relative to common serving sizes
- Identify the specific dish name (e.g., "Greek Salad with Feta and Olives", not just "Salad")
- Recognize regional variations and cultural dishes accurately

STEP 2 - FILENAME CONTEXT (SECONDARY):
${filenameHint ? `- The filename suggests: "${imageName.replace(/\.[^/.]+$/, '').replace(/^\d{8,14}-/, '').replace(/-min$/, '').replace(/[_-]/g, ' ')}"
- Use this as a helpful hint, but ALWAYS prioritize what you actually see in the image
- If the image clearly shows something different from the filename, trust your visual analysis
- The filename can help identify obscure dishes or provide cultural context` : '- No filename provided - rely entirely on visual analysis'}

STEP 3 - NUTRITIONAL RESEARCH (ACCURATE):
- After identifying the dish, use your knowledge of:
  * USDA FoodData Central
  * Standard recipe databases
  * Typical serving sizes for the identified dish
  * Regional preparation methods and their nutritional impact
- For the identified dish name, provide accurate nutritional values based on:
  * Standard recipes for that specific dish
  * Typical portion sizes (consider what's visible in the image)
  * Common preparation methods (fried, grilled, steamed, etc.)
- DO NOT guess - use researched nutritional data for the specific dish identified

ACCURACY REQUIREMENTS:
- Food name must be specific and accurate (e.g., "Greek Salad" not "Salad")
- Nutritional values must be realistic for the identified dish and visible portion
- If uncertain about a component, estimate conservatively
- For mixed dishes, account for all visible ingredients

Return ONLY valid JSON with accurate, researched nutritional data.` 
          },
          {
            type: 'image_url',
            image_url: { 
              url: imageBase64,
              detail: 'high'
            },
          },
        ],
      },
    ]

    const text = await callAI(messages, {
      temperature: 0.1,
      response_format: { type: 'json_object' },
      max_tokens: 1000, // Increased for better analysis
    })
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = {}
    }

    const out = normalizeScan(parsed, tier)
    res.json({ ...out, imageName, tested: true })
  } catch (err) {
    console.error('Test scan error:', err)
    const status = err?.statusCode && Number.isFinite(err.statusCode) ? err.statusCode : 500
    res.status(status).json({
      error: true,
      message: err?.message ?? 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
  }
})

// List available test images
app.get('/api/test-images', (_req, res) => {
  try {
    const imagesPath = path.join(__dirname, '..', '..', 'images')
    if (!fs.existsSync(imagesPath)) {
      return res.json({ images: [] })
    }
    const files = fs.readdirSync(imagesPath)
    const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    res.json({ images })
  } catch (err) {
    res.status(500).json({ error: true, message: err.message })
  }
})

app.post('/api/scan', scanLimiter, validateImageSize, async (req, res, next) => {
  try {
    const { tier = 'free', kind = 'meal', imageBase64, imageFileName } = req.body ?? {}

    requireKey()

    // Extract potential dish name from filename (remove extension, clean up)
    let filenameHint = ''
    if (imageFileName) {
      // Remove file extension and common prefixes/suffixes
      let cleanName = imageFileName
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/^\d{8,14}-/, '') // Remove date prefixes like "20240905221054-"
        .replace(/-min$/, '') // Remove "-min" suffix
        .replace(/-[a-z]+$/i, '') // Remove common suffixes
        .replace(/[_-]/g, ' ') // Replace underscores/hyphens with spaces
        .trim()
      
      // Capitalize words
      cleanName = cleanName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      
      if (cleanName && cleanName.length > 2) {
        filenameHint = `\n\nFILENAME CONTEXT: The image filename suggests this might be "${cleanName}". Use this as a hint, but ALWAYS verify by examining the actual image. If the image clearly shows something different, trust your visual analysis over the filename.`
      }
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are an expert nutrition analysis engine with deep knowledge of food identification, nutritional science, and global cuisines. You specialize in accurately identifying dishes from images and providing precise nutritional information based on established nutritional databases and standard recipes. Return STRICT JSON only, no markdown. Your expertise includes: Middle Eastern, North African, Mediterranean, Asian, European, American, and fusion cuisines. You understand portion sizes, cooking methods, and how they affect nutritional values. Output schema: {name: string, macros:{calories:number, proteinG:number, carbsG:number, fatG:number}, micros?:{sugarG:number,sodiumMg:number,ironMg:number,saturatedFatG:number,fiberG:number}, notes?:string[], portionBreakdown?:[{ingredient:string, amount:string, calories:number, proteinG:number, carbsG:number, fatG:number}] }',
      },
      {
        role: 'user',
        content: imageBase64
          ? [
              { 
                type: 'text', 
                text: `Analyze this ${kind} image with extreme precision and attention to detail.${filenameHint}

CRITICAL ANALYSIS PROCESS:

STEP 1 - VISUAL IDENTIFICATION (PRIMARY):
- Examine the image with extreme care - look at every visible detail
- Identify colors, textures, shapes, presentation style, serving vessels
- Note visible ingredients, garnishes, sauces, cooking methods
- Consider portion size relative to common serving sizes
- Identify the specific dish name (e.g., "Greek Salad with Feta and Olives", not just "Salad")
- Recognize regional variations and cultural dishes accurately

STEP 2 - FILENAME CONTEXT (SECONDARY):
${filenameHint ? `- The filename suggests: "${imageFileName?.replace(/\.[^/.]+$/, '').replace(/^\d{8,14}-/, '').replace(/-min$/, '').replace(/[_-]/g, ' ')}"
- Use this as a helpful hint, but ALWAYS prioritize what you actually see in the image
- If the image clearly shows something different from the filename, trust your visual analysis
- The filename can help identify obscure dishes or provide cultural context` : '- No filename provided - rely entirely on visual analysis'}

STEP 3 - NUTRITIONAL RESEARCH (ACCURATE):
- After identifying the dish, use your knowledge of:
  * USDA FoodData Central
  * Standard recipe databases
  * Typical serving sizes for the identified dish
  * Regional preparation methods and their nutritional impact
- For the identified dish name, provide accurate nutritional values based on:
  * Standard recipes for that specific dish
  * Typical portion sizes (consider what's visible in the image)
  * Common preparation methods (fried, grilled, steamed, etc.)
- DO NOT guess - use researched nutritional data for the specific dish identified

STEP 4 - PORTION BREAKDOWN (DETAILED):
- Break down the meal into main components with realistic amounts
- For each component, provide:
  * Ingredient name (specific, e.g., "Feta Cheese" not "Cheese")
  * Estimated amount (realistic, e.g., "2 oz" or "1/2 cup")
  * Nutritional contribution (calories, protein, carbs, fat)
- Ensure portion breakdown totals match the overall macros
- Include all visible major components (proteins, carbs, vegetables, sauces, etc.)

STEP 5 - MICRONUTRIENTS (PREMIUM TIER):
- If this is a premium scan, provide detailed micronutrients:
  * Sugar (g) - especially for desserts, sauces, dressings
  * Sodium (mg) - important for processed foods, sauces, cheeses
  * Iron (mg) - for meats, legumes, leafy greens
  * Saturated Fat (g) - for dairy, meats, fried foods
  * Fiber (g) - for whole grains, vegetables, fruits
- Add notes for health considerations (high sodium, high sugar, etc.)

ACCURACY REQUIREMENTS:
- Food name must be specific and accurate (e.g., "Greek Salad" not "Salad")
- Nutritional values must be realistic for the identified dish and visible portion
- Portion breakdown must be detailed and match the total macros
- If uncertain about a component, estimate conservatively
- For mixed dishes, account for all visible ingredients

Return ONLY valid JSON with accurate, researched nutritional data. Include portionBreakdown array with detailed breakdown.` 
              },
              {
                type: 'image_url',
                image_url: { 
                  url: imageBase64,
                  detail: 'high' // Request high detail for better analysis
                },
              },
            ]
          : `No image was provided. Give a reasonable generic estimate for a ${kind}.`,
      },
    ]

    const text = await callAI(messages, {
      temperature: 0.1, // Lower temperature for more consistent, accurate identification
      response_format: { type: 'json_object' },
      max_tokens: 1200, // Increased for detailed portion breakdown and better analysis
    })
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = {}
    }

    const out = normalizeScan(parsed, tier)
    res.json(out)
  } catch (err) {
    next(err)
  }
})

app.post('/api/fridge', scanLimiter, validateImageSize, async (req, res, next) => {
  try {
    const { tier = 'free', imageBase64, targets, consumed } = req.body ?? {}

    requireKey()

    const remaining = targets && consumed
      ? {
          calories: Math.max(0, asNumber(targets.calories) - asNumber(consumed.calories)),
          proteinG: Math.max(0, asNumber(targets.proteinG) - asNumber(consumed.proteinG)),
          carbsG: Math.max(0, asNumber(targets.carbsG) - asNumber(consumed.carbsG)),
          fatG: Math.max(0, asNumber(targets.fatG) - asNumber(consumed.fatG)),
        }
      : undefined

    const messages = [
      {
        role: 'system',
        content:
          'You are a recipe generator. Return STRICT JSON only, no markdown. Output schema: {title:string, ingredients:string[], steps:string[], estimatedMacros:{calories:number, proteinG:number, carbsG:number, fatG:number}}. Make recipe match remaining macros if provided.',
      },
      {
        role: 'user',
        content: imageBase64
          ? [
              { type: 'text', text: `Scan this fridge image and propose a recipe. Remaining targets: ${remaining ? JSON.stringify(remaining) : 'unknown'}` },
              { type: 'image_url', image_url: { url: imageBase64 } },
            ]
          : `No image was provided. Propose a simple high-protein recipe. Remaining targets: ${remaining ? JSON.stringify(remaining) : 'unknown'}`,
      },
    ]

    const text = await callAI(messages, {
      temperature: 0.4,
      response_format: { type: 'json_object' },
    })
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = {}
    }

    if (tier !== 'premium') {
      res.json({
        title: 'Recipe (PRO)',
        ingredients: ['Locked'],
        steps: ['Upgrade to PRO to generate recipes.'],
        estimatedMacros: parsed?.estimatedMacros ?? { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
      })
      return
    }

    res.json({
      title: String(parsed?.title ?? 'Fridge Chef Recipe'),
      ingredients: Array.isArray(parsed?.ingredients) ? parsed.ingredients.map(String).slice(0, 20) : [],
      steps: Array.isArray(parsed?.steps) ? parsed.steps.map(String).slice(0, 12) : [],
      estimatedMacros: {
        calories: Math.max(0, asNumber(parsed?.estimatedMacros?.calories)),
        proteinG: Math.max(0, asNumber(parsed?.estimatedMacros?.proteinG)),
        carbsG: Math.max(0, asNumber(parsed?.estimatedMacros?.carbsG)),
        fatG: Math.max(0, asNumber(parsed?.estimatedMacros?.fatG)),
      },
    })
  } catch (err) {
    next(err)
  }
})

// Error handler
app.use((err, _req, res, _next) => {
  const status = err?.statusCode && Number.isFinite(err.statusCode) ? err.statusCode : 500
  const isDev = NODE_ENV === 'development'
  res.status(status).json({
    error: true,
    message: sanitizeError(err, isDev),
    ...(isDev && { details: err.stack }),
  })
})

// Serve index.html for all non-API routes (SPA routing) - must be last
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next()
    }
    // Serve index.html for SPA routing
    const indexPath = path.join(distPath, 'index.html')
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath)
    } else {
      res.status(404).send('Frontend not built. Run: npm run build')
    }
  })
}

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`)
  console.log(`📦 Environment: ${NODE_ENV}`)
  if (NODE_ENV === 'production') {
    console.log(`🌐 Serving frontend from dist/`)
  } else {
    console.log(`🔧 Development mode - API only`)
  }
})
