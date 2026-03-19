# 🚀 FREE Deployment Guide (Render + Vercel)

## Step 1: Deploy Backend to Render (FREE)

1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New Web Service"**
4. Connect repo: `DEV-TUSHAR-99/cute-chat-app`
5. Settings:
   - **Name:** cute-chat-app
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
6. Click **"Create Web Service"**
7. Wait 2-3 minutes for deploy
8. Copy your URL: `https://cute-chat-app.onrender.com`

---

## Step 2: Update Config

Edit `public/config.js`:
```javascript
const CONFIG = {
    SERVER_URL: 'https://cute-chat-app.onrender.com'  // Your Render URL
};
```

---

## Step 3: Deploy Frontend to Vercel (FREE)

1. Go to https://vercel.com
2. Import GitHub repo
3. Settings:
   - **Framework Preset:** Other
   - **Output Directory:** `public`
4. Deploy!

---

## ✅ Done!

- Frontend: `https://cute-chat-app.vercel.app` (FREE)
- Backend: `https://cute-chat-app.onrender.com` (FREE)

Both free forever! 💕

---

## Alternative Free Backends

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Render** | ✅ Forever | Best option, no sleep |
| **Railway** | ✅ $5 credit | Good but limited |
| **Replit** | ✅ Always On | Need Core for 24/7 |
| **Fly.io** | ✅ $5 credit | Complex setup |

**Render is best for beginners!** 🌟
