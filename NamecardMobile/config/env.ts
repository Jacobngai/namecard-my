import Constants from 'expo-constants';

// Environment configuration with proper typing
interface EnvConfig {
  GEMINI_API_KEY: string;
  GOOGLE_VISION_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  OPENAI_API_KEY: string;
  APP_ENV: 'development' | 'staging' | 'production';
  DEBUG_MODE: boolean;
}

// Get environment variables from Expo Constants
const getEnvVar = (name: string, fallback: string = ''): string => {
  return Constants.expoConfig?.extra?.[name] || process.env[name] || fallback;
};

// Export environment configuration
export const ENV: EnvConfig = {
  GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY'),
  GOOGLE_VISION_API_KEY: getEnvVar('GOOGLE_VISION_API_KEY'),
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  APP_ENV: getEnvVar('APP_ENV', 'development') as 'development' | 'staging' | 'production',
  DEBUG_MODE: getEnvVar('DEBUG_MODE', 'true') === 'true',
};

// Validation function to check if all required keys are present
export const validateEnv = (): { isValid: boolean; missingKeys: string[] } => {
  const requiredKeys = [
    'GEMINI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'OPENAI_API_KEY'
  ];

  const missingKeys = requiredKeys.filter(key => !ENV[key as keyof EnvConfig]);

  return {
    isValid: missingKeys.length === 0,
    missingKeys
  };
};

// Log environment status (only in development)
if (ENV.DEBUG_MODE && ENV.APP_ENV === 'development') {
  const { isValid, missingKeys } = validateEnv();
  
  if (!isValid) {
    console.warn('⚠️ Missing environment variables:', missingKeys);
    console.log('📝 Please check your .env file and app.json configuration');
  } else {
    console.log('✅ All environment variables loaded successfully');
  }
}