# 📱 VS Code Se Android App Build Karna

## 🎯 Android Studio ke bina APK Build

---

## Method 1: VS Code + Android SDK (Recommended)

### Step 1: Android SDK Download karo (Without Android Studio)

**Windows:**
1. Download: https://developer.android.com/studio#command-tools
2. Extract karo `C:\Android\cmdline-tools`
3. Rename folder: `cmdline-tools → latest`
4. Environment variables add karo:
```
ANDROID_HOME = C:\Android
PATH add: %ANDROID_HOME%\cmdline-tools\latest\bin
PATH add: %ANDROID_HOME%\platform-tools
```

**Linux/Mac:**
```bash
# Download
mkdir -p ~/Android/cmdline-tools
cd ~/Android/cmdline-tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mv cmdline-tools latest

# Environment setup
echo 'export ANDROID_HOME=$HOME/Android' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc
```

---

### Step 2: SDK Components Install karo

```bash
# Accept licenses
sdkmanager --licenses

# Install required components
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

---

### Step 3: VS Code Setup karo

**Extensions Install karo:**
1. **Android** by adelphes
2. **Android iOS Emulator** by DiemasMichiels
3. **Gradle for Java** by Microsoft

---

### Step 4: Project Structure Create karo

**VS Code mein new folder:** `CuteChat`

```
CuteChat/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── cutechat/
│   │       │           └── app/
│   │       │               └── MainActivity.java
│   │       └── res/
│   │           ├── layout/
│   │           │   └── activity_main.xml
│   │           ├── values/
│   │           │   ├── colors.xml
│   │           │   ├── strings.xml
│   │           │   └── themes.xml
│   │           └── mipmap-xxxhdpi/
│   │               └── ic_launcher.png
│   └── build.gradle
├── build.gradle
├── settings.gradle
├── gradle.properties
└── gradlew
```

---

### Step 5: Files Create karo

**1. app/build.gradle**
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

**2. build.gradle (Project level)**
```gradle
// Top-level build file
plugins {
    id 'com.android.application' version '8.1.0' apply false
}
```

**3. settings.gradle**
```gradle
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
```

**4. gradle.properties**
```properties
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
```

**5. MainActivity.java**
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
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        
        // 🔗 URL UPDATE KARO
        webView.loadUrl("http://YOUR_IP:3000");
        
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

**6. activity_main.xml**
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

**7. AndroidManifest.xml**
```xml
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
```

**8. res/values/colors.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="purple_200">#FFBB86FC</color>
    <color name="purple_500">#FF6200EE</color>
    <color name="purple_700">#FF3700B3</color>
    <color name="teal_200">#FF03DAC5</color>
    <color name="teal_700">#FF018786</color>
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
</resources>
```

**9. res/values/strings.xml**
```xml
<resources>
    <string name="app_name">Cute Chat</string>
</resources>
```

**10. res/values/themes.xml**
```xml
<resources>
    <style name="Theme.CuteChat" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="colorPrimary">@color/purple_500</item>
        <item name="colorPrimaryVariant">@color/purple_700</item>
        <item name="colorOnPrimary">@color/white</item>
    </style>
</resources>
```

---

### Step 6: Gradle Wrapper Setup

**gradlew download karo:**

```bash
# VS Code terminal mein:
cd CuteChat

# Gradle wrapper create karo
gradle wrapper --gradle-version 8.0

# Ya manually download:
# https://services.gradle.org/distributions/gradle-8.0-bin.zip
```

---

### Step 7: APK Build karo (VS Code Terminal)

**Debug APK:**
```bash
./gradlew assembleDebug
```

**Release APK:**
```bash
./gradlew assembleRelease
```

**APK Location:**
- Debug: `app/build/outputs/apk/debug/app-debug.apk`
- Release: `app/build/outputs/apk/release/app-release-unsigned.apk`

---

### Step 8: Sign the APK (Release ke liye)

```bash
# Keystore create karo
keytool -genkey -v -keystore cutechat.keystore -alias cutechat -keyalg RSA -keysize 2048 -validity 10000

# APK sign karo
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore cutechat.keystore app/build/outputs/apk/release/app-release-unsigned.apk cutechat

# Verify
jarsigner -verify app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## Method 2: VS Code on Android Phone (Acode/Spck Editor)

**Apps:**
1. **Acode** - Code editor for Android
2. **Spck Editor** - Git + Code editor
3. **Termux** - Terminal for Android

**Process:**
1. Code edit karo Acode/Spck mein
2. Termux mein build karo
3. APK install karo

**But ye complex hai, Method 1 better hai!**

---

## Method 3: Online Build (Easiest - No VS Code needed)

**Website:** https://www.webintoapp.com

**Steps:**
1. URL daalo: `http://YOUR_IP:3000`
2. Build karo
3. APK download karo

---

## ❓ Common Issues

**Issue:** `gradle command not found`
**Fix:** Gradle install karo: https://gradle.org/install/

**Issue:** `JAVA_HOME not set`
**Fix:** JDK install karo: https://adoptium.net/

**Issue:** `SDK not found`
**Fix:** ANDROID_HOME environment variable set karo

---

## 🚀 Quick Commands

```bash
# Build debug
./gradlew assembleDebug

# Build release
./gradlew assembleRelease

# Clean
./gradlew clean

# Install on connected device
./gradlew installDebug
```
