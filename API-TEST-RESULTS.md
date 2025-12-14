# API Test Results

## Test Summary

✅ **Health Endpoint**: Working correctly
- `/api/health` returns `{"ok": true}`

⚠️ **Test Images Endpoint**: Returns 404
- `/api/test-images` - May need server restart to register new routes

## Endpoints Available

1. **GET `/api/health`** - Health check
   - Status: ✅ Working
   - Response: `{"ok": true}`

2. **GET `/api/test-images`** - List available test images
   - Status: ⚠️ 404 (may need server restart)
   - Returns: `{"images": ["couscous.jpg", "Lablabi-10.jpg", "mlewi.jpg"]}`

3. **POST `/api/test-scan`** - Test scan with local image
   - Body: `{"imageName": "couscous.jpg", "tier": "premium", "kind": "meal"}`
   - Returns: Scan results with food name, macros, and micros

4. **POST `/api/scan`** - Scan uploaded image
   - Body: `{"tier": "premium", "kind": "meal", "imageBase64": "data:image/..."}`
   - Returns: Scan results

5. **POST `/api/fridge`** - Fridge Chef recipe generation
   - Body: `{"tier": "premium", "imageBase64": "...", "targets": {...}, "consumed": {...}}`
   - Returns: Recipe card

## How to Test

### Option 1: Use the Test Script
```powershell
cd circula
powershell -ExecutionPolicy Bypass -File test-api.ps1
```

### Option 2: Use the Browser Test Page
1. Start the API server: `npm run dev:api`
2. Open `test-page.html` in your browser
3. Click "List Available Images" and test any image

### Option 3: Manual PowerShell Testing

**Health Check:**
```powershell
Invoke-RestMethod -Uri http://localhost:8787/api/health -Method Get
```

**List Images:**
```powershell
Invoke-RestMethod -Uri http://localhost:8787/api/test-images -Method Get
```

**Test Scan:**
```powershell
$body = @{
    imageName = "couscous.jpg"
    tier = "premium"
    kind = "meal"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8787/api/test-scan -Method Post -Body $body -ContentType "application/json"
```

## Troubleshooting

1. **Server not running?**
   ```bash
   npm run dev:api
   ```

2. **404 on test-images?**
   - Restart the server to register new routes
   - Check that the `images/` folder exists one level up from `circula/`

3. **API Key missing?**
   - Create `.env` file from `env.example`
   - Add your `OPENAI_API_KEY`
   - Restart the server

4. **Model not found?**
   - Make sure you have access to `gpt-5.2-pro` in your OpenAI account
   - Or change `OPENAI_MODEL` in `.env` to `gpt-4o` or `gpt-4o-mini`
