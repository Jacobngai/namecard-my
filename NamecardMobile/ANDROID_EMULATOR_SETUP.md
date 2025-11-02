# Android Emulator Setup Guide

## Quick Setup Instructions

### Option 1: Create Android Emulator via Android Studio (Recommended)

1. **Open Android Studio**
   - Launch Android Studio from your Start Menu

2. **Open AVD Manager**
   - Click "Tools" → "AVD Manager" (or click the AVD Manager icon in the toolbar)

3. **Create New Virtual Device**
   - Click "Create Virtual Device"
   - Select "Pixel 6" or "Pixel 7" (recommended for testing)
   - Click "Next"

4. **Select System Image**
   - Choose "API Level 34" (Android 14) for best compatibility
   - If not downloaded, click "Download" next to the system image
   - Click "Next"

5. **Configure AVD**
   - Name: "Pixel_6_API_34"
   - Leave other settings as default
   - Click "Finish"

6. **Start the Emulator**
   - Click the green play button next to your new AVD
   - Wait for the emulator to fully boot (may take 2-3 minutes first time)

### Option 2: Use Physical Device

1. **Enable Developer Options on your Android phone**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging**
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

3. **Connect your phone via USB**
   - Connect your phone to your computer
   - Accept the USB debugging prompt on your phone

## Running the App

Once you have either an emulator running or a physical device connected:

```bash
# In the NamecardMobile directory
npm run android
```

## Alternative: Expo Go App (Fastest for Development)

For quick development without emulator:

1. **Install Expo Go on your phone**
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. **Start Expo development server**
   ```bash
   cd NamecardMobile
   npm start
   ```

3. **Connect your phone**
   - Make sure your phone and computer are on the same WiFi network
   - Scan the QR code shown in the terminal with Expo Go app

## Troubleshooting

### Emulator not starting?
- Ensure Intel HAXM or AMD-V is enabled in BIOS
- Check Windows Hyper-V is disabled (conflicts with Android emulator)
- Try running Android Studio as Administrator

### Can't connect to device?
- Verify ADB is working: `adb devices`
- Restart ADB: `adb kill-server && adb start-server`
- Check USB cable and try different USB ports

### Metro bundler issues?
- Clear cache: `npx expo start -c`
- Reset Metro: `npx react-native start --reset-cache`