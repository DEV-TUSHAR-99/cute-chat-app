# 📱 Mobile Se APK Banana (Termux + Android)

## 🎯 Phone se hi APK Build karna

---

## Method 1: Termux + Android SDK (Complete Build)

### Step 1: Termux Install karo
- **F-Droid se download karo:** https://f-droid.org/packages/com.termux/
- Ya Play Store se (old version)

### Step 2: Termux Setup
```bash
# Update
pkg update && pkg upgrade

# Required packages
pkg install git wget curl unzip openjdk-17 gradle

# Storage access
termux-setup-storage
```

### Step 3: Android SDK Install
```bash
# Create directory
mkdir -p $HOME/android-sdk
cd $HOME/android-sdk

# Download command line tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip

# Extract
unzip commandlinetools-linux-11076708_latest.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true

# Set environment
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Add to .bashrc
echo 'export ANDROID_HOME=$HOME/android-sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
```

### Step 4: SDK Components Install
```bash
# Accept licenses
yes | sdkmanager --licenses

# Install required SDK
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### Step 5: Project Create karo
```bash
# Create project folder
mkdir -p $HOME/CuteChat/app/src/main/java/com/cutechat/app
mkdir -p $HOME/CuteChat/app/src/main/res/layout
mkdir -p $HOME/CuteChat/app/src/main/res/values

# Create directories
cd $HOME/CuteChat
```

### Step 6: Files Create karo

**File 1: app/build.gradle**
```bash
cat > app/build.gradle << 'EOF'
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
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
}
EOF
```

**File 2: build.gradle (Project)**
```bash
cat > build.gradle << 'EOF'
plugins {
    id 'com.android.application' version '8.1.0' apply false
}
EOF
```

**File 3: settings.gradle**
```bash
cat > settings.gradle << 'EOF'
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "CuteChat"
include ':app'
EOF
```

**File 4: MainActivity.java**
```bash
cat > app/src/main/java/com/cutechat/app/MainActivity.java << 'EOF'
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
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        
        // 🔗 URL - Change this!
        webView.loadUrl("http://localhost:3000");
        
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
EOF
```

**File 5: activity_main.xml**
```bash
cat > app/src/main/res/layout/activity_main.xml << 'EOF'
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
EOF
```

**File 6: AndroidManifest.xml**
```bash
cat > app/src/main/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.cutechat.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:label="Cute Chat"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar"
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
EOF
```

**File 7: strings.xml**
```bash
mkdir -p app/src/main/res/values
cat > app/src/main/res/values/strings.xml << 'EOF'
<resources>
    <string name="app_name">Cute Chat</string>
</resources>
EOF
```

### Step 7: Gradle Wrapper Download
```bash
# Download gradle wrapper
wget https://raw.githubusercontent.com/gradle/gradle/master/gradlew
chmod +x gradlew

# Create gradle wrapper properties
mkdir -p gradle/wrapper
wget https://raw.githubusercontent.com/gradle/gradle/master/gradle/wrapper/gradle-wrapper.properties -O gradle/wrapper/gradle-wrapper.properties
wget https://services.gradle.org/distributions/gradle-8.0-bin.zip -O gradle/wrapper/gradle-8.0-bin.zip
```

### Step 8: Build APK
```bash
# Build debug APK
./gradlew assembleDebug

# APK location
ls app/build/outputs/apk/debug/

# Copy to storage
cp app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/
```

---

## Method 2: Online Tools (Easiest)

### Option A: WebIntoApp
1. Browser open karo: https://www.webintoapp.com
2. URL daalo: `http://152.58.17.16:3000`
3. Build karo
4. APK download karo

### Option B: AppsGeyser
1. https://appsgeyser.com pe jao
2. "Create App" click karo
3. "Website" select karo
4. URL daalo
5. APK download karo

---

## Method 3: AIDE (Android IDE App)

**AIDE App Install karo:**
- Play Store se: https://play.google.com/store/apps/details?id=com.aide.ui

**Steps:**
1. AIDE open karo
2. New Project → Android App
3. Files copy karo (Method 1 wale)
4. Build → Run

---

## Method 4: Sketchware (No Coding)

**Sketchware Pro Install:**
- https://github.com/Sketchware-Pro/Sketchware-Pro/releases

**Steps:**
1. New Project
2. WebView add karo
3. URL set karo
4. Export APK

---

## 🚀 Recommended: Method 2 (Online)

**Sabse easy:**
1. https://www.webintoapp.com
2. URL: `http://152.58.17.16:3000`
3. Build → Download

**Time:** 2-3 minutes
**No setup required!**

---

## ❓ Common Issues

**Issue:** `Out of memory`
**Fix:** `export GRADLE_OPTS="-Xmx1024m"`

**Issue:** `SDK not found`
**Fix:** Environment variables check karo

**Issue:** `Permission denied`
**Fix:** `chmod +x gradlew`
