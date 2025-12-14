# 🚀 Quick Deployment Guide

## Easiest Method: Railway.app (5 minutes)

### Step 1: Push to GitHub
```bash
cd circula
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy on Railway
1. Go to **[railway.app](https://railway.app)** and sign up (free)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect and start deploying
5. Wait 2-3 minutes for deployment

### Step 3: Add Environment Variables
In Railway dashboard, go to **Variables** tab and add:

```
OPENROUTER_API_KEY=your_key_here
NODE_ENV=production
```

(Or use `OPENAI_API_KEY` if you prefer OpenAI)

### Step 4: Get Your Link
Railway will give you a URL like: `https://your-app.railway.app`

**That's it! Your app is live! 🎉**

---

## Alternative: Render.com (Also Easy)

1. Go to **[render.com](https://render.com)** and sign up
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Environment:** Node
5. Add environment variables (same as Railway)
6. Click **"Create Web Service"**

---

## Environment Variables Needed

Add these in your hosting platform:

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes* | Your OpenRouter API key |
| `OPENAI_API_KEY` | Yes* | Your OpenAI API key (if not using OpenRouter) |
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Auto | Usually auto-set by platform |
| `AI_PROVIDER` | No | `openrouter` or `openai` (default: openrouter) |
| `ALLOWED_ORIGINS` | No | Comma-separated origins for CORS |

*You need at least one API key (OpenRouter OR OpenAI)

---

## Testing After Deployment

1. Visit your deployed URL
2. Complete onboarding
3. Try scanning a meal
4. Check browser console for errors
5. Verify API calls work

---

## Troubleshooting

**App loads but API doesn't work?**
- Check environment variables are set
- Verify API key is correct
- Check server logs in hosting dashboard

**Build fails?**
- Ensure Node.js 18+ is selected
- Check all dependencies install correctly
- Review build logs

**CORS errors?**
- Add your domain to `ALLOWED_ORIGINS`
- Or set `ALLOWED_ORIGINS=*` for development (not recommended for production)

---

## Recommended: Railway

**Why Railway?**
- ✅ Free tier (500 hours/month)
- ✅ Auto-detects Node.js
- ✅ Automatic HTTPS
- ✅ Easy GitHub integration
- ✅ Simple environment variable management
- ✅ No configuration files needed

**Get started:** [railway.app](https://railway.app)
