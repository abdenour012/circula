# API Test Summary

## Current Status

✅ **Server is running** on port 8787
✅ **Health endpoint works**: `/api/health` returns `{"ok": true}`
⚠️ **New endpoints need server restart**: `/api/test-images` and `/api/test-scan` return 404

## What Needs to Happen

The server needs to be **restarted** to register the new test endpoints that were added to the code.

## How to Test After Restart

### Step 1: Restart the Server
```bash
# Stop current server (Ctrl+C if running)
# Then start it again:
cd circula
npm run dev:api
```

### Step 2: Test the Endpoints

**Option A: Use the test script**
```powershell
powershell -ExecutionPolicy Bypass -File test-scan-direct.ps1
```

**Option B: Manual PowerShell commands**

1. **List available images:**
```powershell
Invoke-RestMethod -Uri http://localhost:8787/api/test-images -Method Get
```

2. **Test scan with couscous:**
```powershell
$body = @{
    imageName = "couscous.jpg"
    tier = "premium"
    kind = "meal"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8787/api/test-scan -Method Post -Body $body -ContentType "application/json"
```

3. **Test scan with Lablabi:**
```powershell
$body = @{
    imageName = "Lablabi-10.jpg"
    tier = "premium"
    kind = "meal"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8787/api/test-scan -Method Post -Body $body -ContentType "application/json"
```

4. **Test scan with Mlewi:**
```powershell
$body = @{
    imageName = "mlewi.jpg"
    tier = "premium"
    kind = "meal"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8787/api/test-scan -Method Post -Body $body -ContentType "application/json"
```

## Expected Results

After restart, the API should:
- ✅ List all 3 images in the `images/` folder
- ✅ Successfully scan each image with GPT-5.2 Pro
- ✅ Return accurate food identification (couscous, lablabi, mlewi)
- ✅ Provide nutritional information (calories, macros, micros)

## Troubleshooting

1. **404 errors persist after restart?**
   - Check that `server/index.mjs` has the new endpoints
   - Verify the server console shows no errors
   - Check that the `images/` folder exists at the correct path

2. **API Key errors?**
   - Make sure `.env` file exists with `OPENAI_API_KEY`
   - Verify the key is valid and has access to GPT-5.2 Pro

3. **Model not found errors?**
   - Change `OPENAI_MODEL` in `.env` to `gpt-4o` if GPT-5.2 Pro isn't available
   - Or use `gpt-4o-mini` for testing

## Test Files Created

- `test-api.ps1` - Full API test suite
- `test-scan-direct.ps1` - Direct scan test
- `test-page.html` - Browser-based test interface
- `test-images.js` - Node.js test script (if node-fetch available)
