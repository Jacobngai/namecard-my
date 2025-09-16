# PRP Template: [Feature Name] for NAMECARD.MY

## 📋 Context & Requirements

### Goal
[Specific, measurable goal for this feature]

### User Story
As a [user type], I want to [action] so that [benefit].

### Constraints
- Must work completely offline
- Support React Native + Expo
- Follow offline-first architecture
- No authentication required for basic features

### Dependencies
- [ ] LocalStorage service (existing)
- [ ] ContactService (existing)
- [ ] [Other services/APIs needed]

## 🏗️ Implementation Blueprint

### Phase 1: Foundation Setup
**Duration**: [X hours]
**Reference Files**:
- `services/localStorage.ts` - Offline storage pattern
- `services/contactService.ts` - Service architecture

#### Tasks:
1. [ ] Create/modify necessary files
2. [ ] Setup data models/types
3. [ ] Initialize storage keys
4. [ ] Add to navigation (if screen)

#### Code Structure:
```typescript
// Example structure to follow
interface FeatureData {
  id: string;
  // ... fields
}

export class FeatureService {
  static async operation(data: Partial<FeatureData>): Promise<FeatureData> {
    // Local first
    const localResult = await LocalStorage.save(data);

    // Queue sync if online
    if (isOnline) {
      SyncQueue.add('operation', localResult);
    }

    return localResult;
  }
}
```

### Phase 2: Core Implementation
**Duration**: [X hours]
**Reference Files**:
- `components/[SimilarComponent].tsx` - UI patterns
- `App.tsx` - Integration points

#### Tasks:
1. [ ] Implement main functionality
2. [ ] Add error handling
3. [ ] Include loading states
4. [ ] Test offline mode

#### Key Implementation Points:
```typescript
// Component pattern
export function FeatureName({ navigation }: Props) {
  const [data, setData] = useState<FeatureData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDataOfflineFirst();
  }, []);

  const loadDataOfflineFirst = async () => {
    setIsLoading(true);
    try {
      // Always local first
      const localData = await FeatureService.getData();
      setData(localData);

      // Optional: trigger background sync
      FeatureService.syncInBackground();
    } catch (error) {
      console.warn('Load failed, using defaults');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView>
      {isLoading ? <ActivityIndicator /> : <Content />}
    </SafeAreaView>
  );
}
```

### Phase 3: Integration & Polish
**Duration**: [X hours]
**Reference Files**:
- `services/supabase.ts` - Backend sync (if needed)
- `utils/[relevant].ts` - Helper functions

#### Tasks:
1. [ ] Integrate with existing features
2. [ ] Add Supabase sync (if applicable)
3. [ ] Optimize performance
4. [ ] Polish UI/UX

## 🧪 Validation Gates

### Build Validation
```bash
# TypeScript compilation
npx tsc --noEmit

# Linting
npm run lint

# Expo prebuild check
npx expo prebuild --clear
```

### Functional Validation
```bash
# Test offline mode
1. Enable airplane mode
2. Test complete feature flow
3. Verify all operations work
4. Check data persistence

# Test sync (if applicable)
1. Disable airplane mode
2. Verify sync triggers
3. Check for duplicates
4. Confirm data integrity
```

### Performance Validation
- [ ] Feature loads in <500ms
- [ ] Memory usage <50MB for feature
- [ ] No memory leaks detected
- [ ] Smooth UI (60fps)

## ✅ Success Criteria

### Must Have
- [ ] Works 100% offline
- [ ] Data persists across app restarts
- [ ] No authentication errors
- [ ] Follows existing patterns
- [ ] All validation gates pass

### Should Have
- [ ] Syncs seamlessly when online
- [ ] Provides user feedback
- [ ] Handles edge cases
- [ ] Includes proper logging

### Nice to Have
- [ ] Animation/transitions
- [ ] Advanced error recovery
- [ ] Analytics tracking
- [ ] Accessibility features

## 📚 Documentation & References

### External Documentation
- [Relevant React Native docs]
- [Expo SDK feature docs]
- [Third-party API docs]

### Internal Documentation
- `OFFLINE_TEST_VERIFICATION.md` - Testing guide
- `FIX_SUMMARY.md` - Recent architecture changes
- `DATABASE-SCHEMA.md` - Data structure

### Code References
- Similar feature: `[path/to/similar/feature]`
- Pattern example: `[path/to/pattern]`
- Integration point: `[path/to/integration]`

## ⚠️ Gotchas & Edge Cases

### Common Issues
1. **Issue**: [Description]
   **Solution**: [How to handle]

2. **Issue**: [Description]
   **Solution**: [How to handle]

### Platform-Specific
- **iOS**: [Specific considerations]
- **Android**: [Specific considerations]

### Performance Considerations
- [Memory management tips]
- [Optimization strategies]
- [Caching approach]

## 🔄 Rollback Plan

If feature causes issues:
1. Feature flag to disable
2. Revert specific commits
3. Clear local storage keys
4. Restore previous navigation

## 📊 Metrics & Monitoring

Track these metrics:
- Feature usage rate
- Error rate
- Performance metrics
- User satisfaction

## 🚀 Deployment Checklist

Before deploying:
- [ ] All tests pass
- [ ] Offline mode verified
- [ ] Performance targets met
- [ ] Documentation updated
- [ ] Team review completed

## 💡 Future Improvements

Potential enhancements:
1. [Enhancement idea 1]
2. [Enhancement idea 2]
3. [Enhancement idea 3]

---

**Confidence Score**: [X/10] for one-pass implementation

**Estimated Time**: [Total hours]

**Risk Level**: Low / Medium / High

**Notes**: [Any additional context for implementer]