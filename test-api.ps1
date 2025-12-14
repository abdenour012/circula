# Test API endpoints
$baseUrl = "http://localhost:8787"

Write-Host "Testing CIRCULA API" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health check
Write-Host "1. Testing /api/health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Write-Host "   SUCCESS: Health check passed" -ForegroundColor Green
    Write-Host "   Response: $($health | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "   ERROR: Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   TIP: Make sure the API server is running: npm run dev:api" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: List test images
Write-Host "2. Testing /api/test-images..." -ForegroundColor Yellow
try {
    $images = Invoke-RestMethod -Uri "$baseUrl/api/test-images" -Method Get
    if ($images.images.Count -gt 0) {
        Write-Host "   SUCCESS: Found $($images.images.Count) image(s):" -ForegroundColor Green
        foreach ($img in $images.images) {
            Write-Host "      - $img" -ForegroundColor Gray
        }
    } else {
        Write-Host "   WARNING: No images found in images/ folder" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERROR: Failed to list images: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Test scan with an image (if available)
if ($images -and $images.images.Count -gt 0) {
    $testImage = $images.images[0]
    Write-Host "3. Testing /api/test-scan with '$testImage'..." -ForegroundColor Yellow
    Write-Host "   This may take 10-30 seconds..." -ForegroundColor Gray
    
    try {
        $body = @{
            imageName = $testImage
            tier = "premium"
            kind = "meal"
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri "$baseUrl/api/test-scan" -Method Post -Body $body -ContentType "application/json"
        
        Write-Host "   SUCCESS: Scan completed!" -ForegroundColor Green
        Write-Host "   Results:" -ForegroundColor Cyan
        Write-Host "      Name: $($result.name)" -ForegroundColor White
        Write-Host "      Calories: $($result.macros.calories) kcal" -ForegroundColor White
        Write-Host "      Protein: $($result.macros.proteinG)g" -ForegroundColor White
        Write-Host "      Carbs: $($result.macros.carbsG)g" -ForegroundColor White
        Write-Host "      Fat: $($result.macros.fatG)g" -ForegroundColor White
        
        if ($result.micros) {
            Write-Host "   Micros:" -ForegroundColor Cyan
            Write-Host "      Sugar: $($result.micros.sugarG)g" -ForegroundColor White
            Write-Host "      Sodium: $($result.micros.sodiumMg)mg" -ForegroundColor White
            Write-Host "      Fiber: $($result.micros.fiberG)g" -ForegroundColor White
        }
        
        if ($result.notes -and $result.notes.Count -gt 0) {
            Write-Host "   Notes:" -ForegroundColor Cyan
            foreach ($note in $result.notes) {
                Write-Host "      - $note" -ForegroundColor White
            }
        }
        
    } catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -match "OPENAI_API_KEY" -or $errorMsg -match "Missing") {
            Write-Host "   WARNING: API Key missing: $errorMsg" -ForegroundColor Yellow
            Write-Host "   TIP: Set OPENAI_API_KEY in your .env file" -ForegroundColor Yellow
        } else {
            Write-Host "   ERROR: Scan failed: $errorMsg" -ForegroundColor Red
        }
    }
} else {
    Write-Host "3. Skipping scan test (no images available)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Testing complete!" -ForegroundColor Cyan
