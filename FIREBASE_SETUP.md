# 🔥 Firebase Setup for Vercel (100% FREE)

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Create a project"**
3. Enter project name: `cute-chat-app`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

---

## Step 2: Enable Realtime Database

1. In Firebase console, click **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. Choose **"Start in test mode"** (for now)
4. Click **"Enable"**

---

## Step 3: Get Firebase Config

1. Click **"Project settings"** (gear icon)
2. Go to **"General"** tab
3. Scroll to **"Your apps"** section
4. Click **"Web"** (</> icon)
5. Enter app nickname: `cute-chat`
6. Click **"Register app"**
7. Copy the config object

---

## Step 4: Update Config File

Edit `public/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "cute-chat-app-xxxxx.firebaseapp.com",
    databaseURL: "https://cute-chat-app-xxxxx-default-rtdb.firebaseio.com",
    projectId: "cute-chat-app-xxxxx",
    storageBucket: "cute-chat-app-xxxxx.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

---

## Step 5: Update HTML Files

### For index.html:
Replace:
```html
<script src="app.js"></script>
```

With:
```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
<script src="firebase-config.js"></script>
<script src="app-firebase.js"></script>
```

### For chat.html:
Replace:
```html
<script src="chat.js"></script>
```

With:
```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
<script src="firebase-config.js"></script>
<script src="chat-firebase.js"></script>
```

---

## Step 6: Deploy to Vercel

1. Push changes to GitHub
2. Go to https://vercel.com
3. Import your repo
4. Deploy!

---

## ✅ Done!

Everything runs on Vercel + Firebase (both FREE!)

**No backend server needed!** 🎉

---

## Security Rules (Important!)

After testing, update Firebase Database rules:

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": true,
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

Go to: Realtime Database → Rules tab

---

## Cost

- **Firebase Realtime Database**: 1GB free storage, 100k reads/day FREE
- **Vercel**: Unlimited static hosting FREE

**Total: $0 forever!** 💕
