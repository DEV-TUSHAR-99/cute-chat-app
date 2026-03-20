# 🚀 Deploy to Vercel.com (Step by Step)

## Method 1: GitHub Import (Easiest)

### Step 1: Go to Vercel
1. Open https://vercel.com
2. Login with GitHub
3. Click **"Add New..."** → **"Project"**

### Step 2: Import Repo
1. Find your repo: `DEV-TUSHAR-99/cute-chat-app`
2. Click **"Import"**

### Step 3: Configure Settings
```
Framework Preset: Other
Build Command: (empty)
Output Directory: public
Install Command: (empty)
```

### Step 4: Environment Variables (Optional)
If using backend:
- Click **"Environment Variables"**
- Add: `SERVER_URL=https://your-backend.com`

### Step 5: Deploy
Click **"Deploy"** 🎉

---

## Method 2: Using Vercel CLI

### Install CLI
```bash
npm i -g vercel
```

### Login
```bash
vercel login
```

### Deploy
```bash
cd /root/sapna
vercel --prod
```

---

## 🔥 For 100% Vercel (No Backend)

Use Firebase version:

1. **Rename files:**
   ```bash
   mv public/index.html public/index-old.html
   mv public/index-firebase.html public/index.html
   mv public/chat.html public/chat-old.html
   mv public/chat-firebase.html public/chat.html
   ```

2. **Setup Firebase:**
   - Go to https://console.firebase.google.com
   - Create project
   - Get config
   - Update `public/firebase-config.js`

3. **Deploy to Vercel**

---

## ✅ After Deploy

Your app will be at:
`https://cute-chat-app.vercel.app`

---

## 🔄 Update Deploy

After making changes:
```bash
git add -A
git commit -m "Update"
git push origin main
```

Vercel auto-deploys on every push! 🎉
