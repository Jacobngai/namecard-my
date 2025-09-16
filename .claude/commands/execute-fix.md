# Execute Fix - Safe Implementation with Validation

## Fix PRP file: $ARGUMENTS

Execute a Fix Requirements Prompt with comprehensive safety checks, validation loops, and rollback capability. This command implements fixes while ensuring no regressions or new issues.

## 🛡️ Safety-First Execution Process

### Phase 1: Pre-Fix Safety Checks

#### 1.1 **Current State Snapshot**
```bash
# Document current state
git status > pre-fix-status.txt
git diff > pre-fix-changes.txt

# Create safety branch
git checkout -b fix/$(date +%Y%m%d_%H%M%S)_backup

# Run existing tests (if any)
npm test 2>&1 | tee pre-fix-tests.txt

# Check current errors
npx tsc --noEmit 2>&1 | tee pre-fix-typescript.txt
```

#### 1.2 **Reproduce the Issue**
Before fixing, MUST reproduce:
1. Follow exact reproduction steps
2. Capture error messages/screenshots
3. Document affected features
4. Note current behavior

#### 1.3 **Impact Analysis**
```typescript
// Check all files that import the broken module
const affectedFiles = [
  // List all files that could be affected
];

// Test each affected feature
for (const feature of affectedFeatures) {
  testFeature(feature);
  documentCurrentBehavior(feature);
}
```

### Phase 2: Incremental Fix Implementation

#### 2.1 **Micro-Commit Strategy**
```bash
# Make small, reversible changes
git add -p  # Stage specific lines
git commit -m "fix: Part 1 - Add null checks"

# Test after EACH micro-commit
npm test
npx expo start --clear

# If something breaks, easy rollback
git revert HEAD
```

#### 2.2 **Progressive Enhancement**
```typescript
// Step 1: Add logging (non-breaking)
console.warn('[FIX] Monitoring issue at:', location);

// Step 2: Add defensive checks (safe)
if (!data) {
  console.error('[FIX] Data missing, using fallback');
  data = defaultData;
}

// Step 3: Fix core issue (careful)
try {
  // Original problematic code with fix
  const result = await fixedOperation();
} catch (error) {
  // Step 4: Add comprehensive fallback
  console.error('[FIX] Operation failed, fallback activated:', error);
  return cachedResult || minimalDefault;
}
```

#### 2.3 **Continuous Validation**
After EACH change:
```bash
# Type check
npx tsc --noEmit || rollback

# Lint check
npm run lint || rollback

# Quick functionality test
node -e "console.log('Quick test passed')"

# Memory check
ps aux | grep expo
```

### Phase 3: Testing Matrix

#### 3.1 **Offline Testing Protocol**
```bash
# CRITICAL: Test offline FIRST
1. Enable airplane mode
2. Clear app cache
3. Test the fix:
   - Original issue should be resolved
   - All features should work
   - No new errors appear
4. Document results
```

#### 3.2 **Online Testing Protocol**
```bash
# Test with network
1. Disable airplane mode
2. Test sync functionality
3. Verify no duplicates
4. Check Supabase logs
5. Monitor network traffic
```

#### 3.3 **Edge Case Testing**
```javascript
// Test matrix - MUST ALL PASS
const testCases = [
  { scenario: "No data", data: null },
  { scenario: "Empty array", data: [] },
  { scenario: "Corrupted data", data: { corrupted: true } },
  { scenario: "Large dataset", data: generateLarge(10000) },
  { scenario: "Rapid clicks", action: rapidFire(10) },
  { scenario: "Network timeout", network: "slow-3g" },
  { scenario: "App background", state: "background" },
  { scenario: "Low memory", memory: "limited" }
];

for (const test of testCases) {
  const result = await runTest(test);
  if (!result.passed) {
    rollback();
    break;
  }
}
```

### Phase 4: Regression Prevention

#### 4.1 **Automated Checks**
```typescript
// Add regression test
describe('Issue #XXX Prevention', () => {
  it('should not crash when offline', async () => {
    // Simulate offline
    jest.mock('@react-native-community/netinfo', () => ({
      fetch: () => Promise.resolve({ isConnected: false })
    }));

    // Test the previously broken flow
    const result = await problematicFunction();

    // Assert fix works
    expect(result).toBeDefined();
    expect(result).not.toThrow();
  });
});
```

#### 4.2 **Guard Rails**
```typescript
// Add permanent guards
export function safeguardedOperation(data: any) {
  // Validation layer
  if (!isValidData(data)) {
    console.error('[GUARD] Invalid data blocked');
    return DEFAULT_SAFE_VALUE;
  }

  // Circuit breaker pattern
  if (failureCount > 3) {
    console.error('[GUARD] Circuit breaker activated');
    return CACHED_VALUE;
  }

  // Proceed with extra monitoring
  try {
    const result = operation(data);
    failureCount = 0; // Reset on success
    return result;
  } catch (error) {
    failureCount++;
    logError(error);
    return FALLBACK_VALUE;
  }
}
```

### Phase 5: Validation & Verification

#### 5.1 **Comprehensive Validation Checklist**
```markdown
## Pre-Deployment Validation

### Code Quality ✓
- [ ] TypeScript: npx tsc --noEmit (0 errors)
- [ ] Linting: npm run lint (0 warnings)
- [ ] Formatting: npx prettier --check .
- [ ] No console.logs in production code
- [ ] All TODOs addressed

### Functionality ✓
- [ ] Original issue CANNOT be reproduced
- [ ] Feature works offline completely
- [ ] Feature works online correctly
- [ ] Sync works without duplicates
- [ ] No new error messages

### Performance ✓
- [ ] Load time: < 500ms (measured)
- [ ] Memory: Stable (no leaks)
- [ ] CPU: < 60% usage
- [ ] FPS: Maintains 60fps
- [ ] Battery: No excessive drain

### Regression ✓
- [ ] All existing features tested
- [ ] No broken imports
- [ ] No circular dependencies
- [ ] Data integrity maintained
- [ ] UI/UX unchanged (unless intended)

### Platform ✓
- [ ] iOS: Tested on simulator
- [ ] Android: Tested on emulator
- [ ] Expo Go: Works correctly
- [ ] Web (if applicable): No errors
```

#### 5.2 **Final Safety Verification**
```bash
# Complete app test
npm run test:all

# Build verification
npx expo prebuild --clear
npx expo run:ios --configuration Release
npx expo run:android --variant release

# Performance profiling
npx react-devtools
# Check for memory leaks, unnecessary renders
```

### Phase 6: Deployment & Monitoring

#### 6.1 **Staged Rollout**
```typescript
// Feature flag for gradual rollout
const ENABLE_FIX = {
  development: true,
  staging: true,
  production: false // Enable after verification
};

if (ENABLE_FIX[environment]) {
  // New fixed code
} else {
  // Original code (safe fallback)
}
```

#### 6.2 **Monitoring Setup**
```typescript
// Add telemetry
const monitorFix = () => {
  analytics.track('fix_applied', {
    issue: 'ISSUE_ID',
    version: '1.0.0',
    timestamp: new Date()
  });

  // Monitor for recurrence
  if (errorOccurred) {
    analytics.track('fix_failed', {
      error: error.message,
      stack: error.stack
    });

    // Auto-rollback if critical
    if (isCritical(error)) {
      disableFix();
      notifyTeam();
    }
  }
};
```

## 🚨 Emergency Procedures

### If Fix Causes Critical Issue:
```bash
# Immediate rollback
git revert HEAD --no-edit
git push origin main --force-with-lease

# Disable feature flag
echo "ENABLE_FIX=false" >> .env

# Clear user cache
AsyncStorage.clear();

# Notify users (if needed)
Alert.alert('Maintenance', 'Applying critical fix...');
```

### If Partial Success:
```typescript
// Implement graceful degradation
try {
  // Try new fix
  return await newFixedMethod();
} catch (fixError) {
  console.warn('Fix failed, using fallback');
  try {
    // Fallback to old method
    return await oldMethod();
  } catch (oldError) {
    // Last resort
    return minimalFunctionality();
  }
}
```

## 📊 Success Metrics

Track these metrics post-fix:
1. **Error Rate**: Should decrease to 0
2. **Performance**: Should maintain or improve
3. **User Reports**: No new complaints
4. **Crash Rate**: Should not increase
5. **Memory Usage**: Should be stable

## 🎯 Fix Completion Criteria

The fix is ONLY complete when:
- [ ] Issue 100% resolved
- [ ] Zero regressions
- [ ] All tests pass
- [ ] Offline mode perfect
- [ ] Performance maintained
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Monitoring in place
- [ ] Rollback plan ready
- [ ] Team notified

## 💡 Best Practices

1. **Never rush a fix** - Better to be thorough
2. **Test more than you code** - 80% testing, 20% coding
3. **Document everything** - Future you will thank you
4. **Small commits** - Easy to revert
5. **Monitor after deploy** - Watch for 24 hours

## 📝 Example Usage

```bash
# Execute a fix with full validation
/execute-fix NamecardMobile/PRPs/fix-camera-crash.prp.md

# Execute with extra caution
/execute-fix NamecardMobile/PRPs/fix-data-loss.prp.md --extra-validation

# Execute with rollback prepared
/execute-fix NamecardMobile/PRPs/fix-sync-issue.prp.md --prepare-rollback
```

**Remember**: A rushed fix often creates two new problems. Take time, be thorough, and validate completely!