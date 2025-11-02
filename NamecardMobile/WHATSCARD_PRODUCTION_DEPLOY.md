# WhatsCard 1.0.0 Production Deployment Guide

## 📱 App Information

- **App Name**: WhatsCard
- **Version**: 1.0.0
- **Bundle ID (iOS)**: com.whatscard.app
- **Package Name (Android)**: com.whatscard.app
- **Expo Project ID**: 66d97936-e847-4b80-a6c7-bf90ea4a0d80

## ✅ Pre-Deployment Checklist

- [x] App rebranded from NAMECARD.MY to WhatsCard
- [x] Version set to 1.0.0
- [x] Bundle identifiers updated
- [x] App configuration updated (app.json, app.config.js, package.json)
- [x] Source code references updated
- [x] Documentation updated (README, CLAUDE.md)
- [ ] Logo assets prepared (see Logo Assets section below)
- [ ] Environment variables configured
- [ ] EAS account set up
- [ ] Apple Developer account ready (for iOS)
- [ ] Google Play Console ready (for Android)

## 🎨 Logo Assets Required

You need to create the following assets from the WhatsCard green background logo:

### Required Sizes:
1. **App Icon (icon.png)**: 1024x1024px
   - Location: `NamecardMobile/assets/icon/icon.png`
   - Format: PNG with transparency

2. **Adaptive Icon (adaptive-icon.png)**: 1024x1024px
   - Location: `NamecardMobile/assets/adaptive-icon.png`
   - Format: PNG with transparency
   - Note: Safe area is centered 512x512px circle

3. **Splash Screen (splash.png)**: 1284x2778px (iPhone 13 Pro Max resolution)
   - Location: `NamecardMobile/assets/splash/splash.png`
   - Format: PNG
   - Background color: #4A7A5C (WhatsCard green)

4. **Favicon (favicon.png)**: 48x48px
   - Location: `NamecardMobile/assets/favicon.png`
   - Format: PNG

### Quick Asset Generation:
You can use online tools like:
- [Expo Asset Generator](https://www.appicon.co/)
- [App Icon Resizer](https://appicon.co/)
- Or Adobe Photoshop/Figma to manually create the assets

Simply upload the WhatsCard logo and export to the required sizes.

## 📋 Step-by-Step Deployment

### 1. Set Up Environment Variables

Create a production `.env.production` file (if not already present):

```bash
cd NamecardMobile
```

Ensure `.env.production` contains:
```env
APP_ENV=production
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_anon_key
GEMINI_API_KEY=your_production_gemini_key
OPENAI_API_KEY=your_production_openai_key
DEBUG_MODE=false
```

### 2. Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

### 3. Log in to Expo

```bash
eas login
```

Use your Expo account credentials (username: jacobai).

### 4. Configure EAS Project

```bash
eas build:configure
```

This will link your project to the Expo account.

### 5. Build for Android (Production)

```bash
eas build --platform android --profile production
```

This will:
- Create an Android App Bundle (.aab)
- Upload to Expo servers
- Provide a download link when complete

**Note**: You'll need to:
1. Set up Android keystore (EAS can auto-generate on first build)
2. Accept the keystore generation prompt

### 6. Build for iOS (Production)

```bash
eas build --platform ios --profile production
```

This will:
- Create an iOS App Archive (.ipa)
- Upload to Expo servers
- Provide a download link when complete

**Note**: You'll need:
1. Apple Developer account ($99/year)
2. Apple Team ID
3. EAS will guide you through certificate setup

### 7. Submit to App Stores

#### Android (Google Play Store)

```bash
eas submit --platform android --latest
```

Or manually:
1. Download the .aab file from EAS
2. Go to [Google Play Console](https://play.google.com/console)
3. Create new app: "WhatsCard"
4. Upload the .aab file
5. Fill in app listing details
6. Submit for review

#### iOS (Apple App Store)

```bash
eas submit --platform ios --latest
```

Or manually:
1. Download the .ipa file from EAS
2. Use Application Loader or Xcode
3. Upload to App Store Connect
4. Fill in app metadata
5. Submit for review

## 🚀 Vercel Deployment for Update Tracking

To deploy the project metadata to Vercel:

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project root
cd "C:\Users\walte\OneDrive\Desktop\Claude CODE\NAMECARD.MY 1.0.0"

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: "Other"
   - Root Directory: `./`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
5. Click "Deploy"

The Vercel deployment will track:
- Latest app version (1.0.0)
- Build status
- Deployment history
- Update manifest

## 📦 OTA Updates (Over-The-Air)

After initial app store deployment, you can push updates without re-submitting:

```bash
# Publish update to production channel
eas update --branch production --message "Bug fixes and improvements"
```

Users will receive the update when they restart the app.

**Important**: Only use OTA for JavaScript/React Native changes. Native code changes require new builds.

## 🔍 Monitoring Builds

Check build status:
```bash
eas build:list
```

View build details:
```bash
eas build:view [BUILD_ID]
```

## 📱 Testing Production Builds

### Android:
```bash
# Install on connected device
eas build:run --platform android --latest
```

### iOS:
```bash
# Install on connected device (requires TestFlight or local install)
eas build:run --platform ios --latest
```

## 🎯 Post-Deployment Tasks

1. **Set up App Store Optimization (ASO)**:
   - Add screenshots (use Android emulator/iOS simulator)
   - Write compelling description
   - Add relevant keywords

2. **Configure Analytics**:
   - Set up Firebase Analytics (optional)
   - Track user engagement

3. **Set up Crash Reporting**:
   - Configure Sentry or similar service

4. **Monitor Reviews**:
   - Respond to user feedback
   - Address reported issues

## 📊 Version Management

For future updates, follow semantic versioning:

- **Patch** (1.0.1): Bug fixes, minor changes
  ```bash
  npm version patch
  eas update --branch production
  ```

- **Minor** (1.1.0): New features, backward compatible
  ```bash
  npm version minor
  eas build --platform all --profile production
  ```

- **Major** (2.0.0): Breaking changes
  ```bash
  npm version major
  eas build --platform all --profile production
  ```

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear Metro cache
npm run clean:all

# Try building again
eas build --platform [android|ios] --profile production --clear-cache
```

### Credentials Issues
```bash
# Remove and regenerate credentials
eas credentials

# Follow prompts to delete and recreate
```

### Version Conflicts
- Ensure `app.json` version matches `package.json`
- Increment `versionCode` (Android) and `buildNumber` (iOS)

## 📞 Support

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **EAS Submit Docs**: https://docs.expo.dev/submit/introduction/

---

**Current Status**: ✅ Rebranded to WhatsCard 1.0.0, ready for logo assets and deployment

**Next Steps**:
1. Create and replace logo assets
2. Set up production environment variables
3. Run production builds
4. Submit to app stores
5. Deploy to Vercel
