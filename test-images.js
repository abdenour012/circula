#!/usr/bin/env node
/**
 * Test script to scan local images from the images folder
 * Usage: node test-images.js [image-name]
 * Example: node test-images.js couscous.jpg
 * 
 * Make sure the API server is running: npm run dev:api
 */

const API_URL = 'http://localhost:8787'

async function listImages() {
  try {
    const res = await fetch(`${API_URL}/api/test-images`)
    const data = await res.json()
    return data.images || []
  } catch (err) {
    console.error('Failed to list images:', err.message)
    return []
  }
}

async function testImage(imageName) {
  try {
    console.log(`\n🔍 Testing image: ${imageName}`)
    console.log('⏳ Analyzing with AI...\n')
    
    const res = await fetch(`${API_URL}/api/test-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageName, tier: 'premium', kind: 'meal' }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message || `HTTP ${res.status}`)
    }

    const result = await res.json()
    
    console.log('✅ Results:')
    console.log(`   Name: ${result.name}`)
    console.log(`   Calories: ${result.macros.calories} kcal`)
    console.log(`   Protein: ${result.macros.proteinG}g`)
    console.log(`   Carbs: ${result.macros.carbsG}g`)
    console.log(`   Fat: ${result.macros.fatG}g`)
    
    if (result.micros) {
      console.log(`\n   Micros:`)
      console.log(`   Sugar: ${result.micros.sugarG}g`)
      console.log(`   Sodium: ${result.micros.sodiumMg}mg`)
      console.log(`   Fiber: ${result.micros.fiberG}g`)
      console.log(`   Saturated Fat: ${result.micros.saturatedFatG}g`)
    }
    
    if (result.notes && result.notes.length > 0) {
      console.log(`\n   Notes:`)
      result.notes.forEach(note => console.log(`   - ${note}`))
    }
    
    return result
  } catch (err) {
    console.error(`\n❌ Error testing ${imageName}:`, err.message)
    if (err.message.includes('OPENAI_API_KEY') || err.message.includes('Missing')) {
      console.error('\n💡 Make sure you have OPENAI_API_KEY set in your .env file')
    }
    throw err
  }
}

async function main() {
  const imageName = process.argv[2]
  
  if (imageName) {
    // Test specific image
    await testImage(imageName)
  } else {
    // List and test all images
    console.log('📸 Available images:')
    const images = await listImages()
    
    if (images.length === 0) {
      console.log('   No images found in images/ folder')
      console.log('\n💡 Place images in the images/ folder and try again')
      return
    }
    
    images.forEach((img, i) => {
      console.log(`   ${i + 1}. ${img}`)
    })
    
    console.log('\n💡 To test an image, run:')
    console.log(`   node test-images.js ${images[0]}`)
    console.log('\n   Or test all images:')
    for (const img of images) {
      await testImage(img)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s between tests
    }
  }
}

main().catch(console.error)
