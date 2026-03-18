# 🚀 Vercel Deployment Guide

## Problem
Vercel is **serverless** - Socket.io (real-time chat) doesn't work properly on serverless functions because they don't maintain persistent connections.

## Solution: Separate Frontend & Backend

### Step 1: Deploy Backend (Render/Replit/Railway)

**Option A: Render (Free)** ⭐ Recommended
1. Go to https://render.com
2. Click "New Web Service"
3. Connect your GitHub repo: `DEV-TUSHAR-99/cute-chat-app`
4. Settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment: `PORT=10000`
5. Get your URL: `https://cute-chat-app.onrender.com`

**Option B: Replit (Free)**
1. Import from GitHub
2. Click "Run"
3. Get URL: `https://cute-chat-app.username.repl.co`

---

### Step 2: Update Frontend Config

Edit `public/config.js`:

```javascript
const CONFIG = {
    SERVER_URL: 'https://YOUR-BACKEND-URL.com'  // <-- Your backend URL
};
```

---

### Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Import your GitHub repo
3. Settings:
   - Framework Preset: **Other**
   - Build Command: (leave empty)
   - Output Directory: `public`
4. Deploy!

---

## Architecture

```
┌─────────────┐         WebSocket         ┌─────────────┐
│   Vercel    │  ◄────────────────────►  │   Render    │
│  (Frontend) │    Real-time messages     │  (Backend)  │
│  Static HTML │                           │  Socket.io  │
└─────────────┘                           └─────────────┘
     https://cute-chat-app.vercel.app      https://cute-chat-app.onrender.com
```

---

## Quick Setup Checklist

- [ ] Deploy backend to Render/Replit
- [ ] Copy backend URL
- [ ] Update `config.js` with backend URL
- [ ] Push changes to GitHub
- [ ] Deploy frontend to Vercel
- [ ] Test creating a room!

---

## Troubleshooting

### "Cannot connect to server"
- Check `config.js` has correct backend URL
- Make sure backend is running
- Check CORS settings in `server.js`

### "Room not found"
- Backend and frontend must use same server
- Rooms are stored in memory (lost on server restart)

---

## Alternative: Use Firebase (Everything on Vercel)

If you want everything on Vercel without separate backend, I can set up Firebase Realtime Database instead of Socket.io.

Just ask! 💕
