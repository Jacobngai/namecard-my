# NAMECARD.MY Logo Implementation Guide

## 📁 Logo Files Location

Your logo files have been professionally integrated into the app:

```
assets/
├── images/
│   ├── logo-white.png  # White logo for dark backgrounds
│   └── logo-black.png  # Black logo for light backgrounds
├── splash/
│   └── splash.png      # White logo for splash screen
└── icon/
    └── icon.png        # Black logo for app icon
```

## 🎨 Logo Usage Throughout the App

### 1. **Authentication Screen**
- Location: `components/AuthScreen.tsx`
- Uses: White logo on gradient background
- Size: 100x100px
- Purpose: Brand identity during login/register

### 2. **Splash Screen**
- Location: `components/SplashScreen.tsx`
- Uses: Animated white logo
- Size: 180x180px
- Features:
  - Fade-in animation
  - Scale animation
  - Loading progress bar
  - Professional gradient background

### 3. **Profile Screen**
- Location: `components/ProfileScreen.tsx`
- Uses: Adaptive logo (black/white based on theme)
- Size: 60x60px
- Purpose: App branding in settings

### 4. **App Icon**
- Configuration: `app.json`
- Uses: Black logo on white background
- Platforms: iOS, Android, Web
- Adaptive icon support for Android

## 🌓 Adaptive Logo Component

The `Logo` component (`components/Logo.tsx`) automatically adapts to light/dark mode:

```typescript
// Basic usage
<Logo width={100} height={100} />

// Force specific theme
<Logo width={100} height={100} forceTheme="light" />
<Logo width={100} height={100} forceTheme="dark" />

// Animated version
<AnimatedLogo width={150} height={150} />
```

## 📱 Platform-Specific Configuration

### iOS
- App Icon: `assets/icon/icon.png`
- Splash Screen: `assets/splash/splash.png`
- Background: Blue gradient (#3B82F6)

### Android
- Adaptive Icon: `assets/icon/icon.png`
- Background Color: White (#FFFFFF)
- Splash Screen: Same as iOS

### Web
- Favicon: `assets/icon/icon.png`
- PWA Icon: Same as app icon

## 🎯 Professional Features

1. **Theme Adaptation**
   - Automatically switches between black/white logos
   - Respects system dark mode preference
   - Manual override available

2. **Animation Support**
   - Smooth fade-in effects
   - Scale animations
   - Loading progress indicators

3. **Consistent Branding**
   - Logo appears at all key touchpoints
   - Consistent sizing and positioning
   - Professional gradient backgrounds

4. **High Quality Display**
   - Vector-ready PNG format
   - Multiple size variants
   - Retina display support

## 🔧 Customization Options

### Change Logo Colors
The app automatically uses:
- **White logo** on dark/colored backgrounds
- **Black logo** on light backgrounds

### Adjust Logo Sizes
Edit the width/height props in each component:
```typescript
<Logo width={120} height={120} />
```

### Update Splash Screen
Modify `components/SplashScreen.tsx`:
- Animation duration
- Background gradient colors
- Loading text

### App Icon Generation
For production, generate multiple icon sizes:
- iOS: 1024x1024px for App Store
- Android: 512x512px for Play Store
- Web: 192x192px, 512x512px for PWA

## 📋 Checklist

✅ Logo files copied to assets directory
✅ Authentication screen displays logo
✅ Splash screen with animated logo
✅ Profile screen shows adaptive logo
✅ App icon configured for all platforms
✅ Dark/light mode support
✅ Professional animations
✅ Consistent branding throughout

## 🚀 Next Steps

1. **Generate Icon Variants**
   - Use tools like Expo's `expo-splash-screen` for automatic generation
   - Create platform-specific sizes

2. **Optimize Images**
   - Compress PNGs for smaller app size
   - Consider SVG format for scalability

3. **Brand Guidelines**
   - Maintain consistent logo usage
   - Document color schemes
   - Define minimum sizes

Your NAMECARD.MY app now has professional branding with your logos integrated throughout the user experience!