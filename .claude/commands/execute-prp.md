# Execute PRP for NAMECARD.MY

## PRP file: $ARGUMENTS

Execute a Product Requirements Prompt for NAMECARD.MY with validation loops and self-correction. This command implements features following the offline-first architecture and React Native patterns.

## 🚀 Execution Process

### 1. **Load PRP Context**
   - Read the specified PRP file
   - Load all referenced documentation
   - Identify validation gates
   - Map to existing codebase patterns

### 2. **Pre-Implementation Checks**
   - Verify offline-first architecture is maintained
   - Check for required dependencies
   - Ensure no breaking changes to existing features
   - Validate environment setup

### 3. **Implementation Steps**

#### Phase 1: Setup & Planning
```bash
# Check current state
npm list       # Verify dependencies
npx tsc --noEmit  # Type check existing code

# Plan implementation
- List files to create/modify
- Identify integration points
- Note potential conflicts
```

#### Phase 2: Core Implementation
Follow the PRP blueprint exactly:
1. Create/modify files in order specified
2. Implement offline-first (LocalStorage first)
3. Add Supabase sync only if online
4. Follow existing patterns from referenced files

#### Phase 3: Validation Loop
```bash
# After each major change:
1. Type check: npx tsc --noEmit
2. Lint: npm run lint
3. Test app: npx expo start
4. Verify offline functionality
```

### 4. **Self-Correction Process**

If validation fails:
1. **Identify error type**:
   - TypeScript errors → Fix types
   - Lint errors → Format code
   - Runtime errors → Debug logic
   - Offline issues → Check LocalStorage

2. **Apply fixes**:
   - Reference similar working code
   - Check documentation again
   - Maintain offline-first principle

3. **Re-validate**:
   - Run validation gates again
   - Test offline mode
   - Verify no regressions

## 🏗️ NAMECARD.MY Architecture Rules

### Must Follow:
1. **Offline-First Flow**:
   ```typescript
   LocalStorage.saveContact() → ContactService.createContact() → [Queue] → SupabaseService
   ```

2. **Component Pattern**:
   ```typescript
   // Functional component with hooks
   export function ComponentName({ props }: Props) {
     const [state, setState] = useState();

     useEffect(() => {
       // Load data offline-first
       loadFromLocal();
     }, []);

     return <View>...</View>;
   }
   ```

3. **Service Pattern**:
   ```typescript
   export class ServiceName {
     static async operation(): Promise<Result> {
       try {
         // Local operation first
         const localResult = await LocalStorage.operation();

         // Queue for sync if online
         if (isOnline) {
           SyncQueue.add(operation);
         }

         return localResult;
       } catch (error) {
         // Always fallback gracefully
         return defaultValue;
       }
     }
   }
   ```

## ✅ Validation Gates

### Required Checks:
```bash
# 1. TypeScript compilation
npx tsc --noEmit

# 2. Linting
npm run lint

# 3. Offline test
# - Turn on airplane mode
# - Test feature completely
# - Should work without errors

# 4. Online sync test (if applicable)
# - Turn off airplane mode
# - Verify data syncs
# - No duplicate operations
```

### Performance Targets:
- App startup: <3 seconds
- Feature response: <500ms
- Memory usage: <150MB
- No memory leaks

## 📋 Implementation Checklist

For each PRP execution:

### Before Starting:
- [ ] Read entire PRP
- [ ] Review referenced files
- [ ] Check offline requirements
- [ ] Verify dependencies installed

### During Implementation:
- [ ] Follow PRP phases in order
- [ ] Maintain offline-first approach
- [ ] Use existing patterns
- [ ] Add proper error handling
- [ ] Include loading states

### After Implementation:
- [ ] All validation gates pass
- [ ] Offline mode tested
- [ ] No regressions found
- [ ] Code follows conventions
- [ ] Documentation updated

## 🛠️ Common Patterns Reference

### 1. Screen Component
```typescript
// See: components/CameraScreen.tsx
export function ScreenName({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);

  // Offline-first data loading
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await ContactService.getContacts();
      // Handle data
    } catch (error) {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView>
      {/* UI components */}
    </SafeAreaView>
  );
}
```

### 2. Service Method
```typescript
// See: services/contactService.ts
static async createContact(data: Partial<Contact>): Promise<Contact> {
  // Save locally first
  const localContact = await LocalStorage.saveContact(data);

  // Queue for sync
  if (this.hasAuth) {
    this.queueSync('create', localContact);
  }

  return localContact;
}
```

### 3. Local Storage
```typescript
// See: services/localStorage.ts
static async saveData(key: string, data: any): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Storage failed:', error);
    // Don't throw - graceful degradation
  }
}
```

## ⚠️ Critical Warnings

### Never Do:
- ❌ Require authentication for basic features
- ❌ Block UI waiting for network
- ❌ Throw errors that crash the app
- ❌ Skip offline testing
- ❌ Break existing features

### Always Do:
- ✅ Test offline first
- ✅ Fallback gracefully
- ✅ Queue operations for sync
- ✅ Show loading states
- ✅ Handle errors silently

## 📊 Success Metrics

Track these for each execution:
1. **Implementation time**: Target <2 hours per PRP
2. **Validation passes**: Target first-try success
3. **Bug count**: Target zero critical bugs
4. **Offline coverage**: Must be 100%
5. **Code quality**: Follows all patterns

## 🔄 Iteration Process

If PRP execution fails:
1. Document what failed
2. Update PRP with missing context
3. Re-execute with corrections
4. Validate all gates again

## 💾 Output

After successful execution:
1. Feature fully implemented
2. All tests passing
3. Offline mode verified
4. Ready for user testing

## 📝 Example Usage

```bash
# Execute a PRP
/execute-prp NamecardMobile/PRPs/ocr-scanning.prp.md

# With specific validation focus
/execute-prp NamecardMobile/PRPs/subscription-system.prp.md --focus=offline

# Skip certain gates (development only)
/execute-prp NamecardMobile/PRPs/distributor-portal.prp.md --skip=performance
```

## 🎯 Final Verification

Before marking complete:
- [ ] Feature works completely offline
- [ ] Syncs correctly when online
- [ ] No authentication errors
- [ ] Performance targets met
- [ ] Code quality standards met
- [ ] Documentation updated
- [ ] No regressions introduced

**Goal**: One-pass implementation with self-correction until all validation gates pass!