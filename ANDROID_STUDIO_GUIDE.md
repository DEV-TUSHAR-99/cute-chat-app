# 📱 Android Studio Se APK Build Karna

## 🎯 Complete Guide

---

## Step 1: Android Studio Install karo

### Windows:
1. Download: https://developer.android.com/studio
2. Install karo
3. SDK components install honge

### Mac:
```bash
brew install --cask android-studio
```

### Linux:
```bash
sudo snap install android-studio --classic
```

---

## Step 2: New Project Create karo

1. **Android Studio open karo**
2. **"New Project" click karo**
3. **"Empty Views Activity" select karo**
4. **Fill karo:**
   - **Name:** CuteChat
   - **Package name:** com.cutechat.app
   - **Language:** Java
   - **Minimum SDK:** API 24 (Android 7.0)
   - **Finish**

---

## Step 3: Files Replace karo

### 📁 Project Structure:
```
app/
├── src/main/java/com/cutechat/app/
│   └── MainActivity.java      ← Replace
├── src/main/res/layout/
│   └── activity_main.xml      ← Replace
├── src/main/
│   └── AndroidManifest.xml    ← Replace
└── build.gradle               ← Replace
```

### 🔧 Files Copy karo:

**1. MainActivity.java**
```java
package com.cutechat.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.WindowManager;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    WebView webView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 🔒 SCREENSHOT BLOCK
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE
        );
        
        setContentView(R.layout.activity_main);
        
        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        
        // Enable JavaScript
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        
        // 🔗 URL daalo
        // Option 1: Local server (same network)
        webView.loadUrl("http://YOUR_PC_IP:3000");
        
        // Option 2: Ngrok tunnel
        // webView.loadUrl("https://xxxx.ngrok.io");
        
        // Option 3: Hosted URL
        // webView.loadUrl("https://yourdomain.com");
        
        webView.setWebViewClient(new WebViewClient());
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
```

**2. activity_main.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#fff5f5">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</RelativeLayout>
```

**3. AndroidManifest.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.cutechat.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:label="Cute Chat"
        android:theme="@style/Theme.CuteChat"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

**4. app/build.gradle**
```gradle
plugins {
    id 'com.android.application'
}

android {
    namespace 'com.cutechat.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.cutechat.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
}
```

---

## Step 4: URL Update karo

**MainActivity.java mein URL change karo:**

### Option A: Same WiFi (Local)
```java
webView.loadUrl("http://192.168.1.100:3000");
```
*PC ka IP check karo: `ipconfig` (Windows) ya `ifconfig` (Linux/Mac)*

### Option B: Ngrok (Public)
```java
webView.loadUrl("https://xxxx.ngrok.io");
```

### Option C: Hosted Server
```java
webView.loadUrl("https://yourdomain.com");
```

---

## Step 5: APK Build karo

### Debug APK:
1. **Menu → Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. APK location: `app/build/outputs/apk/debug/app-debug.apk`

### Release APK (Signed):
1. **Menu → Build → Generate Signed Bundle / APK**
2. **APK select karo**
3. **Create new keystore:**
   - Path: `cutechat.keystore`
   - Password: `cutechat123`
   - Alias: `cutechat`
   - Validity: 25 years
4. **Next → Release → Finish**
5. APK location: `app/release/app-release.apk`

---

## Step 6: Phone pe Install karo

1. **APK copy karo phone mein**
2. **Settings → Security → Unknown Sources ON karo**
3. **APK install karo**
4. **Enjoy! 🎉**

---

## 🔒 Screenshot Protection

**Already added in MainActivity.java:**
```java
getWindow().setFlags(
    WindowManager.LayoutParams.FLAG_SECURE,
    WindowManager.LayoutParams.FLAG_SECURE
);
```

**Result:**
- ❌ Screenshots blocked
- ❌ Screen recording blocked
- ❌ Recent apps mein blur hoga

---

## 🎨 App Icon Change karo

1. **Right-click `res` folder → New → Image Asset**
2. **Icon type:** Launcher Icons
3. **Asset:** Image ya Text select karo
4. **Finish**

---

## 🚀 Quick Checklist

- [ ] Android Studio installed
- [ ] New project created
- [ ] Files replaced
- [ ] URL updated
- [ ] APK built
- [ ] Installed on phone
- [ ] Working! ✅

---

## ❓ Common Issues

**Issue:** `Cleartext HTTP traffic not permitted`
**Fix:** AndroidManifest.xml mein `android:usesCleartextTraffic="true"` add karo ✅

**Issue:** `WebView not loading`
**Fix:** Internet permission add karo ✅

**Issue:** `Screenshot still working`
**Fix:** FLAG_SECURE onCreate ke BAAD setContentView ke PEHLE daalo ✅
