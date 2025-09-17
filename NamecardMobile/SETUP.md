# 🔧 NAMECARD.MY Setup Guide

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Expo CLI** (`npm install -g @expo/cli`)
4. **API Keys** (see below)

## 🔑 API Keys Setup

### 1. Copy Environment File
```bash
cp .env.example .env
```

### 2. Get Your API Keys

#### 🔍 **Google Vision API** (for OCR)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Cloud Vision API"
4. Go to **APIs & Credentials** → **Create Credentials** → **API Key**
5. Copy the API key

#### 🗃️ **Supabase** (for Backend)
1. Go to [Supabase](https://app.supabase.com/)
2. Create a new project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

#### 🤖 **OpenAI** (for Voice & AI)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/Login
3. Go to **API Keys** → **Create new secret key**
4. Copy the API key (starts with `sk-...`)

### 3. Update .env File

Open `.env` and replace placeholders:

```bash
# Google Vision API for OCR
GOOGLE_VISION_API_KEY=AIzaSyC-your-actual-api-key-here

# Supabase Configuration
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# OpenAI API
OPENAI_API_KEY=sk-proj-your-actual-openai-key-here
```

### 4. Update app.json (Alternative Method)

You can also set API keys directly in `app.json` under `expo.extra`:

```json
{
  "expo": {
    "extra": {
      "GOOGLE_VISION_API_KEY": "your-key-here",
      "SUPABASE_URL": "https://yourproject.supabase.co",
      "SUPABASE_ANON_KEY": "your-anon-key-here",
      "OPENAI_API_KEY": "sk-your-openai-key-here"
    }
  }
}
```

## 🚀 Installation & Running

### 1. Install Dependencies
```bash
cd NamecardMobile
npm install
```

### 2. Start Development Server
```bash
npm start
```

### 3. Run on Device/Simulator

**iOS Simulator:**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Physical Device:**
1. Install **Expo Go** app
2. Scan QR code from terminal

## 📱 Testing API Integration

The app will automatically validate your API keys on startup:

- ✅ **Green logs**: All keys configured correctly
- ⚠️ **Yellow warnings**: Missing API keys (shows which ones)

## 🔧 Troubleshooting

### Environment Variables Not Loading
1. Make sure `.env` file is in root directory (`NamecardMobile/.env`)
2. Restart Expo development server (`expo r -c`)
3. Check `config/env.ts` for validation errors

### Camera Permissions
- **iOS**: Automatically handled via `app.json`
- **Android**: May need manual permission grant in device settings

### API Key Issues
- **Google Vision**: Make sure Cloud Vision API is enabled
- **Supabase**: Check project URL format and key validity
- **OpenAI**: Verify billing setup and API access

### Common Commands
```bash
# Clear cache and restart
expo r -c

# Check environment variables
npm run validate-env

# Type checking
npx tsc --noEmit

# Install new dependencies
expo install package-name
```

## 🔒 Security Notes

- ✅ `.env` file is gitignored (won't be committed)
- ✅ Use `.env.example` for team sharing
- ⚠️ Never commit actual API keys to repository
- 🔄 Rotate keys if accidentally exposed

## 📚 API Documentation

- [Google Vision API](https://cloud.google.com/vision/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

## 🆘 Need Help?

1. Check the console logs for specific error messages
2. Verify all API keys are correctly formatted
3. Ensure you have billing enabled for paid APIs (Google Vision, OpenAI)
4. Check network connectivity and firewall settings