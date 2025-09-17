# INITIAL Feature Template for NAMECARD.MY

## FEATURE:
[Describe the feature you want to implement. Be specific about functionality, user experience, and business goals]

Example:
- Implement business card OCR scanning with >85% accuracy
- Add multi-tier subscription system with RevenueCat
- Create distributor portal with commission tracking

## CONTEXT:

### Current Architecture:
- **Platform**: React Native + Expo (mobile app)
- **Backend**: Supabase (auth, database, storage)
- **State**: Local React state (no Redux yet)
- **Navigation**: React Navigation (bottom tabs + stack)
- **Key Pattern**: Offline-first (LocalStorage → ContactService → Supabase)

### Existing Files to Reference:
```
NamecardMobile/
├── App.tsx                    # Main app with navigation
├── components/
│   ├── CameraScreen.tsx       # Camera implementation example
│   ├── ContactForm.tsx        # Form handling example
│   └── ContactList.tsx        # List rendering example
├── services/
│   ├── localStorage.ts        # Offline storage (MUST USE)
│   ├── contactService.ts     # Business logic pattern
│   └── supabase.ts           # Backend integration (optional)
└── utils/
    └── imageProcessing.ts     # Image handling utilities
```

## EXAMPLES:

### Offline-First Pattern (MUST FOLLOW):
```typescript
// From services/contactService.ts
static async createContact(data: Partial<Contact>): Promise<Contact> {
  // 1. Always save locally first
  const localContact = await LocalStorage.saveContact(data);

  // 2. Queue for sync if online (non-blocking)
  if (this.hasAuth) {
    this.queueSync('create', localContact);
  }

  return localContact;
}
```

### Component Pattern:
```typescript
// From components/ContactList.tsx
export function ComponentName({ props }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDataOfflineFirst();
  }, []);

  // Always handle errors gracefully
  const loadDataOfflineFirst = async () => {
    try {
      const data = await ContactService.getData();
      // Handle success
    } catch (error) {
      // Fallback gracefully
    }
  };

  return <SafeAreaView>...</SafeAreaView>;
}
```

## DOCUMENTATION:

### Essential References:
1. **React Native**: https://reactnative.dev/docs/getting-started
2. **Expo SDK**: https://docs.expo.dev/versions/latest/
3. **Supabase Client**: https://supabase.com/docs/reference/javascript/introduction
4. **AsyncStorage**: https://react-native-async-storage.github.io/async-storage/

### Specific APIs (if relevant to your feature):
- **Camera**: https://docs.expo.dev/versions/latest/sdk/camera/
- **Google Vision OCR**: https://cloud.google.com/vision/docs
- **RevenueCat**: https://www.revenuecat.com/docs
- **WhatsApp Deep Linking**: https://faq.whatsapp.com/5913398998672934

### Internal Documentation:
- `DATABASE-SCHEMA.md` - Database structure
- `DEVELOPMENT-ROADMAP.md` - Feature priorities
- `SUBSCRIPTION-TIERS.md` - Pricing model
- `OFFLINE_TEST_VERIFICATION.md` - Offline requirements
- `FIX_SUMMARY.md` - Recent architectural changes

## REQUIREMENTS:

### Must Have:
- [ ] Works completely offline
- [ ] Saves data locally first
- [ ] Syncs to Supabase when online (if applicable)
- [ ] No authentication required for basic features
- [ ] Graceful error handling
- [ ] Loading states for all async operations

### Performance Targets:
- App startup: <3 seconds
- Feature response: <500ms
- Memory usage: <150MB
- Offline storage: Support 1000+ contacts

### User Experience:
- Instant feedback (no network delays)
- Clear loading indicators
- Error messages that help (not technical jargon)
- Works in airplane mode

## OTHER CONSIDERATIONS:

### Common Gotchas to Avoid:
1. **Never require Supabase auth** for basic features
2. **Never block UI** waiting for network
3. **Always test offline first** before online
4. **Check circular dependencies** between services
5. **Use local IDs** (format: `local_timestamp_random`)

### Platform-Specific:
- **iOS**: Test on iPhone 12+ (iOS 14+)
- **Android**: Test on API 21+ (Android 5.0+)
- **Expo Go**: Some features may need development build

### Market Considerations:
- **Primary**: Malaysia (70% users)
- **Languages**: English, Malay, Chinese
- **Network**: Often spotty 4G/5G
- **Devices**: Mid-range smartphones common

### Testing Checklist:
```bash
# Before considering feature complete:
1. Put phone in airplane mode
2. Test entire feature flow
3. Should work perfectly offline
4. Turn off airplane mode
5. Verify sync happens (if applicable)
6. Check for duplicate operations
```

## VALIDATION GATES:

### Code Quality:
```bash
# TypeScript check
npx tsc --noEmit

# Linting
npm run lint

# Build check
npx expo prebuild --clear
```

### Functional Tests:
- [ ] Works in airplane mode
- [ ] Data persists after app restart
- [ ] Sync doesn't duplicate data
- [ ] No memory leaks
- [ ] Performance targets met

## SUCCESS CRITERIA:

Your feature is complete when:
1. ✅ All offline requirements met
2. ✅ Follows existing patterns
3. ✅ No regression in existing features
4. ✅ Validation gates pass
5. ✅ Ready for production

---

## Example INITIAL.md Files:

### For OCR Feature:
```markdown
## FEATURE:
Implement business card OCR scanning using Google Vision API with offline queue

## EXAMPLES:
- Camera implementation: components/CameraScreen.tsx
- Image processing: utils/imageProcessing.ts
- Offline queue: services/localStorage.ts (sync queue pattern)

## DOCUMENTATION:
- Google Vision API: https://cloud.google.com/vision/docs
- Expo Camera: https://docs.expo.dev/versions/latest/sdk/camera/
```

### For Subscription System:
```markdown
## FEATURE:
Add multi-tier subscription (Free/Pro/Enterprise) with RevenueCat integration

## EXAMPLES:
- Feature gating: Check ProfileScreen.tsx for isPremiumUser flag
- Payment UI: Reference UpgradePrompt.tsx modal pattern

## DOCUMENTATION:
- RevenueCat React Native: https://docs.revenuecat.com/docs/reactnative
- Subscription tiers: SUBSCRIPTION-TIERS.md
```

### For Distributor Portal:
```markdown
## FEATURE:
Create distributor management system with commission tracking and payouts

## EXAMPLES:
- Database schema: DATABASE-SCHEMA.md (distributors table)
- Admin patterns: Create new DistributorDashboard component

## DOCUMENTATION:
- Supabase Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- Commission logic: DISTRIBUTOR-SYSTEM-DESIGN.md
```

---

**Remember**: The more context you provide, the better the PRP generation will be!