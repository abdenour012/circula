# 📋 EXACT STEP-BY-STEP DEPLOYMENT GUIDE

Follow these steps **exactly** in order. This will take about 10-15 minutes.

---

## ✅ STEP 1: Get Your API Key (3 minutes)

### Option A: OpenRouter (Recommended - Cheaper)

1. **Open your browser** and go to: **https://openrouter.ai**
2. **Click** "Sign Up" (top right)
3. **Sign up** with Google/GitHub or email
4. **After logging in**, click on **"Keys"** in the left sidebar
5. **Click** "Create Key" button
6. **Give it a name** (like "Circula App")
7. **Click** "Create"
8. **COPY the key** - it looks like: `sk-or-v1-abc123...`
   - ⚠️ **IMPORTANT:** Copy this NOW - you won't see it again!
   - Paste it in a text file temporarily

**✅ Done with Step 1!** You now have an API key.

---

## ✅ STEP 2: Push Code to GitHub (5 minutes)

### Option A: Using GitHub Desktop (EASIEST)

1. **Download GitHub Desktop:**
   - Go to: **https://desktop.github.com**
   - Download and install it
   - Sign in with your GitHub account (or create one at github.com)

2. **Add Your Project:**
   - Open GitHub Desktop
   - Click **"File"** → **"Add Local Repository"**
   - Click **"Choose..."**
   - Navigate to: `F:\100,000 dtn challenge\3IM2\Application de nutrition\circula`
   - Click **"Select Folder"**
   - Click **"Add Repository"**

3. **Commit and Push:**
   - At the bottom, type: `Initial commit - Circula app`
   - Click **"Commit to main"**
   - Click **"Publish repository"** (top right)
   - **Uncheck** "Keep this code private" if you want it public
   - Click **"Publish Repository"**

**✅ Done!** Your code is now on GitHub.

### Option B: Using Command Line (If you have Git installed)

1. **Open PowerShell** in the circula folder:
   ```
   cd "F:\100,000 dtn challenge\3IM2\Application de nutrition\circula"
   ```

2. **Initialize Git:**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit - Circula app"
   ```

3. **Create GitHub Repo:**
   - Go to **https://github.com/new**
   - Name it: `circula-nutrition-app`
   - Click **"Create repository"**

4. **Push to GitHub:**
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/circula-nutrition-app.git
   git branch -M main
   git push -u origin main
   ```
   (Replace YOUR_USERNAME with your GitHub username)

**✅ Done!** Your code is now on GitHub.

---

## ✅ STEP 3: Deploy on Railway (5 minutes)

1. **Go to Railway:**
   - Open browser: **https://railway.app**
   - Click **"Login"** (top right)
   - Click **"Login with GitHub"**
   - **Authorize** Railway to access your GitHub

2. **Create New Project:**
   - Click **"New Project"** button (big blue button)
   - Click **"Deploy from GitHub repo"**
   - You'll see your repositories
   - **Click on your `circula-nutrition-app` repository**

3. **Wait for Deployment:**
   - Railway will automatically:
     - Detect it's a Node.js app
     - Install dependencies
     - Build the app
   - This takes **2-3 minutes**
   - You'll see logs scrolling

4. **Add Environment Variables:**
   - Once deployment starts, click on your **project name**
   - Click on the **service** (the box that appeared)
   - Click the **"Variables"** tab
   - Click **"New Variable"** button
   
   **Add First Variable:**
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** (paste your API key from Step 1)
   - Click **"Add"**
   
   **Add Second Variable:**
   - Click **"New Variable"** again
   - **Name:** `NODE_ENV`
   - **Value:** `production`
   - Click **"Add"**

5. **Get Your URL:**
   - Railway will automatically redeploy with the new variables
   - Wait 1-2 minutes
   - Click the **"Settings"** tab
   - Scroll down to **"Domains"**
   - You'll see a URL like: `https://circula-production-xxxx.up.railway.app`
   - **OR** click the **"Deployments"** tab and click the top deployment
   - You'll see a **"View"** button with your URL

**✅ DONE!** Your app is now live!

---

## 🎉 STEP 4: Test Your App

1. **Open the URL** Railway gave you
2. **You should see:**
   - The Circula onboarding screen
   - White background, black text
3. **Complete onboarding:**
   - Enter your age, weight, height, etc.
   - Set your goal
4. **Test features:**
   - Try scanning a meal
   - Check if everything works

---

## 🐛 If Something Goes Wrong

### Build Failed?
- **Check Railway logs:**
  - Click on your service
  - Click "Deployments" tab
  - Click on the failed deployment
  - Read the error message
- **Common fixes:**
  - Make sure all files are committed to GitHub
  - Check that `package.json` exists

### API Not Working?
- **Check environment variables:**
  - Go to Variables tab
  - Make sure `OPENROUTER_API_KEY` is set correctly
  - Make sure there are no extra spaces
- **Check API key:**
  - Go to openrouter.ai
  - Verify your key is active
  - Try creating a new key if needed

### App Loads But Shows Errors?
- **Open browser console:**
  - Press F12
  - Click "Console" tab
  - Look for red errors
- **Check Railway logs:**
  - Click on your service → Logs tab
  - Look for error messages

---

## 📝 Summary Checklist

- [ ] Got API key from openrouter.ai
- [ ] Pushed code to GitHub
- [ ] Created Railway account
- [ ] Deployed from GitHub on Railway
- [ ] Added `OPENROUTER_API_KEY` variable
- [ ] Added `NODE_ENV=production` variable
- [ ] Got the live URL from Railway
- [ ] Tested the app in browser

---

## 🎯 Your Live URL

After completing all steps, Railway will give you a URL like:

```
https://circula-production-xxxx.up.railway.app
```

**This is your live app!** Share it with anyone.

---

## 💡 Pro Tips

1. **Railway auto-deploys** - Every time you push to GitHub, Railway will redeploy automatically
2. **Check logs** - Railway dashboard shows real-time logs
3. **Free tier** - Railway gives 500 hours/month free
4. **Custom domain** - You can add your own domain later in Railway settings

---

**That's it! Follow these steps exactly and your app will be live! 🚀**
