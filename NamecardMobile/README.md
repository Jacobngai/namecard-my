# NAMECARD.MY Mobile App

A React Native + Expo app for smart business card scanning and contact management.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation

1. Clone the repository and navigate to the mobile app directory:
```bash
cd NamecardMobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Use Expo Go app on your phone or run in simulator:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on phone

## Features

### Core Functionality (Free Tier)
- **Camera Scanning**: Take photos of business cards with real Google Vision OCR
- **Contact Management**: View, search, edit, and delete contacts with Supabase storage
- **WhatsApp Integration**: Send introduction messages with automatic contact tracking
- **Export**: Export contacts to Excel (simulated)

### App Structure
- **Camera Screen**: Business card capture with scanning frame
- **Contact Form**: Edit extracted information before saving
- **Contact List**: Browse and search saved contacts
- **Profile Screen**: User settings and WhatsApp intro message

## Technology Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and toolchain
- **TypeScript**: Type safety and better development experience
- **React Navigation**: Screen navigation and tab structure
- **Expo Camera**: Camera functionality
- **Vector Icons**: UI icons

## Development Commands

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Type checking
npx tsc --noEmit

# Clear cache
expo r -c
```

## App Components

### UI Components
- `Button.tsx`: Reusable button with variants
- `Input.tsx`: Form input with validation

### Screens
- `CameraScreen.tsx`: Business card scanning interface
- `ContactForm.tsx`: Contact data input and editing
- `ContactList.tsx`: Contact browsing and management
- `ProfileScreen.tsx`: User profile and settings

## API Integrations

### ✅ Implemented Features
- **Real OCR**: Google Vision API extracts text from business card photos
- **Database Storage**: Supabase PostgreSQL stores all contact data with real-time sync
- **Voice Transcription**: OpenAI Whisper API converts voice notes to text
- **WhatsApp Integration**: Opens actual WhatsApp with pre-filled messages and tracks contact timestamps
- **Image Storage**: Supabase Storage handles business card image uploads

### 🔧 API Test Suite
- **Built-in Testing**: Access "API Integration Tests" from Profile → Settings
- **Comprehensive Validation**: Tests all API keys and database operations
- **Real-time Results**: Shows detailed test results with pass/fail status

## Next Steps

1. **Premium Features**: Implement voice notes UI, follow-up reminders dashboard
2. **File Export**: Add actual Excel file generation and sharing
3. **User Authentication**: Add Supabase Auth for multi-user support
4. **Offline Sync**: Enhanced offline mode with background sync
5. **Analytics**: Advanced usage analytics and contact insights

## Known Issues

- Camera may require actual device testing (not available in web simulator)
- WhatsApp integration requires WhatsApp to be installed
- Export functionality is currently simulated

## Architecture

The app follows a simple but scalable architecture:
- **State Management**: React useState (can be upgraded to Context or Redux)
- **Navigation**: Stack and Tab navigation pattern
- **Type Safety**: Full TypeScript coverage
- **Component Pattern**: Reusable UI components with props interface
- **Platform Support**: iOS, Android, and Web (with limitations)

This is a working MVP that demonstrates the core NAMECARD.MY concept and can be extended with real backend integration.