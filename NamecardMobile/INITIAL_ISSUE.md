# INITIAL Issue Report Template for NAMECARD.MY

## 🔴 ISSUE DESCRIPTION
[Describe what's broken. Be specific about what should happen vs what actually happens]

Example:
- Camera crashes when taking photo offline
- Contacts duplicate after sync
- App freezes when scrolling large contact list

## 📱 REPRODUCTION STEPS

### Steps to Reproduce:
1. [First action - be very specific]
2. [Second action - include exact values]
3. [Third action - note timing if relevant]
4. [Error occurs - describe what user sees]

### Example:
1. Put phone in airplane mode
2. Open app and go to Camera tab
3. Tap capture button
4. App crashes with white screen

## 🎯 EXPECTED BEHAVIOR
[What SHOULD happen when following these steps]

Example:
- Camera should capture image offline
- Image should save locally
- No errors should appear

## 🐛 ACTUAL BEHAVIOR
[What ACTUALLY happens - include error messages]

Example:
- App shows "Authentication required" error
- Screen goes white
- App force closes

## 📊 ENVIRONMENT DETAILS

### Device Information:
- **Platform**: iOS / Android
- **OS Version**: [e.g., iOS 16.5 / Android 13]
- **Device Model**: [e.g., iPhone 14 / Samsung S22]
- **App Version**: [from package.json]
- **Expo SDK**: [version number]

### Network State:
- **Offline**: Yes / No
- **WiFi**: Yes / No
- **Mobile Data**: Yes / No
- **VPN**: Yes / No

### User State:
- **Logged In**: Yes / No
- **Subscription**: Free / Pro / Enterprise
- **Data Size**: [number of contacts]

## 📸 EVIDENCE

### Error Messages:
```
[Paste exact error message here]
Example:
TypeError: Cannot read property 'id' of undefined
  at ContactService.createContact (contactService.ts:45)
  at CameraScreen.handleCapture (CameraScreen.tsx:123)
```

### Screenshots:
[Attach or describe screenshots]
- Screenshot 1: [Description]
- Screenshot 2: [Description]

### Console Logs:
```
[Paste relevant console output]
```

### Network Logs:
```
[Any failed API calls]
```

## 🔍 ADDITIONAL CONTEXT

### When Did It Start:
- First occurred: [Date/Version]
- Frequency: Always / Sometimes / Rarely
- Pattern: [Any patterns noticed]

### What Changed:
- Recent app updates: [List any]
- Recent phone updates: [OS updates]
- Recent actions: [What user did before issue]

### Related Issues:
- Similar problems: [List any related issues]
- Workarounds tried: [What user attempted]

## 🎭 IMPACT ASSESSMENT

### Severity:
- [ ] **CRITICAL** - App unusable, data loss
- [ ] **HIGH** - Major feature broken
- [ ] **MEDIUM** - Feature partially broken
- [ ] **LOW** - Minor inconvenience

### Affected Users:
- [ ] All users
- [ ] Specific platform (iOS/Android)
- [ ] Specific user tier (Free/Pro)
- [ ] Specific conditions (offline/online)

### Business Impact:
- User experience: [How bad is it]
- Data integrity: [Any data risks]
- Security: [Any security concerns]

## 🔧 INITIAL INVESTIGATION

### Suspected Cause:
[Your hypothesis about what might be wrong]

Example:
- Missing offline check in camera component
- Authentication required for LocalStorage
- Circular dependency causing crash

### Files to Check:
```
NamecardMobile/
├── components/CameraScreen.tsx    # Line 123 - handleCapture
├── services/contactService.ts     # Line 45 - createContact
└── services/localStorage.ts       # Storage operations
```

### Related Code:
```typescript
// Potentially problematic code
const handleCapture = async () => {
  const user = await requireAuth(); // This might be the issue
  // ...
};
```

## 🚑 ATTEMPTED FIXES

### What I've Tried:
1. [First attempt - what happened]
2. [Second attempt - result]
3. [Third attempt - outcome]

### What Worked Temporarily:
- [Any temporary workarounds]

### What Made It Worse:
- [Any attempts that backfired]

## ✅ ACCEPTANCE CRITERIA

The issue is fixed when:
- [ ] Original reproduction steps don't cause error
- [ ] Feature works offline
- [ ] Feature works online
- [ ] No regressions in related features
- [ ] Performance not degraded
- [ ] Fix works on both iOS and Android

## 💡 SUGGESTIONS

### Potential Solutions:
1. [Idea 1 - with reasoning]
2. [Idea 2 - with pros/cons]
3. [Idea 3 - with implementation notes]

### Prevention Ideas:
- [How to prevent similar issues]
- [Testing that could catch this]
- [Patterns to avoid]

---

## 🎯 For Common Issues

### Issue: Offline Functionality Broken
```markdown
## ISSUE DESCRIPTION
Feature requires network when it should work offline

## SUSPECTED CAUSE
- Missing LocalStorage fallback
- Direct Supabase call without offline check
- Authentication required for basic feature
```

### Issue: Sync Creates Duplicates
```markdown
## ISSUE DESCRIPTION
Contacts appear twice after sync

## SUSPECTED CAUSE
- Missing deduplication logic
- ID mismatch (local vs remote)
- Race condition in sync queue
```

### Issue: Performance Degradation
```markdown
## ISSUE DESCRIPTION
App becomes slow with 100+ contacts

## SUSPECTED CAUSE
- Missing virtualization in list
- Re-rendering entire list on changes
- Memory leaks in components
```

### Issue: Authentication Errors
```markdown
## ISSUE DESCRIPTION
"Authentication required" when it shouldn't be

## SUSPECTED CAUSE
- Feature not using ContactService
- Direct Supabase calls
- Missing guest mode handling
```

---

**Remember**: The more details you provide, the better the fix will be!