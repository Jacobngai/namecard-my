# 🔐 NAMECARD.MY Authentication Setup Guide
*Complete step-by-step guide for Google, Apple, and Email authentication*

## 📋 Overview

This guide will walk you through setting up all three authentication methods for NAMECARD.MY:
- **Google Sign-In** (OAuth)
- **Apple Sign In** (OAuth)
- **Email Authentication** (Supabase native)

---

## 🎯 What You Need to Provide Me

### 📱 App Information
- **App Bundle ID**: `com.namecard.my` (or your chosen bundle ID)
- **App Name**: NAMECARD.MY
- **App Store URL**: (once published)
- **Website URL**: (if you have one)

### 🔑 Credentials (You'll obtain these following steps below)
- Google OAuth Client IDs (Web, iOS, Android)
- Apple Services ID and Key ID
- Apple Team ID
- SHA-1/SHA-256 fingerprints for Android

---

## 📝 Step-by-Step Setup Instructions

### 🟦 1. SUPABASE AUTHENTICATION SETUP

#### What YOU need to do:
1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Navigate to: **Authentication > Providers**

2. **Enable Authentication Providers**:
   - ✅ **Email** (should already be enabled)
   - ✅ **Google** (toggle ON)
   - ✅ **Apple** (toggle ON)

3. **Configure Site URL**:
   - Go to: **Authentication > URL Configuration**
   - Set **Site URL**: `yourapp://callback` (for mobile deep linking)
   - Add **Redirect URLs**:
     - `yourapp://callback`
     - `https://yourapp.com/auth/callback` (if you have a web version)

#### What to give me later:
```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

---

### 🟢 2. GOOGLE SIGN-IN SETUP

#### What YOU need to do:

#### Step 2.1: Google Cloud Console Setup
1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project OR select existing project

2. **Enable Google Sign-In API**
   - Go to: **APIs & Services > Library**
   - Search for "Google Sign-In API"
   - Click **Enable**

3. **Configure OAuth Consent Screen**
   - Go to: **APIs & Services > OAuth consent screen**
   - Choose **External** (unless you have Google Workspace)
   - Fill out required information:
     - **App name**: NAMECARD.MY
     - **User support email**: your-email@domain.com
     - **Developer contact email**: your-email@domain.com
     - **App domain**: (leave blank for now)
     - **Privacy Policy**: (add link when ready)
     - **Terms of Service**: (add link when ready)

4. **Create OAuth Credentials**

   **📱 For iOS:**
   - Go to: **APIs & Services > Credentials**
   - Click: **Create Credentials > OAuth Client ID**
   - Application type: **iOS**
   - Name: `NAMECARD.MY iOS`
   - Bundle ID: `com.namecard.my` (your app's bundle ID)
   - Save the **Client ID**

   **🤖 For Android:**
   - Click: **Create Credentials > OAuth Client ID**
   - Application type: **Android**
   - Name: `NAMECARD.MY Android`
   - Package name: `com.namecard.my`
   - SHA-1 certificate fingerprint: (see step 2.2)
   - Save the **Client ID**

   **🌐 For Web/Server:**
   - Click: **Create Credentials > OAuth Client ID**
   - Application type: **Web application**
   - Name: `NAMECARD.MY Web`
   - Authorized JavaScript origins: `https://<your-supabase-project>.supabase.co`
   - Authorized redirect URIs: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - Save both **Client ID** and **Client Secret**

#### Step 2.2: Get Android SHA-1 Fingerprint
Run these commands in your project directory:
```bash
# For development/debug
cd android
./gradlew signingReport

# Look for the SHA1 fingerprint under "Variant: debug"
# Copy the SHA1 value (looks like: AB:CD:EF:12:34:56:78:90...)
```

#### What to give me:
```
GOOGLE_WEB_CLIENT_ID=your-web-client-id
GOOGLE_WEB_CLIENT_SECRET=your-web-client-secret
GOOGLE_IOS_CLIENT_ID=your-ios-client-id
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
```

---

### 🍎 3. APPLE SIGN IN SETUP

#### What YOU need to do:

#### Step 3.1: Apple Developer Account Required
- **Cost**: $99/year USD
- **Requirements**:
  - Valid Apple ID with 2FA enabled
  - Government-issued photo ID for verification
  - Credit/debit card (no prepaid cards)

#### Step 3.2: Enroll in Apple Developer Program
1. **Go to**: https://developer.apple.com/programs/enroll/
2. **Sign in** with your Apple ID
3. **Complete identity verification** (using driver's license/passport)
4. **Pay the annual fee** ($99 USD)
5. **Wait for approval** (usually 24-48 hours)

#### Step 3.3: Configure Sign in with Apple
1. **Go to**: https://developer.apple.com/account/
2. **Navigate to**: Certificates, Identifiers & Profiles

3. **Create App ID**:
   - Click: **Identifiers > +**
   - Type: **App IDs**
   - Description: `NAMECARD.MY`
   - Bundle ID: `com.namecard.my` (explicit)
   - Capabilities: Check ✅ **Sign In with Apple**
   - **Save**

4. **Create Services ID** (for web/server):
   - Click: **Identifiers > +**
   - Type: **Services IDs**
   - Description: `NAMECARD.MY Services`
   - Identifier: `com.namecard.my.services`
   - Check ✅ **Sign In with Apple**
   - Click **Configure**:
     - Primary App ID: `com.namecard.my`
     - Domains: `<your-supabase-project>.supabase.co`
     - Redirect URLs: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - **Save**

5. **Create Sign In with Apple Key**:
   - Click: **Keys > +**
   - Key Name: `NAMECARD.MY Sign In Key`
   - Check ✅ **Sign in with Apple**
   - Click **Configure** > Select your App ID
   - **Continue** > **Register**
   - **Download** the key file (.p8) - ⚠️ **Only chance to download!**
   - Note the **Key ID** (10 characters)

6. **Get Team ID**:
   - Go to: **Membership** tab
   - Copy your **Team ID** (10 characters)

#### What to give me:
```
APPLE_CLIENT_ID=com.namecard.my.services
APPLE_KEY_ID=your-10-char-key-id
APPLE_TEAM_ID=your-10-char-team-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...your-private-key-content...
-----END PRIVATE KEY-----"
```

---

### 📱 4. APP STORE / PLAY STORE SETUP

#### 🍎 Apple App Store Connect

**What YOU need to do:**

1. **Go to**: https://appstoreconnect.apple.com/
2. **Create New App**:
   - Platform: iOS
   - Name: NAMECARD.MY
   - Primary Language: English
   - Bundle ID: `com.namecard.my` (from your developer account)
   - SKU: `namecard-my-ios`

3. **App Information**:
   - Subtitle: Business Card Scanner & Networking
   - Category: Business
   - Content Rights: Check if you have rights
   - Age Rating: Complete the questionnaire

4. **Pricing**:
   - Free with In-App Purchases
   - Availability: All territories

#### 🤖 Google Play Console

**What YOU need to do:**

**Requirements:**
- One-time $25 USD registration fee
- Valid credit/debit card (no prepaid)
- Government-issued ID for verification
- Phone number for SMS verification

**Setup Steps:**
1. **Go to**: https://play.google.com/console/
2. **Sign up** with your Google Account
3. **Pay registration fee** ($25 USD)
4. **Complete identity verification**
5. **Accept Developer Distribution Agreement**

6. **Create App**:
   - App name: NAMECARD.MY
   - Default language: English (United States)
   - App or Game: App
   - Free or Paid: Free

7. **App Details**:
   - Short description: Smart business card scanner
   - Full description: Professional networking made easy
   - App category: Business
   - Content rating: Complete questionnaire

---

## 🔧 Configuration Summary

### What I'll need from you:

#### Environment Variables:
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Google OAuth
GOOGLE_WEB_CLIENT_ID=your-web-client-id
GOOGLE_WEB_CLIENT_SECRET=your-web-client-secret
GOOGLE_IOS_CLIENT_ID=your-ios-client-id
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id

# Apple Sign In
APPLE_CLIENT_ID=com.namecard.my.services
APPLE_KEY_ID=your-key-id
APPLE_TEAM_ID=your-team-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."

# App Configuration
APP_BUNDLE_ID=com.namecard.my
APP_SCHEME=namecard
```

#### Files needed:
- Apple Sign In private key (.p8 file content)
- Android signing keystore details

---

## ⚠️ Important Notes

### Security:
- **NEVER share private keys publicly**
- **Store credentials in secure .env files**
- **Add .env to .gitignore**

### Costs:
- **Google**: Free (just need Google account)
- **Apple Developer**: $99 USD/year (required for Sign in with Apple)
- **Google Play Console**: $25 USD one-time fee
- **Supabase**: Free tier available

### Timeline:
- **Google Setup**: ~30 minutes
- **Apple Developer Approval**: 24-48 hours
- **Apple Sign In Setup**: ~45 minutes (after approval)
- **Play Console Setup**: ~20 minutes
- **Integration Development**: ~2-3 hours

### Testing:
- **Google Sign-In**: Works immediately after setup
- **Apple Sign In**: Requires approved developer account
- **Email Auth**: Works with Supabase setup

---

## 📞 Next Steps

1. **Follow steps above** to obtain all credentials
2. **Send me all the credentials** listed in the "What to give me" sections
3. **I'll integrate** all authentication methods into the app
4. **We'll test** each authentication flow
5. **Deploy** and submit to app stores

Let me know once you have the credentials, and I'll implement the complete authentication system! 🚀