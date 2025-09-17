# Fix PRP - Comprehensive Issue Resolution

## Issue file: $ARGUMENTS

Generate an ultra-comprehensive Fix Requirements Prompt (FRP) for debugging and fixing issues in NAMECARD.MY. This command performs deep root cause analysis and creates a validated fix plan.

## 🔬 Deep Analysis Process

### Phase 1: Issue Investigation (ULTRA-THOROUGH)

#### 1.1 **Symptom Analysis**
- Read error messages/bug reports completely
- Identify ALL affected features
- Document reproduction steps
- Note patterns (offline vs online, iOS vs Android)
- Check if issue is intermittent or consistent
- Review user reports/complaints

#### 1.2 **Code Archaeology**
```bash
# Search for ALL related code
- grep -r "error_keyword" NamecardMobile/
- grep -r "function_name" --include="*.tsx" --include="*.ts"
- git log -p -- affected_file.tsx  # Check recent changes
- git blame affected_file.tsx      # Find who changed what
```

#### 1.3 **Dependency Analysis**
- Check package versions in package.json
- Review recent npm/expo updates
- Identify circular dependencies
- Check for missing dependencies
- Review native module compatibility

#### 1.4 **Architecture Review**
- Trace complete data flow
- Map component hierarchy
- Identify service interactions
- Check state management
- Review offline/online transitions

### Phase 2: Root Cause Identification

#### 2.1 **Code Flow Tracing**
```
User Action → Component → Service → Storage → Sync
     ↓            ↓          ↓         ↓        ↓
  [Where does it break? Why? What's the exact error?]
```

#### 2.2 **Common Root Causes to Check**
- [ ] Offline-first violation (requires network)
- [ ] Authentication dependency (requires login)
- [ ] State management issue (stale data)
- [ ] Async/await problems (race conditions)
- [ ] Type mismatches (TypeScript errors)
- [ ] Platform differences (iOS vs Android)
- [ ] Memory leaks (retained references)
- [ ] Circular dependencies (import cycles)
- [ ] Missing error handling
- [ ] API changes (Supabase/Expo updates)

#### 2.3 **Impact Assessment**
- List ALL affected features
- Identify downstream dependencies
- Check for data corruption risks
- Assess user experience impact
- Evaluate security implications

### Phase 3: Solution Design

#### 3.1 **Multiple Solution Strategies**
```markdown
## Solution A: Minimal Fix
- Change only broken line
- Pros: Quick, low risk
- Cons: May not address root cause

## Solution B: Refactor Component
- Restructure problematic component
- Pros: Cleaner code, better pattern
- Cons: More testing needed

## Solution C: Architecture Change
- Modify service layer
- Pros: Fixes similar issues globally
- Cons: High risk, needs extensive testing
```

#### 3.2 **Risk Analysis**
For each solution:
- Breaking changes risk: Low/Medium/High
- Regression risk: Low/Medium/High
- Performance impact: Positive/Neutral/Negative
- Offline functionality: Improved/Same/Degraded

### Phase 4: Implementation Blueprint

#### 4.1 **Pre-Fix Checklist**
```bash
# Backup current state
git stash
git checkout -b fix/issue-name

# Document current behavior
npm test -- --coverage  # If tests exist
npx expo start          # Test current state

# Screenshot/record issue
```

#### 4.2 **Fix Implementation Steps**
```typescript
// Step 1: Add defensive checks
if (!data || !data.id) {
  console.warn('Invalid data, using defaults');
  return defaultValue;
}

// Step 2: Fix the core issue
try {
  // Previous broken code
  // const result = await dangerousOperation();

  // Fixed code with proper handling
  const result = await safeOperation().catch(err => {
    console.error('Operation failed:', err);
    return fallbackValue;
  });
} catch (error) {
  // Step 3: Always have fallback
  return cachedValue || defaultValue;
}

// Step 4: Add monitoring
console.log('[FIX] Issue resolved at:', new Date());
```

#### 4.3 **Testing Strategy**
```bash
# 1. Unit test the fix
npm test specific-file.test.ts

# 2. Test offline mode
- Enable airplane mode
- Test complete feature flow
- Verify no new errors

# 3. Test online mode
- Disable airplane mode
- Test sync functionality
- Check for duplicates

# 4. Regression testing
- Test related features
- Check performance
- Verify memory usage

# 5. Edge cases
- Test with no data
- Test with corrupt data
- Test with slow network
- Test rapid actions
```

### Phase 5: Validation & Verification

#### 5.1 **Comprehensive Validation Gates**
```bash
# Code Quality
npx tsc --noEmit           # No type errors
npm run lint               # No lint issues

# Functionality
- [ ] Original issue fixed
- [ ] Works offline
- [ ] Works online
- [ ] Syncs correctly
- [ ] No new errors

# Performance
- [ ] Load time < 500ms
- [ ] Memory stable
- [ ] No UI freezing
- [ ] Smooth animations

# Regression
- [ ] All existing features work
- [ ] No broken imports
- [ ] No infinite loops
- [ ] No data loss
```

#### 5.2 **Rollback Plan**
```bash
# If fix causes issues:
git stash               # Save current work
git checkout main       # Return to stable
git branch -D fix/issue # Remove fix branch

# Alternative quick disable:
if (ENABLE_FIX) {
  // New fix code
} else {
  // Original code
}
```

## 📝 Fix PRP Template Output

The command will generate:

```markdown
# FIX PRP: [Issue Description]

## 🔴 Problem Statement
- **Symptoms**: [What users see]
- **Impact**: [How many users, which features]
- **Severity**: Critical/High/Medium/Low
- **First Reported**: [Date/Version]

## 🔍 Root Cause Analysis

### The Issue
[Detailed explanation of what's broken and why]

### Code Location
- Primary: `path/to/broken/file.tsx:lineNumber`
- Related: [List of affected files]

### Root Cause
[Exact reason - e.g., "Missing null check causes crash when offline"]

## 🛠️ Fix Strategy

### Chosen Solution: [Solution Name]
[Why this approach was selected]

### Implementation Plan
1. [Step-by-step fix process]
2. [Include code snippets]
3. [Reference patterns to follow]

### Code Changes
\`\`\`typescript
// Before (broken)
[Original code]

// After (fixed)
[Fixed code with comments explaining changes]
\`\`\`

## 🧪 Testing Protocol

### Reproduction Test
1. [Steps to reproduce original issue]
2. [Confirm it's broken]

### Fix Verification
1. [Apply fix]
2. [Test same steps]
3. [Confirm it's fixed]

### Regression Tests
- [ ] Feature A still works
- [ ] Feature B still works
- [ ] Performance unchanged

## ⚠️ Risk Assessment
- **Breaking Changes**: None/List them
- **Migration Needed**: No/Yes - steps
- **Rollback Plan**: [How to undo if needed]

## 📊 Success Metrics
- Issue no longer reproducible
- No new errors introduced
- Performance within targets
- All tests pass

## 📝 Documentation Updates
- [ ] Update relevant comments
- [ ] Update README if needed
- [ ] Add to troubleshooting guide
```

## 🎯 Common NAMECARD.MY Issues & Fixes

### Issue Type 1: Offline Functionality Broken
**Check**: LocalStorage operations
**Common Fix**: Add offline-first fallback
```typescript
// Always check local first
const data = await LocalStorage.getData().catch(() => []);
```

### Issue Type 2: Authentication Errors
**Check**: Guest mode handling
**Common Fix**: Make auth optional
```typescript
if (this.hasAuth) {
  // Optional sync
} else {
  // Continue offline
}
```

### Issue Type 3: Circular Dependencies
**Check**: Import cycles
**Common Fix**: Extract shared code
```typescript
// Create shared client/config file
export const sharedClient = createClient();
```

### Issue Type 4: State Management Issues
**Check**: Stale state, race conditions
**Common Fix**: Use proper hooks
```typescript
useEffect(() => {
  let mounted = true;
  loadData().then(data => {
    if (mounted) setState(data);
  });
  return () => { mounted = false; };
}, []);
```

## 🚀 Usage Examples

```bash
# Fix a specific error
/fix-prp ERROR_REPORT.md

# Fix a broken feature
/fix-prp ISSUE_CAMERA_NOT_WORKING.md

# Fix performance issue
/fix-prp PERFORMANCE_SLOW_LOAD.md

# Fix sync problems
/fix-prp SYNC_DUPLICATES.md
```

## 🔄 Continuous Improvement

After fix is complete:
1. Document the issue and fix
2. Add regression test
3. Update troubleshooting guide
4. Consider preventive measures
5. Share learnings with team

## 💡 Fix Philosophy

1. **Understand completely** before fixing
2. **Fix root cause**, not symptoms
3. **Test thoroughly**, especially offline
4. **Document everything** for future
5. **Prevent recurrence** with better patterns

## ⚡ Quick Debug Commands

```bash
# Check recent changes
git diff HEAD~5

# Find error in logs
adb logcat | grep -i error  # Android
xcrun simctl spawn booted log stream | grep -i error  # iOS

# Check memory usage
npx expo start --no-dev --minify

# Profile performance
React DevTools Profiler
```

## 🎯 Success Criteria

The fix is complete when:
- [ ] Original issue cannot be reproduced
- [ ] All validation gates pass
- [ ] No regressions introduced
- [ ] Works offline and online
- [ ] Performance maintained or improved
- [ ] Code is cleaner than before
- [ ] Fix is documented
- [ ] Tests added to prevent recurrence

**Remember**: A good fix not only solves the problem but makes the codebase better and prevents similar issues in the future!