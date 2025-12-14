# ⚡ QUICK DEPLOY - 3 Steps

## 🎯 Goal: Get your app live in 5 minutes

### Step 1: Get API Key (2 min)
1. Go to [openrouter.ai](https://openrouter.ai) and sign up
2. Create an API key
3. Copy it

### Step 2: Push to GitHub (1 min)
1. Create a new repo on [github.com](https://github.com)
2. Upload your `circula` folder
   - Or use GitHub Desktop
   - Or use: `git init && git add . && git commit -m "deploy" && git push`

### Step 3: Deploy on Railway (2 min)
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo
4. Add variable: `OPENROUTER_API_KEY` = your key
5. Add variable: `NODE_ENV` = `production`
6. Wait 2 minutes
7. **DONE!** 🎉

**Your app URL:** Railway will show it in the dashboard

---

## 🔗 Direct Links

- **Railway:** https://railway.app
- **OpenRouter:** https://openrouter.ai
- **GitHub:** https://github.com

---

## 💡 Pro Tips

- Railway auto-deploys on every git push
- Free tier includes 500 hours/month
- HTTPS is automatic
- Check logs in Railway dashboard if something breaks

---

**That's it! Your nutrition app is now live on the internet! 🌐**
