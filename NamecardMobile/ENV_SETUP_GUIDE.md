# Environment Setup Guide

## Setting Up API Keys for NAMECARD.MY

### Step 1: Create Your .env File

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and replace the placeholder values with your actual API keys:
   ```
   GOOGLE_VISION_API_KEY=your_actual_google_vision_key
   SUPABASE_URL=your_actual_supabase_url
   SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   OPENAI_API_KEY=your_actual_openai_api_key
   ```

### Step 2: Get Your API Keys

#### Google Vision API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Vision API
4. Go to Credentials and create an API key
5. Restrict the key to Vision API for security

#### Supabase Configuration
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings > API
4. Copy your Project URL and anon/public key

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API keys section
3. Create a new secret key
4. Save it securely - you won't be able to see it again!

### Step 3: Set Up EAS Build Environment (Optional)

If you're using Expo EAS Build, use the new script to set environment variables:

**Windows (Command Prompt):**
```cmd
setup-eas-env-from-dotenv.bat
```

**Windows (PowerShell) / Mac / Linux:**
```powershell
./setup-eas-env-from-dotenv.ps1
```

This script will:
- Read your local `.env` file
- Set all variables in EAS for production, preview, and development environments
- Update existing variables if they already exist

### Important Security Notes

⚠️ **NEVER commit your `.env` file to version control!**
- The `.env` file is already in `.gitignore`
- Always use `.env.example` as a template for others
- Rotate your API keys regularly
- Use different keys for development and production

### Troubleshooting

If you encounter issues:
1. Verify your `.env` file exists and has the correct format
2. Check that your API keys are valid
3. For EAS builds, verify with: `eas env:list --environment production`
4. Ensure you have the necessary permissions for each service

### Local Development

For local development with Expo:
```bash
npx expo start
```

The app will automatically read from your `.env` file.