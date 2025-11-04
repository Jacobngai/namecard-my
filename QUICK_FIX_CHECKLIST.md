# WhatsCard 1.0.0 - Quick Fix Checklist

Use this checklist to track your progress through the audit fixes.

---

## 🔴 PHASE 1: CRITICAL SECURITY (Today)

- [ ] **1. Revoke and regenerate API keys** ⚠️ URGENT
  - [ ] Google Gemini API key → https://makersuite.google.com/app/apikey
  - [ ] OpenAI API key → https://platform.openai.com/api-keys
  - [ ] Supabase anon key → Supabase Dashboard > Project Settings > API

- [x] **2. Fix .gitignore** ✅ DONE
  - [x] Add .env files to .gitignore
  - [x] Add secrets/ directory
  - [x] Add build artifacts

- [ ] **3. Remove committed secrets from Git**
  ```bash
  git rm --cached NamecardMobile/.env
  git rm --cached NUL
  git commit -m "chore: Remove accidentally committed sensitive files"
  ```

- [ ] **4. Move IAP secrets to environment variables**
  - [ ] Create .env entries for APPLE_SHARED_SECRET and GOOGLE_LICENSE_KEY
  - [ ] Update config/iap-ios.ts to use process.env.APPLE_SHARED_SECRET
  - [ ] Update config/iap-android.ts to use process.env.GOOGLE_LICENSE_KEY

- [ ] **5. Fix race condition in sync queue**
  - File: `services/contactService.ts:215-241`
  - [ ] Add `syncInProgress` flag
  - [ ] Implement retry counter increment
  - [ ] Add proper error handling

- [ ] **6. Fix memory leak in auth listener**
  - File: `App.tsx:52`
  - [ ] Add cleanup function to useEffect
  - [ ] Return listener unsubscribe function

- [ ] **7. Use SecureStore for session tokens**
  - File: `services/authManager.ts:77-93`
  - [ ] Install expo-secure-store: `npm install expo-secure-store`
  - [ ] Replace AsyncStorage with SecureStore
  - [ ] Test login/logout flow

- [ ] **8. Delete junk files**
  ```bash
  rm NUL
  rm NamecardMobile/app.json.backup
  rm NamecardMobile/test*.js
  rm NamecardMobile/checkSupabaseConfig.js
  ```

- [ ] **9. Remove deprecated code**
  - [ ] Delete services/geminiOCR.ts:335-345 (cleanPhoneNumber function)
  - [ ] Delete utils/imageProcessing.ts:100-108 (enhanceForOCR function)
  - [ ] Delete config/env.ts (duplicate of environment.ts)
  - [ ] Remove __tests__/auth/AuthIntegration.test.tsx:11 (googleVision mock)
  - [ ] Update imports in services/geminiOCR.ts from env.ts to environment.ts

---

## 🟡 PHASE 2: HIGH PRIORITY (This Week)

- [ ] **10. Fix TypeScript errors (10 errors)**
  - [ ] Remove googleVision mock from AuthIntegration.test.tsx:11
  - [ ] Fix ref usage on AuthScreen (line 353)
  - [ ] Replace fireEvent.click with fireEvent.press in ContactCard.test.tsx
  - [ ] Replace fireEvent.contextMenu with fireEvent.longPress
  - [ ] Remove toBeInTheDocument matcher (use toBeTruthy)
  - [ ] Remove toHaveAttribute matcher (use props check)

- [ ] **11. Fix Alert mock**
  - File: `jest.setup.js`
  - [ ] Replace global.Alert with proper jest.fn() structure
  - [ ] Add beforeEach to clear mock

- [ ] **12. Install ESLint**
  ```bash
  npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-native eslint-plugin-react-hooks
  ```
  - [ ] Run initial lint: `npm run lint`
  - [ ] Fix auto-fixable issues: `npm run lint:fix`

- [ ] **13. Fix failing test suites (6/8 failing)**
  - [ ] Fix Login.test.tsx (Alert.alert.mockClear error)
  - [ ] Fix Register.test.tsx (Alert.alert.mockClear error)
  - [ ] Fix ForgotPassword.test.tsx (Alert.alert.mockClear error)
  - [ ] Fix ContactCard.test.tsx (fireEvent errors)
  - [ ] Rename test-utils.tsx or move outside __tests__

- [ ] **14. Add input validation with Yup**
  ```bash
  npm install yup
  npm install --save-dev @types/yup
  ```
  - [ ] Create validation schemas for Contact
  - [ ] Add validation to ContactForm
  - [ ] Add validation to AuthScreen

- [ ] **15. Fix ID collision risk**
  ```bash
  npm install uuid react-native-get-random-values
  npm install --save-dev @types/uuid
  ```
  - File: `services/localStorage.ts:51`
  - [ ] Import uuid and polyfill
  - [ ] Replace Date.now() + Math.random() with uuidv4()

- [ ] **16. Create centralized theme system**
  - [ ] Create theme/index.ts
  - [ ] Define colors, spacing, typography, borderRadius
  - [ ] Update all screens to import theme
  - [ ] Replace hardcoded colors with theme.colors.X

---

## 🟢 PHASE 3: MEDIUM PRIORITY (This Sprint)

- [ ] **17. Add accessibility labels**
  - [ ] CameraScreen.tsx:238 - Capture button
  - [ ] ContactList.tsx:381-388 - WhatsApp buttons
  - [ ] FloatingActionButton.tsx:93-228 - Menu items
  - [ ] All other interactive elements

- [ ] **18. Fix contrast issues (WCAG AA)**
  - [ ] AuthScreen.tsx:494 - White on rgba(255,255,255,0.9)
  - [ ] ContactList.tsx:883 - #9CA3AF on white
  - [ ] PaywallScreen.tsx:404 - #D1FAE5 on green gradient
  - [ ] Run contrast checker on all text/background combinations

- [ ] **19. Add loading states**
  - [ ] ContactList.tsx:119-148 - WhatsApp action
  - [ ] ContactDetailModal.tsx:44-82 - Phone/email/WhatsApp
  - [ ] ProfileScreen.tsx:29-37 - Intro message save
  - [ ] All other async operations

- [ ] **20. Add inline error states to forms**
  - [ ] Input.tsx - Make error prop functional
  - [ ] ContactForm - Add validation errors
  - [ ] AuthScreen - Add inline validation

- [ ] **21. Improve keyboard handling**
  - [ ] Add keyboardShouldPersistTaps="handled" to ScrollViews
  - [ ] Test keyboard on iOS and Android
  - [ ] Add KeyboardAvoidingView where missing

- [ ] **22. Add pull-to-refresh**
  - File: `ContactList.tsx`
  - [ ] Wrap FlatList with RefreshControl
  - [ ] Implement onRefresh handler
  - [ ] Show loading indicator during refresh

---

## 📊 PHASE 4: TESTING (Next 2 Weeks)

### Week 1: Core Features (Target: 30% coverage)

- [ ] **23. Write tests for useAuth hook**
  - [ ] Test login flow
  - [ ] Test logout flow
  - [ ] Test session verification
  - [ ] Test error handling
  - [ ] Test auth state changes

- [ ] **24. Write tests for authManager service**
  - [ ] Test signIn
  - [ ] Test signUp
  - [ ] Test signOut
  - [ ] Test verifySession
  - [ ] Test password reset

### Week 2: Contact Management (Target: 60% coverage)

- [ ] **25. Write tests for useContacts hook**
  - [ ] Test fetchContacts
  - [ ] Test addContact
  - [ ] Test updateContact
  - [ ] Test deleteContact
  - [ ] Test searchContacts

- [ ] **26. Write tests for contactService**
  - [ ] Test createContact
  - [ ] Test updateContact
  - [ ] Test deleteContact
  - [ ] Test sync queue operations
  - [ ] Test offline mode

### Week 3: OCR & Camera (Target: 80% coverage)

- [ ] **27. Write tests for geminiOCR**
  - [ ] Test business card scanning
  - [ ] Test data extraction
  - [ ] Test error handling
  - [ ] Test retry logic

- [ ] **28. Write tests for useCamera hook**
  - [ ] Test camera permissions
  - [ ] Test photo capture
  - [ ] Test image processing

### Week 4: Premium Features (Target: 90% coverage)

- [ ] **29. Write tests for iapService**
  - [ ] Test product listing
  - [ ] Test purchase flow
  - [ ] Test restore purchases
  - [ ] Test subscription status

- [ ] **30. Write tests for useSubscription hook**
  - [ ] Test subscription state
  - [ ] Test premium feature checks
  - [ ] Test promo code validation

---

## 🎨 PHASE 5: POLISH (Ongoing)

- [ ] **31. Add micro-animations**
  - [ ] Card expand/collapse in ContactList
  - [ ] Auth tab transitions
  - [ ] Button press feedback

- [ ] **32. Implement toast notification system**
  - [ ] Replace Alert.alert with toasts for success messages
  - [ ] Keep Alert for critical decisions only
  - [ ] Add toast queue management

- [ ] **33. Add offline indicator**
  - [ ] Create OfflineBanner component
  - [ ] Show banner when network unavailable
  - [ ] Auto-hide when connection restored

- [ ] **34. Optimize image loading**
  - [ ] Add placeholder images
  - [ ] Add error states for failed loads
  - [ ] Implement progressive loading

- [ ] **35. Add haptic feedback**
  - [ ] Import expo-haptics
  - [ ] Add to button presses
  - [ ] Add to important actions

---

## ✅ VALIDATION COMMANDS

Run after each phase:

```bash
cd NamecardMobile

# Check TypeScript
npm run type:check

# Run tests
npm test

# Run linting (after Phase 2)
npm run lint

# Check coverage
npm test -- --coverage

# All checks at once
npm run type:check && npm test && npm run lint
```

---

## 🎯 SUCCESS CRITERIA

| Metric | Current | Target | Phase |
|--------|---------|--------|-------|
| TypeScript Errors | 10 | 0 | Phase 2 ✅ |
| Test Pass Rate | 25% | 100% | Phase 2 ✅ |
| Test Coverage | 1.52% | 90% | Phase 4 ✅ |
| ESLint Errors | N/A | 0 | Phase 2 ✅ |
| Security Vulnerabilities | 5 | 0 | Phase 1 ✅ |
| Accessibility Score | 30% | 100% | Phase 3 ✅ |

---

## 📅 TIMELINE ESTIMATE

- **Phase 1 (Critical)**: 4-6 hours
- **Phase 2 (High Priority)**: 2-3 days
- **Phase 3 (Medium Priority)**: 1 week
- **Phase 4 (Testing)**: 2 weeks
- **Phase 5 (Polish)**: Ongoing

**Total to Production Ready**: 3-4 weeks

---

## 🚨 BLOCKERS

None currently - all fixes can be done independently.

**Dependencies**:
- User must revoke/regenerate API keys (manual step)
- .env file must exist before moving secrets

---

## 📝 NOTES

- Always run validation commands after each fix
- Commit frequently with descriptive messages
- Test on both iOS and Android after major changes
- Ask Claude Code for help if stuck on any item

---

**Last Updated**: November 3, 2025
**Progress**: Phase 1 - Item 2/9 complete
