# 📋 Pre-Deployment Checklist for NAMECARD.MY

## ✅ Before Building APK

### 1. Environment Setup
- [ ] Expo account created at https://expo.dev
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged in: `eas login`

### 2. App Configuration
- [ ] App name correct in `app.json`
- [ ] Version number updated in `app.json`
- [ ] Package name set: `com.namecardmy.app`
- [ ] Icons and splash screens in place
- [ ] Permissions configured correctly

### 3. API Keys & Environment
- [ ] Supabase credentials configured
- [ ] Google Vision API key set
- [ ] All environment variables in `.env`

### 4. Testing
- [ ] App runs without errors: `npx expo start`
- [ ] Authentication working (login/register)
- [ ] Camera/scanning functionality tested
- [ ] Contact saving to Supabase works

## 🚀 Deployment Steps

### Step 1: Initialize EAS (First Time Only)
```bash
cd NamecardMobile
eas build:configure
```

### Step 2: Build APK

#### Option A: Quick Cloud Build (Recommended)
```bash
# For production APK
eas build --platform android --profile production

# For testing APK
eas build --platform android --profile preview
```

#### Option B: Using Scripts
1. Double-click `deploy-cloud.bat`
2. Choose option 3 for Production APK
3. Wait for build to complete

#### Option C: Manual Command
```bash
eas build -p android --profile production
```

### Step 3: Download APK
1. Go to https://expo.dev
2. Navigate to your project
3. Click on the completed build
4. Download the APK file

## 📱 APK Build Profiles

### Development APK
- **Use for**: Testing on your device
- **Features**: Debug mode, development tools
- **Command**: `eas build -p android --profile development`

### Preview APK
- **Use for**: Internal testing, beta testers
- **Features**: Release build, testing features
- **Command**: `eas build -p android --profile preview`

### Production APK
- **Use for**: Final distribution, Play Store
- **Features**: Optimized, minified, signed
- **Command**: `eas build -p android --profile production`

## 🔧 Configuration Files

### eas.json
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"  ✅ APK configured
      }
    }
  }
}
```

### app.json
```json
{
  "android": {
    "buildType": "apk",  ✅ APK configured
    "package": "com.namecardmy.app",
    "versionCode": 1
  }
}
```

## 📊 Build Information

### APK Details
- **Package**: com.namecardmy.app
- **Version**: 1.0.0
- **Min SDK**: 21 (Android 5.0+)
- **Target SDK**: 33 (Android 13)
- **Build Type**: APK (not AAB)

### Permissions Required
- Camera (business card scanning)
- Storage (saving images)
- Microphone (voice notes)

## 🎯 Quick Commands

```bash
# Login to Expo
eas login

# Configure build
eas build:configure

# Build production APK
eas build -p android --profile production

# Build development APK
eas build -p android --profile development

# Check build status
eas build:list

# Download APK
eas build:download
```

## ⚠️ Common Issues & Solutions

### "Project not configured"
```bash
eas build:configure
```

### "Not logged in"
```bash
eas login
```

### "Build failed"
- Check logs at expo.dev
- Verify all dependencies installed
- Run `npm install` and try again

### "APK too large"
- Enable ProGuard in production
- Optimize images
- Remove unused dependencies

## 📝 Post-Build

### Testing APK
1. Download APK from Expo dashboard
2. Transfer to Android device
3. Enable "Install from unknown sources"
4. Install and test all features

### Distribution Options
1. **Direct**: Share APK file directly
2. **Play Store**: Upload to Google Play Console
3. **Website**: Host APK on your website
4. **Beta Testing**: Use Google Play Beta or TestFlight

## ✨ Your APK is Ready!

Once built, your APK will include:
- ✅ Professional splash screen with logo
- ✅ Authentication system
- ✅ Business card scanning
- ✅ Contact management
- ✅ Supabase integration
- ✅ WhatsApp integration
- ✅ All configured permissions

The APK can be installed on any Android device (5.0+) and distributed as needed!