# Validation Workflow Example

## What Just Happened

This demonstrates the **MANDATORY POST-DEVELOPMENT VALIDATION** workflow defined in CLAUDE.md.

### Step 1: Type Check ✅ (Completed)
```bash
npm run type:check
```

**Result**: ❌ Found 88 TypeScript errors

### Step 2: Auto-Fix Workflow (In Progress)

According to CLAUDE.md rules, Claude Code must immediately fix all errors:

#### Fixes Applied So Far:

1. **Fixed component export errors** (7 files)
   - `components/screens/index.ts` - Changed default exports to named exports
   - `components/business/index.ts` - Changed default exports to named exports
   - `components/common/index.ts` - Changed default exports to named exports

2. **Identified broken test imports** (4 files need updating)
   - `__tests__/auth/AuthIntegration.test.tsx`
   - `__tests__/auth/ForgotPassword.test.tsx`
   - `__tests__/auth/Login.test.tsx`
   - `__tests__/auth/Register.test.tsx`

#### Remaining Errors to Fix:

**Category 1: Test Import Paths** (4 errors)
```typescript
// OLD: import { AuthScreen } from '../../components/AuthScreen'
// NEW: import { AuthScreen } from '../../components/screens/AuthScreen'
```

**Category 2: Component Import Paths** (~30 errors)
Components trying to import from old paths:
- `./ui/Input` → needs creating or updating path
- `./ui/Button` → needs creating or updating path
- `../services/` → some services need updating
- `../types` → needs path verification

**Category 3: Service/Hook Errors** (~20 errors)
- `supabase` export needs fixing
- `CameraType` enum usage issues
- Type annotations missing

**Category 4: Test Utilities** (5 errors)
- `waitForAsync` duplicate declaration
- Test matchers type issues

### Step 3: After All Fixes Complete

Once all TypeScript errors are resolved, the workflow continues:

```bash
# Re-run type check to verify
npm run type:check → Should show 0 errors

# Run tests
npm test → Fix any failures

# Deploy to emulator
npm run android → Verify no runtime errors
```

### Step 4: Final Validation Report

Claude Code will provide:

```
✅ TypeScript: 0 errors
✅ Tests: X/X passing
✅ Build: Successfully bundled
✅ Emulator: No runtime errors
✅ Feature: [Specific changes] working correctly
```

## How This Workflow Helps You

### Before CLAUDE.md Rules:
1. Make a change
2. Maybe it works, maybe it doesn't
3. Find out later when something breaks
4. Spend time debugging

### After CLAUDE.md Rules:
1. Make a change
2. Claude Code automatically validates
3. Claude Code auto-fixes any issues
4. You get a working, tested feature every time

## The Key Rule

From CLAUDE.md:

> **DO NOT** consider a task complete until:
> - ✅ TypeScript compiles without errors
> - ✅ All tests pass
> - ✅ App runs in emulator without crashes
> - ✅ The specific feature works as expected

## Example Session

```
User: "Add a delete button to contacts"

Claude Code:
1. Adds the delete button code
2. Runs npm run type:check → Finds 2 type errors → Fixes them
3. Runs npm test → 1 test fails → Fixes it → Re-runs → Passes
4. Runs npm run android → App loads → Verifies button works
5. Reports: "✅ Delete button added, verified working in emulator"
```

## Current Status

🔄 **Validation in progress**
- Type check: ❌ 88 errors found
- Fixes applied: ✅ 7 files corrected
- Remaining: ~81 errors to fix

Once complete, Claude Code will run the full validation checklist and provide a green checkmark report.

---

**This is the power of automated validation - every change is verified before you see it!**