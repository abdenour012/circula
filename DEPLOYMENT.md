# Deployment Guide - Circula App

## 🚀 Quick Deploy Options

### Option 1: Railway (Easiest - Recommended) ⭐

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect and deploy
6. Add environment variables in Railway dashboard:
   - `OPENROUTER_API_KEY` (or `OPENAI_API_KEY`)
   - `AI_PROVIDER` (optional, defaults to 'openrouter')
   - `NODE_ENV=production`
   - `PORT` (Railway sets this automatically)
   - `ALLOWED_ORIGINS` (optional, for CORS)

**Your app will be live at:** `https://your-project-name.railway.app`

---

### Option 2: Render.com (Also Easy)

**Steps:**
1. Go to [render.com](https://render.com)
2. Sign up/login
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Environment:** Node
6. Add environment variables (same as Railway)
7. Deploy!

**Your app will be live at:** `https://your-project-name.onrender.com`

---

### Option 3: Vercel (Frontend + Serverless)

**Note:** Requires converting Express routes to serverless functions

**Steps:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Vite
4. Add environment variables
5. Deploy!

**For API:** You'll need to convert `/api/*` routes to Vercel serverless functions

---

### Option 4: Fly.io

**Steps:**
1. Install Fly CLI: `npm install -g @fly/cli`
2. Run: `fly launch`
3. Follow prompts
4. Add secrets: `fly secrets set OPENROUTER_API_KEY=your_key`
5. Deploy: `fly deploy`

---

## 📋 Required Environment Variables

Create a `.env` file or add these in your hosting platform:

```env
# Required - Choose one:
OPENROUTER_API_KEY=your_openrouter_key
# OR
OPENAI_API_KEY=your_openai_key

# Optional:
AI_PROVIDER=openrouter  # or 'openai'
OPENROUTER_MODEL=x-ai/grok-4.1-fast
OPENAI_MODEL=gpt-4o-mini
NODE_ENV=production
PORT=8787  # Usually auto-set by platform
ALLOWED_ORIGINS=https://your-domain.com
```

---

## 🔧 Build & Test Locally

Before deploying, test the production build:

```bash
# Build frontend
npm run build

# Start production server
npm run start:prod

# Visit http://localhost:8787
```

---

## 🌐 Post-Deployment Checklist

- [ ] Environment variables set
- [ ] API keys configured
- [ ] CORS origins updated
- [ ] Test barcode scanning (requires HTTPS)
- [ ] Test image uploads
- [ ] Verify API endpoints work
- [ ] Check console for errors

---

## 🐛 Troubleshooting

### API not working?
- Check environment variables are set
- Verify CORS settings
- Check server logs

### Images not uploading?
- Ensure HTTPS (required for camera access)
- Check file size limits
- Verify API endpoint is accessible

### Build fails?
- Check Node.js version (should be 18+)
- Verify all dependencies install
- Check for TypeScript errors

---

## 📝 Recommended: Railway Deployment

Railway is the easiest because:
- ✅ Auto-detects Node.js apps
- ✅ Free tier available
- ✅ Easy environment variable management
- ✅ Automatic HTTPS
- ✅ Simple GitHub integration
- ✅ No configuration needed

**Just connect your GitHub repo and deploy!**
