# 💕 Cute Chat App

Ek secure, private 1-to-1 chat application jo Node.js aur Socket.io pe built hai.

## ✨ Features

- 🔒 **Secure Rooms** - Har room ke liye unique token
- 👥 **1-to-1 Only** - Sirf 2 users ek room mein
- 🚫 **Screenshot Protection** - Screen recording detection
- 💕 **Cute UI** - Beautiful pink theme
- ⚡ **Real-time** - Instant message delivery
- 🎨 **Customizable** - Easy to modify

## 🚀 Installation

### 💻 PC/Laptop Pe

```bash
# Dependencies install karo
npm install

# Server start karo
npm start

# Ya development mode mein
npm run dev
```

### 📱 Android (Termux) Pe

Termux app se phone pe bhi chala sakte ho!

#### Step 1: Termux Install Karo
1. [F-Droid](https://f-droid.org/packages/com.termux/) se Termux download karo
2. Termux open karo

#### Step 2: Dependencies Install Karo
```bash
# Package update karo
pkg update && pkg upgrade -y

# Node.js install karo
pkg install nodejs -y

# Git install karo
pkg install git -y
```

#### Step 3: Project Clone Karo
```bash
# Home directory mein jao
cd ~

# Repository clone karo
git clone https://github.com/EVIL-8956666509/cute-chat-app.git

# Project folder mein jao
cd cute-chat-app
```

#### Step 4: Server Start Karo
```bash
# Dependencies install karo
npm install

# Server start karo
npm start
```

#### Step 5: Phone Pe Access Karo
- Browser mein open karo: `http://localhost:3000`
- Ya same WiFi pe dusre device se: `http://<phone-ip>:3000`

#### Phone IP Check Karne Ke Liye:
```bash
ifconfig
```
Ya
```bash
ip addr show
```

**Note:** Phone ko same WiFi network pe hona chahiye dusre device ke saath.

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Real-time:** Socket.io
- **Frontend:** HTML5 + CSS3 + Vanilla JS
- **Security:** Crypto for token generation

## 📁 Project Structure

```
cute-chat-app/
├── server.js              # Main server file
├── security.js            # Security module (encryption, rate limiting, etc.)
├── package.json           # Dependencies
├── README.md              # Documentation
├── vercel.json            # Vercel deployment config
├── render.yaml            # Render deployment config
├── .env.example           # Environment variables template
├── public/                # Static files
│   ├── index.html         # Landing page
│   ├── chat.html          # Chat interface
│   ├── style.css          # Styles
│   ├── app.js             # Landing page logic
│   ├── chat.js            # Chat functionality
│   └── animations.js      # Animation system
└── android-app/           # Android WebView template
    ├── MainActivity.java
    ├── AndroidManifest.xml
    └── build.gradle
```

## 🔧 Environment Variables

`.env` file create karo (optional):

```env
PORT=3000
NODE_ENV=production
```

## 📱 APK Build Karna

Android app banane ke liye:

### Option 1: Android Studio
1. `android-app/` folder Android Studio mein open karo
2. `MainActivity.java` mein apna server URL daalo
3. Build → Generate Signed APK

### Option 2: Sketchware (Mobile)
1. Sketchware app install karo
2. WebView component add karo
3. Apna URL set karo
4. Export APK

## 🌐 Free Hosting Deployment (Production Setup)

Yeh project **completely free** par host kar sakte ho! 2 best options:

### Option 1: Vercel (RECOMMENDED ⭐)

Sabse easy! Auto-deploy from GitHub + free SSL + custom domain.

**Steps:**

1. **GitHub Account Banao** (agar nahi hai)
   - https://github.com/signup

2. **GitHub Repository Banao**
   ```bash
   cd /root/sapna
   git init
   git add .
   git commit -m "Initial commit - Cute Chat App"
   git branch -M main
   ```

3. **GitHub Pe Push Karo**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cute-chat-app.git
   git push -u origin main
   ```

4. **Vercel Pe Deploy Karo**
   - https://vercel.com/signup (GitHub se sign up karo)
   - "Import Project" → "Deploy"
   - Framework Preset: **Other**
   - Root Directory: `.` (default)
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Environment Variables ADD KARO:
     - `CHAT_ENCRYPTION_KEY` = (64 hex chars key)
     - `NODE_ENV` = `production`
   - Click "Deploy"

5. **Encryption Key Generate Karo** (agar nhi hai):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - Output copy karo → Vercel mein `CHAT_ENCRYPTION_KEY` variable mein paste karo

6. **Done!** Deployment complete!
   - ✅ Free URL: `https://cute-chat-app.vercel.app`
   - ✅ Free SSL Certificate
   - ✅ Auto-deploy from GitHub

7. **Custom Domain** (optional - FREE!)
   - Vercel Dashboard → Domains → Add Domain
   - Free subdomain: `your-app.vercel.app`
   - Ya apna domain buy karein

### Option 2: Render (Alternative)

**Steps:**

1. Code ko GitHub pe push karo (same as above)

2. Render pe jao: https://render.com

3. "New +" → "Web Service"

4. GitHub repository connect karo

5. Configuration:
   - Name: `cute-chat-app`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

6. Environment Variables:
   - `CHAT_ENCRYPTION_KEY` = (64 hex chars)
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render automatically sets PORT, but app reads it)

7. "Create Web Service" → Deploy start ho jayega

8. URL mil jayega: `https://cute-chat-app.onrender.com`

### ⚠️ Important Notes:

- **CHAT_ENCRYPTION_KEY zaroori hai!** Bina key messages encrypt nahi honge
- Key generate karo: `openssl rand -hex 32` ya `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Key **safe** rakho - kisi se share mat karo
- Messages encrypt karne ke liye key needed hai
- Agar key change karte ho, purane messages decrypt nahi ho sakte

### 🔒 Security Features (BOTH options):

- ✅ Rate limiting
- ✅ IP blocking
- ✅ Input validation & sanitization
- ✅ AES-256-GCM message encryption
- ✅ CSRF protection
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Structured logging
- ✅ Auto-cleanup of old data

### 🎯 Vercel vs Render:

| Feature | Vercel | Render |
|---------|--------|--------|
| Free Tier | ✅ Yes | ✅ Yes |
| Auto-Deploy | ✅ GitHub | ✅ GitHub |
| Free SSL | ✅ Yes | ✅ Yes |
| Free Subdomain | ✅ `.vercel.app` | ✅ `.onrender.com` |
| Cold Start | ❌ Never sleeps | ⏳ May sleep after 15 min |
| Custom Domain | ✅ Free | ✅ Free |
| Best For | ✅ **Always-on apps** | Good for APIs/Web |

**Suggestion:** Vercel use karo (better for chat app - no sleeping!)

---

## 🤝 Contributing

Contributions welcome hain! 

1. Fork karo
2. Branch banao (`git checkout -b feature/xyz`)
3. Changes karo
4. Push karo (`git push origin feature/xyz`)
5. Pull Request banao

## 📝 License

MIT License - Free to use and modify!

## 💝 Credits

Made with 💕 by EVIL-8956666509

---

**Happy Chatting!** 💬✨
