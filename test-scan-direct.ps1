# Direct test of the scan endpoint with couscous.jpg
$baseUrl = "http://localhost:8787"
$imageName = "couscous.jpg"

Write-Host "Testing API Scan with $imageName" -ForegroundColor Cyan
Write-Host ""

Write-Host "Sending request to /api/test-scan..." -ForegroundColor Yellow
Write-Host "This may take 10-30 seconds..." -ForegroundColor Gray

try {
    $body = @{
        imageName = $imageName
        tier = "premium"
        kind = "meal"
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "$baseUrl/api/test-scan" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 60
    
    Write-Host ""
    Write-Host "SUCCESS! Scan completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "  Name: $($result.name)" -ForegroundColor White
    Write-Host "  Calories: $($result.macros.calories) kcal" -ForegroundColor White
    Write-Host "  Protein: $($result.macros.proteinG)g" -ForegroundColor White
    Write-Host "  Carbs: $($result.macros.carbsG)g" -ForegroundColor White
    Write-Host "  Fat: $($result.macros.fatG)g" -ForegroundColor White
    
    if ($result.micros) {
        Write-Host ""
        Write-Host "Micros:" -ForegroundColor Cyan
        Write-Host "  Sugar: $($result.micros.sugarG)g" -ForegroundColor White
        Write-Host "  Sodium: $($result.micros.sodiumMg)mg" -ForegroundColor White
        Write-Host "  Fiber: $($result.micros.fiberG)g" -ForegroundColor White
        Write-Host "  Saturated Fat: $($result.micros.saturatedFatG)g" -ForegroundColor White
    }
    
    if ($result.notes -and $result.notes.Count -gt 0) {
        Write-Host ""
        Write-Host "Notes:" -ForegroundColor Cyan
        foreach ($note in $result.notes) {
            Write-Host "  - $note" -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "Full JSON Response:" -ForegroundColor Cyan
    Write-Host ($result | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    
} catch {
    $errorMsg = $_.Exception.Message
    Write-Host ""
    Write-Host "ERROR: $errorMsg" -ForegroundColor Red
    
    if ($errorMsg -match "OPENAI_API_KEY" -or $errorMsg -match "Missing") {
        Write-Host ""
        Write-Host "TIP: Set OPENAI_API_KEY in your .env file" -ForegroundColor Yellow
    } elseif ($errorMsg -match "404") {
        Write-Host ""
        Write-Host "TIP: The endpoint may not be registered. Restart the server:" -ForegroundColor Yellow
        Write-Host "   npm run dev:api" -ForegroundColor Yellow
    } elseif ($errorMsg -match "timeout" -or $errorMsg -match "timed out") {
        Write-Host ""
        Write-Host "TIP: The request timed out. This might be normal for AI processing." -ForegroundColor Yellow
    }
}
