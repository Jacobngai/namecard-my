import 'dotenv/config';

export default {
  expo: {
    name: "NAMECARD.MY",
    slug: "namecard-my",
    owner: "jacobai",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      bundleIdentifier: "com.jacobai.namecardmy",
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "NAMECARD.MY needs camera access to scan business cards",
        NSMicrophoneUsageDescription: "NAMECARD.MY needs microphone access to record voice notes"
      }
    },
    android: {
      package: "com.jacobai.namecardmy",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Allow NAMECARD.MY to access your camera to scan business cards."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "66d97936-e847-4b80-a6c7-bf90ea4a0d80"
      },
      GOOGLE_VISION_API_KEY: process.env.GOOGLE_VISION_API_KEY || "",
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
      APP_ENV: process.env.APP_ENV || "development",
      DEBUG_MODE: process.env.DEBUG_MODE || "true"
    }
  }
};