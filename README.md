# Circula - AI-Powered Nutrition Tracking App

A modern nutrition tracking application with AI-powered food scanning, meal planning, and fitness recommendations.

## ✨ Features

- 📸 **AI Food Scanning** - Scan meals with your camera for instant nutritional analysis
- 🏷️ **Barcode Scanning** - Quick scan of product barcodes
- 🍳 **Fridge Chef** (Premium) - Scan your fridge and get AI-generated recipes
- 📊 **Nutrition Tracking** - Track calories, macros, and micronutrients
- 💪 **Exercise Recommendations** - Personalized workouts based on your calorie intake
- 💧 **Hydration Tracking** - Monitor daily water intake
- ⏰ **Fasting Timer** - Intermittent fasting support with smart sync (Premium)
- 📈 **Trends & Analytics** - Weekly nutrition trends and progress charts
- ⭐ **Favorites** - Save your favorite meals for quick access
- 🔄 **Undo Functionality** - Easily undo meal confirmations
- ⚖️ **Weight Tracking** - Track weight changes and auto-adjust targets

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development servers (frontend + API)
npm run dev

# Or run separately:
npm run dev:ui    # Frontend only (port 5173)
npm run dev:api   # API only (port 8787)
```

### Production Build

```bash
# Build frontend
npm run build

# Start production server
npm run start
```

## 🌐 Deployment

### Easiest: Railway.app (Recommended)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Add environment variables:
   - `OPENROUTER_API_KEY` (or `OPENAI_API_KEY`)
   - `NODE_ENV=production`
5. Your app is live! 🎉

See [DEPLOY_INSTRUCTIONS.md](./DEPLOY_INSTRUCTIONS.md) for detailed steps.

### Other Options

- **Render.com** - Similar to Railway, easy deployment
- **Vercel** - Great for frontend, requires serverless functions for API
- **Fly.io** - Full Node.js hosting

## 🔧 Environment Variables

Create a `.env` file:

```env
# Required (choose one):
OPENROUTER_API_KEY=your_key
# OR
OPENAI_API_KEY=your_key

# Optional:
AI_PROVIDER=openrouter  # or 'openai'
NODE_ENV=development
PORT=8787
ALLOWED_ORIGINS=http://localhost:5173
```

## 📱 Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend:** Express.js + Node.js
- **AI:** OpenAI / OpenRouter (Grok 4.1 Fast)
- **Storage:** localStorage (client-side)
- **Icons:** Lucide React

## 🎯 Features by Tier

### Free (Core)
- Basic meal scanning
- Macro tracking
- Hydration tracking
- Manual fasting timer
- Exercise recommendations

### Premium (PRO)
- Micronutrient tracking
- Dynamic meal/workout plan adjustments
- Smart fasting sync
- Fridge Chef recipe generation
- Detailed portion breakdowns

## 📖 Documentation

- [Deployment Guide](./DEPLOY_INSTRUCTIONS.md)
- [Features Added](./FEATURES_ADDED.md)
- [Missing Features Analysis](./MISSING_FEATURES_ANALYSIS.md)
- [Comprehensive Analysis](./COMPREHENSIVE_ANALYSIS.md)

## 🧪 Testing

```bash
npm test              # Run tests
npm run test:ui      # Test UI
npm run test:coverage # Coverage report
```

## 📝 License

Private project

---

**Built with ❤️ for better nutrition tracking**
