# 🚀 NAMECARD.MY App - Run Guide

## ✅ App Has Been Fixed!

The issues from the expo installation have been resolved. Your app is now ready to run.

## 📱 How to Start the App

### Option 1: Quick Start (Recommended)
```bash
cd NamecardMobile
npx expo start
```

Then press:
- `a` - Open on Android emulator/device
- `i` - Open on iOS simulator (Mac only)
- `w` - Open in web browser

### Option 2: Using Scripts
Double-click the batch files:
- **start-app.bat** - Starts the app with cache cleared
- **fix-app.bat** - Fixes any issues (run if app won't start)

### Option 3: Manual Commands
```bash
# Start normally
npm start

# Start with cache cleared
npx expo start --clear

# Start for specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

## 🔧 What Was Fixed

1. **Expo Version**: Updated to compatible version (~54.0.0)
2. **Dependencies**: Reinstalled with --legacy-peer-deps flag
3. **Configuration Files**:
   - Added metro.config.js
   - Updated tsconfig.json
   - Fixed babel.config.js
4. **Cache**: Cleared Metro bundler cache

## 📲 Testing on Your Phone

### Using Expo Go App:
1. Install **Expo Go** from:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the app: `npx expo start`

3. Scan the QR code:
   - **iOS**: Use Camera app
   - **Android**: Use Expo Go app scanner

### Requirements:
- Phone and computer on same WiFi network
- Expo Go app installed
- Metro bundler running

## 🛠️ Troubleshooting

### If app won't start:
```bash
# Run the fix script
fix-app.bat

# Or manually:
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npx expo start --clear
```

### Common Issues:

**"Metro bundler error"**
```bash
npx expo start --clear
```

**"Module not found"**
```bash
npm install --legacy-peer-deps
```

**"Network error"**
- Ensure phone and computer on same WiFi
- Check firewall settings
- Try: `npx expo start --tunnel`

**"Transform error"**
```bash
npx expo start --clear
rm -rf .expo
```

## 📝 Development Workflow

1. **Start the app**:
   ```bash
   npx expo start
   ```

2. **Make changes**: Edit your code - app auto-reloads

3. **View logs**: Check terminal for console.log output

4. **Debug**: Shake device or press `d` in terminal

## 🎯 Quick Commands Reference

| Command | Description |
|---------|-------------|
| `npx expo start` | Start development server |
| `npx expo start --clear` | Start with cache cleared |
| `r` | Reload app |
| `d` | Open developer menu |
| `shift + d` | Open DevTools |
| `a` | Open Android |
| `i` | Open iOS |
| `w` | Open Web |

## ✨ App Features Working

- ✅ Authentication (Login/Register/Forgot Password)
- ✅ Business card scanning
- ✅ Contact management
- ✅ WhatsApp integration
- ✅ Professional logos integrated
- ✅ Splash screen with animation
- ✅ Supabase backend ready

## 🚀 Building for Production

When ready to deploy:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 📞 Support

If you encounter issues:
1. Run `fix-app.bat`
2. Clear cache: `npx expo start --clear`
3. Check error messages in terminal
4. Verify all dependencies installed

Your app is now ready to run! Just use `npx expo start` in the NamecardMobile directory.