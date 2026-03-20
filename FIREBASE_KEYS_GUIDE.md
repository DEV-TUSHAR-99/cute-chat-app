# 🔑 Firebase Keys Kaha Se Lao

## Step-by-Step Guide

### Step 1: Firebase Console Open Karo
1. Browser mein jao: https://console.firebase.google.com
2. Google account se login karo

### Step 2: New Project Banao
1. **"Create a project"** click karo
2. Project name daalo: `cute-chat-app`
3. **"Continue"** click karo
4. Google Analytics **OFF** karo (optional)
5. **"Create project"** click karo

### Step 3: Realtime Database Enable Karo
1. Left side menu mein **"Build"** → **"Realtime Database"**
2. **"Create Database"** click karo
3. Location select karo (asia-southeast1 recommended)
4. **"Start in test mode"** select karo
5. **"Enable"** click karo

### Step 4: Keys Lene Ka Tarika

#### Method A: Project Settings Se
1. Top left mein **⚙️ Settings** (gear icon) click karo
2. **"Project settings"** select karo
3. **"General"** tab mein scroll down karo
4. **"Your apps"** section mein **"Web"** (</> icon) click karo
5. App nickname daalo: `cute-chat-web`
6. **"Register app"** click karo

#### Method B: Direct Config Copy
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxx",  // Yeh mil jayega
    authDomain: "cute-chat-app-xxxxx.firebaseapp.com",
    databaseURL: "https://cute-chat-app-xxxxx-default-rtdb.firebaseio.com",
    projectId: "cute-chat-app-xxxxx",
    storageBucket: "cute-chat-app-xxxxx.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789"
};
```

### Step 5: Config File Update Karo

`public/firebase-config.js` mein paste karo:

```javascript
const firebaseConfig = {
    apiKey: "YEH_YAHAN_SE_COPY_KARO",
    authDomain: "YEH_YAHAN_SE_COPY_KARO",
    databaseURL: "YEH_YAHAN_SE_COPY_KARO",
    projectId: "YEH_YAHAN_SE_COPY_KARO",
    storageBucket: "YEH_YAHAN_SE_COPY_KARO",
    messagingSenderId: "YEH_YAHAN_SE_COPY_KARO",
    appId: "YEH_YAHAN_SE_COPY_KARO"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
```

---

## 📸 Screenshot Steps

```
Firebase Console
    ↓
⚙️ Project Settings
    ↓
General Tab
    ↓
Your Apps Section
    ↓
Web App (</>)
    ↓
Config Copy Karo!
```

---

## ⚠️ Important

- **API Key** public hoti hai - koi problem nahi
- **Database rules** test mode mein rakho for now
- Baad mein security rules update kar lena

---

## 🆓 Free Hai!

Firebase Realtime Database:
- ✅ 1GB storage free
- ✅ 100,000 reads/day free
- ✅ 100,000 writes/day free

Vercel:
- ✅ Unlimited static hosting free

**Total cost: ₹0** 💕
