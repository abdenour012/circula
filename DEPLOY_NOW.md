# 🚀 Deploy Your App Now - Step by Step

## ⚡ FASTEST WAY: Railway.app (5 minutes)

### What You Need:
1. A GitHub account (free)
2. An OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))
3. 5 minutes

### Steps:

#### 1. Push to GitHub (if not already done)

**Option A: Using GitHub Desktop (Easiest)**
1. Download [GitHub Desktop](https://desktop.github.com/)
2. File → Add Local Repository → Select `circula` folder
3. Click "Publish repository"
4. Done!

**Option B: Using Command Line**
```bash
cd circula
git init
git add .
git commit -m "Initial commit"
# Create repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

#### 2. Deploy on Railway

1. **Go to:** [railway.app](https://railway.app)
2. **Click:** "Start a New Project"
3. **Select:** "Deploy from GitHub repo"
4. **Authorize** Railway to access your GitHub
5. **Select** your repository
6. **Wait** 2-3 minutes for deployment

#### 3. Add Environment Variables

In Railway dashboard:
1. Click on your project
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Add these:

```
Name: OPENROUTER_API_KEY
Value: your_actual_api_key_here
```

```
Name: NODE_ENV
Value: production
```

5. Railway will automatically redeploy

#### 4. Get Your Live URL

Railway will show you a URL like:
```
https://your-app-name.railway.app
```

**🎉 Your app is LIVE!**

---

## 🔑 Getting API Keys

### OpenRouter (Recommended - Cheaper)
1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up (free)
3. Go to Keys section
4. Create new key
5. Copy and use in Railway

### OpenAI (Alternative)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/login
3. Go to API Keys
4. Create new key
5. Use in Railway as `OPENAI_API_KEY`

---

## ✅ Verify Deployment

1. Visit your Railway URL
2. You should see the onboarding screen
3. Complete setup
4. Try scanning a meal
5. Check browser console (F12) for any errors

---

## 🐛 Troubleshooting

**"API not working"**
- Check environment variables are set correctly
- Verify API key is valid
- Check Railway logs (click on your service → Logs)

**"Build failed"**
- Check Railway logs
- Ensure all files are committed to GitHub
- Verify `package.json` is correct

**"CORS errors"**
- Add your Railway URL to `ALLOWED_ORIGINS` in Railway variables
- Or set `ALLOWED_ORIGINS=*` (less secure, for testing)

---

## 📱 Your App URL

Once deployed, your app will be available at:
```
https://your-project-name.railway.app
```

Railway provides:
- ✅ Free HTTPS certificate
- ✅ Automatic deployments on git push
- ✅ Free tier (500 hours/month)
- ✅ Easy environment variable management
- ✅ Real-time logs

---

## 🎯 Next Steps After Deployment

1. **Test all features:**
   - Meal scanning
   - Barcode scanning
   - Fridge Chef (if Premium)
   - Exercise recommendations

2. **Share your link:**
   - Your app is now live and shareable!

3. **Monitor usage:**
   - Check Railway dashboard for logs
   - Monitor API usage in OpenRouter/OpenAI dashboard

---

**Need help?** Check Railway's documentation or logs in the dashboard.
