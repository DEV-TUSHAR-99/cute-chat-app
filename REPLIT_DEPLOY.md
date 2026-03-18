# 🚀 Deploy Cute Chat App on Replit

## Quick Steps

### 1. Create Replit Account
- Go to https://replit.com
- Sign up with Google/GitHub/email

### 2. Import from GitHub (Recommended)
1. Click **"Create"** button
2. Select **"Import from GitHub"**
3. Paste your repo URL: `https://github.com/EVIL-8956666509/cute-chat-app`
4. Click **"Import from GitHub"**

### 3. Configure Replit
The `.replit` and `replit.nix` files are already configured. Just:
1. Wait for packages to install
2. Click **"Run"** button

### 4. Get Live URL
- After running, Replit will give you a live URL like:
  `https://cute-chat-app.yourusername.repl.co`
- This URL works 24/7 (if you enable "Always On")

### 5. Enable Always On (Important!)
1. Go to **Tools** → **Shell**
2. Run: `kill 1` (to restart)
3. Click **"Deployments"** tab
4. Enable **"Always On"** (free for Replit Core members)

OR use **Deploy** button for production hosting.

---

## Manual Upload (if no GitHub)

1. Create new **Node.js** repl
2. Upload all files from `sapna/` folder
3. Run: `npm install`
4. Click **Run** button

---

## Files Included
- `server.js` - Main server with Socket.io
- `security.js` - Security module
- `public/` - Frontend files (HTML, CSS, JS)
- `.replit` - Replit configuration
- `replit.nix` - Nix packages config
- `package.json` - Dependencies

---

## Why Replit is Better than Vercel
✅ Socket.io works (real-time chat)  
✅ Free 24/7 hosting with "Always On"  
✅ Easy to manage and update  
✅ No cold start issues  

## Troubleshooting

### "Port already in use"
- Replit automatically sets PORT env variable
- Server uses `process.env.PORT || 3000`

### "Cannot find module"
- Run: `npm install` in Shell

### Rooms not persisting
- Rooms are stored in memory (expected)
- They expire after 24 hours or when empty

---

Happy Chatting! 💕
