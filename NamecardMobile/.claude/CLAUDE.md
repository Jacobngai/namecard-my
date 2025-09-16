# CLAUDE.md - NAMECARD.MY Context Engineering Guide

This file provides comprehensive guidance to Claude Code for developing NAMECARD.MY using Context Engineering methodology.

## 🎯 Project Overview

NAMECARD.MY is a **React Native + Expo** smart networking app with **offline-first architecture** for business card scanning and contact management. The app prioritizes local functionality with optional Supabase sync.

### Core Principles
1. **Offline-First**: Everything works without internet
2. **Local Storage Primary**: Supabase is backup only
3. **No Auth Required**: Basic features work in guest mode
4. **Instant Feedback**: No network delays in UI
5. **Graceful Degradation**: Never crash, always fallback

## 🏗️ Architecture & Patterns

### Offline-First Flow (MUST FOLLOW)
```
User Action → LocalStorage → ContactService → [Sync Queue] → Supabase (optional)
```

### Directory Structure
```
NamecardMobile/
├── .claude/                    # Context Engineering setup
│   ├── CLAUDE.md              # This file
│   ├── commands/              # Custom commands
│   │   ├── generate-prp.md   # Generate PRPs from requirements
│   │   └── execute-prp.md    # Execute PRPs with validation
│   └── agents/                # Specialized agents (future)
├── PRPs/                      # Product Requirement Prompts
│   └── templates/             # Reusable templates
├── components/                # React Native components
├── services/                  # Business logic
│   ├── localStorage.ts        # Primary storage (ALWAYS USE)
│   ├── contactService.ts     # Unified service layer
│   └── supabase.ts           # Optional backup
└── utils/                     # Helper functions
```

## 📋 Development Rules

### 1. Context Engineering Workflow
```bash
# For new features:
1. Create INITIAL.md with requirements
2. Run: /generate-prp INITIAL.md
3. Review generated PRP
4. Run: /execute-prp PRPs/[feature].prp.md
5. Validate with gates
```

### 2. Offline-First Implementation
```typescript
// ALWAYS follow this pattern:
export class ServiceName {
  static async operation(data: any): Promise<Result> {
    // 1. Local operation FIRST
    const localResult = await LocalStorage.operation(data);

    // 2. Queue for sync (non-blocking)
    if (isOnline && hasAuth) {
      SyncQueue.add('operation', localResult);
    }

    // 3. Return immediately
    return localResult;
  }
}
```

### 3. Component Pattern
```typescript
export function ComponentName({ props }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOfflineFirst();
  }, []);

  const loadOfflineFirst = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Always load from local first
      const data = await ContactService.getData();
      // Handle data
    } catch (err) {
      // Graceful fallback, never crash
      setError('Unable to load data');
      console.warn('Load failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView>
      {isLoading && <ActivityIndicator />}
      {error && <Text>{error}</Text>}
      {/* Main content */}
    </SafeAreaView>
  );
}
```

## 🧪 Validation Requirements

### Every Implementation Must Pass
```bash
# 1. TypeScript Check
npx tsc --noEmit

# 2. Lint Check
npm run lint

# 3. Build Check
npx expo prebuild --clear

# 4. Offline Test
# - Enable airplane mode
# - Test entire feature
# - Must work perfectly

# 5. Sync Test (if applicable)
# - Disable airplane mode
# - Verify data syncs
# - No duplicates
```

## ⚠️ Critical Rules

### NEVER Do These
- ❌ Require authentication for basic features
- ❌ Block UI waiting for network response
- ❌ Throw unhandled errors that crash app
- ❌ Make Supabase calls without offline fallback
- ❌ Skip testing in airplane mode
- ❌ Use direct Supabase calls in components

### ALWAYS Do These
- ✅ Save to LocalStorage first
- ✅ Test offline before online
- ✅ Handle errors gracefully
- ✅ Provide loading states
- ✅ Queue operations for sync
- ✅ Use ContactService for all data operations

## 📚 Key Files Reference

### Services (Business Logic)
- `services/localStorage.ts` - Primary storage layer
- `services/contactService.ts` - Unified data access
- `services/supabaseClient.ts` - Shared client instance
- `services/authManager.ts` - Optional authentication

### Components (UI Examples)
- `components/CameraScreen.tsx` - Camera implementation
- `components/ContactList.tsx` - List rendering pattern
- `components/ContactForm.tsx` - Form handling pattern
- `App.tsx` - Navigation and state management

### Documentation
- `INITIAL.md` - Feature request template
- `PRPs/templates/prp-base.md` - PRP template
- `OFFLINE_TEST_VERIFICATION.md` - Testing guide
- `FIX_SUMMARY.md` - Recent architecture changes
- `DATABASE-SCHEMA.md` - Supabase structure

## 🚀 Common Tasks

### Add New Feature
```bash
1. Create INITIAL_[FEATURE].md
2. /generate-prp INITIAL_[FEATURE].md
3. Review PRPs/[feature].prp.md
4. /execute-prp PRPs/[feature].prp.md
```

### Fix Bug
```bash
1. Identify issue in offline mode first
2. Check LocalStorage operations
3. Verify ContactService logic
4. Test fix offline
5. Verify sync still works
```

### Add New Screen
```typescript
// 1. Create component following pattern
export function NewScreen({ navigation }) {
  // Use existing patterns from CameraScreen.tsx
}

// 2. Add to navigation in App.tsx
<Stack.Screen name="NewScreen" component={NewScreen} />

// 3. Test offline first
```

## 📊 Performance Targets

### Required Metrics
- App Cold Start: <3 seconds
- Screen Load: <500ms
- Contact Save: <100ms (local)
- Search Response: <50ms
- Memory Usage: <150MB
- Crash Rate: <0.1%

### User Experience
- Instant feedback on all actions
- Clear loading indicators
- Helpful error messages
- Smooth 60fps animations
- Works in airplane mode

## 🔄 Sync Strategy

### When Online + Authenticated
1. Background sync runs automatically
2. No UI blocking
3. Silent operation
4. Retry on failure
5. Handle conflicts gracefully

### Sync Queue Pattern
```typescript
// Add to queue
await LocalStorage.addToSyncQueue({
  action: 'create',
  data: localContact,
  timestamp: Date.now()
});

// Process queue (background)
const queue = await LocalStorage.getSyncQueue();
for (const item of queue) {
  try {
    await syncToSupabase(item);
    await LocalStorage.removeFromSyncQueue(item.id);
  } catch {
    // Retry later
  }
}
```

## 🛠️ Development Commands

### Testing
```bash
# Run type checks
npx tsc --noEmit

# Run linter
npm run lint

# Start development
npx expo start

# Clear cache and rebuild
npx expo start --clear
```

### Context Engineering
```bash
# Generate PRP from requirements
/generate-prp INITIAL_FEATURE.md

# Execute PRP with validation
/execute-prp PRPs/feature.prp.md

# Validate specific feature
/validate-feature feature-name
```

## 📝 Commit Guidelines

### Message Format
```
type: brief description

- Detail 1
- Detail 2

Tested: offline ✓, online ✓
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `offline`: Offline functionality
- `sync`: Sync improvements
- `perf`: Performance optimization
- `refactor`: Code restructuring

## 🎯 Success Checklist

Before any feature is complete:
- [ ] Works 100% offline
- [ ] Data saves locally first
- [ ] Syncs when online (if applicable)
- [ ] No auth errors in guest mode
- [ ] All validation gates pass
- [ ] Performance targets met
- [ ] Error handling tested
- [ ] Loading states implemented
- [ ] Documentation updated
- [ ] Tested on iOS and Android

## 💡 Quick Reference

### Local Storage Keys
```typescript
const CONTACTS_KEY = '@namecard/contacts';
const SYNC_QUEUE_KEY = '@namecard/sync_queue';
const USER_PREFS_KEY = '@namecard/user_prefs';
```

### Common Imports
```typescript
import { ContactService } from './services/contactService';
import { LocalStorage } from './services/localStorage';
import { Contact } from './types';
```

### Error Handling Pattern
```typescript
try {
  // Try operation
} catch (error) {
  console.warn('Operation failed:', error);
  // Return safe default
  return defaultValue;
}
```

---

**Remember**: The app MUST work offline first. Supabase is optional backup only. When in doubt, prioritize local functionality over cloud features.