# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: Supabase MCP Server Usage

**MANDATORY RULE FOR ALL CLAUDE CODE SESSIONS:**

**ALWAYS use the Supabase MCP server (configured in `.mcp.json`) for ALL database operations.**

- ✅ **DO**: Use MCP tools to run SQL queries, inspect schemas, create tables, fix RLS policies
- ❌ **DO NOT**: Create SQL files and ask the user to run them manually in Supabase Dashboard
- ❌ **DO NOT**: Generate SQL scripts without executing them via MCP

**When you see database errors (foreign key constraints, RLS policies, missing tables, etc.):**
1. Use MCP to diagnose the issue
2. Use MCP to run the fix directly on the database
3. Use MCP to verify the fix worked
4. Report success to the user

**The user should NEVER need to open Supabase Dashboard to run SQL manually.**

---

## Project Overview

WhatsCard 1.0 is a React Native/TypeScript smart networking app focused on business card scanning and contact management with WhatsApp integration. Built with offline-first architecture and Supabase backend.

## Architecture

### Current State (v1.0.0)
- **Platform**: React Native + Expo SDK 53
- **Backend**: Supabase (authentication, database, cloud storage)
- **Database**: Supabase PostgreSQL with RLS policies
- **State Management**: Custom hooks with offline-first LocalStorage
- **OCR**: Google Gemini AI for business card scanning
- **Voice**: OpenAI Whisper for voice notes
- **Storage**: Supabase Storage for card images
- **Styling**: Custom React Native components
- **Data**: LocalStorage with Supabase sync (offline-first)

## Code Structure

### NamecardMobile/ (React Native App)
```
NamecardMobile/
├── App.tsx                    # Main app component with navigation
├── index.ts                   # App entry point
├── app.json                   # Expo static configuration
├── app.config.js              # Expo dynamic config with env vars
├── metro.config.js            # Metro bundler configuration (optimized)
├── jest.config.js             # Jest testing configuration
├── jest.setup.js              # Test setup and mocks
├── tsconfig.json              # TypeScript configuration
│
├── components/                # UI Components (reorganized)
│   ├── screens/              # Main screen components
│   │   ├── AuthScreen.tsx
│   │   ├── CameraScreen.tsx
│   │   ├── ContactList.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── APITestScreen.tsx
│   │   ├── SplashScreen.tsx
│   │   └── index.ts          # Screen exports
│   ├── business/             # Business logic components
│   │   ├── ContactDetailModal.tsx
│   │   ├── ContactForm.tsx
│   │   ├── FloatingActionButton.tsx
│   │   └── index.ts          # Business component exports
│   ├── common/               # Reusable UI components
│   │   ├── .tsx
│   │   ├── TopLoader.tsx
│   │   └── index.ts          # Common component exports
│   └── navigation/           # Navigation components
│
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts           # Authentication hook
│   ├── useContacts.ts       # Contact management with offline sync
│   ├── useCamera.ts         # Camera permissions and capture
│   └── index.ts             # Hook exports
│
├── services/                # External service integrations
│   ├── supabase.ts          # Supabase client configuration
│   ├── contactService.ts    # Contact CRUD operations
│   ├── geminiOCR.ts         # Gemini AI for OCR
│   ├── googleVision.ts      # Google Vision API (deprecated)
│   ├── openai.ts            # OpenAI for voice transcription
│   └── localStorage.ts      # AsyncStorage wrapper
│
├── config/                  # App configuration
│   └── environment.ts       # Environment variable management
│
├── utils/                   # Utility functions
│   ├── helpers/            # Helper functions
│   └── constants/          # App constants
│
├── types/                   # TypeScript type definitions
│   └── index.d.ts
│
├── __tests__/              # Test files
│   ├── test-utils.tsx      # Testing utilities and mocks
│   ├── hooks/              # Hook tests
│   │   ├── useAuth.test.ts
│   │   └── useContacts.test.ts
│   ├── components/         # Component tests
│   │   └── ContactCard.test.tsx
│   └── auth/               # Authentication tests
│
├── __mocks__/              # Jest mocks
│   └── svgMock.js
│
├── assets/                 # Static assets
│   ├── icon/
│   ├── splash/
│   └── fonts/
│
├── .env.development        # Development environment vars
├── .env.staging            # Staging environment vars
├── .env.production         # Production environment vars
└── .env.example            # Environment variables template
```

## Key Features

### Core Functionality (Free Tier)
- Business card OCR scanning
- Contact management (add, edit, delete, search)
- WhatsApp integration for networking
- Excel export functionality

### Premium Features (Pro/Enterprise Tiers)
- Follow-up reminders with smart filtering
- Voice notes with AI transcription
- Advanced analytics and reporting
- Team collaboration features

## Development Commands

**All commands should be run from the `NamecardMobile/` directory**

```bash
# Development
npm start              # Start Expo development server
npm run start:clear    # Start with cache clear (recommended)
npm run web            # Run in web browser

# Cleaning & Maintenance
npm run clean          # Clear Metro bundler cache
npm run clean:all      # Complete cleanup and reinstall
npm run doctor         # Check environment health
npm run deps:check     # Check for outdated dependencies
npm run deps:update    # Update all dependencies

# Testing
npm test               # Run Jest unit tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate test coverage report
npm run test:debug     # Debug tests with Node inspector

# Code Quality
npm run lint           # ESLint code checking
npm run lint:fix       # Auto-fix linting issues
npm run type:check     # TypeScript type checking
npm run format         # Prettier code formatting
npm run format:check   # Check code formatting

# Building
npm run prebuild       # Generate native code
npm run prebuild:clean # Clean and regenerate native code

# Shortcuts
npm run dev            # Alias for start:clear
```

### Quick Start Workflow

```bash
# First time setup
cd NamecardMobile
npm install
npm run doctor          # Verify environment

# Daily development
npm run start:clear     # Start dev server (press 'a' for Android or 'i' for iOS)

# Before committing
npm run type:check
npm run lint:fix
npm test
```

## Business Model

### Subscription Tiers
- **Free** ($0): Basic OCR and contact management
- **Pro** (RM199/year): + reminders, voice notes, AI features
- **Enterprise** (RM599/year): + analytics, team features, priority support

### Distributor Network
- Global distributor system with commission tracking
- 50% discount codes generate distributor profits
- Automated payout and withdrawal management

## Development Approach

### Testing Strategy (TDD)
- **Unit Tests** (70%): Individual functions and components
- **Integration Tests** (20%): Component interactions and API integrations  
- **End-to-End Tests** (10%): Complete user workflows
- Target: 90%+ test coverage

### Database Schema
Uses Supabase PostgreSQL with 5 main tables:
- `users` (authentication + profile + subscription)
- `contacts` (business cards + networking data)
- `distributors` (partner network)
- `transactions` (all financial records)
- `pricing` (dynamic pricing control)

## Key Implementation Notes

- **Contact State**: All contact data stored in React state (`contacts` array in App.tsx)
- **Screen Navigation**: Simple string-based routing in main App component
- **Premium Features**: Gated behind `isPremiumUser` state flag
- **Mock Data**: Currently uses hardcoded sample contacts for prototyping
- **Component Pattern**: Props-based communication between parent App and child components

## Development Priorities

1. **Phase 1** (Weeks 1-3): Core scanning app
2. **Phase 2** (Weeks 4-5): Contact management
3. **Phase 3** (Week 6): WhatsApp integration
4. **Phase 4** (Week 7): Testing & polish
5. **Phase 5** (Week 8): App store launch
6. **Phase 6** (Weeks 9-11): Premium features
7. **Phase 7** (Weeks 12-14): Distributor system

## Important Considerations

- This is currently a static prototype - no backend integration exists
- Real implementation will require migration to React Native + Expo
- OCR functionality is mocked - needs Google Vision API integration
- Database operations are simulated - needs Supabase implementation
- Payment processing is conceptual - needs Stripe/RevenueCat integration

## ⚡ MANDATORY POST-DEVELOPMENT VALIDATION

**CRITICAL RULE**: After EVERY code change, fix, or development task, Claude Code MUST:

### 1. Run Type Check
```bash
cd NamecardMobile && npm run type:check
```
- If errors found → Fix them immediately
- Re-run until no errors

### 2. Run Tests
```bash
cd NamecardMobile && npm test
```
- If tests fail → Fix them immediately
- Re-run until all tests pass

### 3. Manual Testing (Optional)
- If needed, manually test in emulator by pressing 'a' (Android) or 'i' (iOS) in the Expo dev server
- Check for runtime errors
- Verify the specific feature/fix works

### 4. Auto-Fix Workflow

If ANY errors are detected:

```
1. Capture the full error message
2. Identify the root cause by reading relevant files
3. Fix the code
4. Re-run the failed step
5. Repeat until no errors remain
```

**DO NOT** consider a task complete until:
- ✅ TypeScript compiles without errors
- ✅ All tests pass

### Example Validation Session

```
User: "Add a new contact button to the header"

Claude Code should:
1. Add the button component
2. Run: npm run type:check → Fix any type errors
3. Run: npm test → Fix any test failures
4. Report: "✅ Button added, all checks pass"
```

### Validation Checklist Template

After every change, Claude Code should report:

```
✅ TypeScript: No errors
✅ Tests: X/X passing
```

**This validation is NOT optional - it is mandatory for every code change.**

---

## 🐛 Debugging & Error Fixing with Claude Code

**IMPORTANT**: When errors occur during development, testing, or runtime, ALWAYS use Claude Code to debug and fix them immediately. Follow this workflow:

### Standard Debugging Workflow

1. **Capture the Error**
   - Copy the full error message from terminal/console
   - Include stack traces and line numbers
   - Note the context (what you were doing when it happened)

2. **Ask Claude Code to Debug**
   ```
   "I'm getting this error: [paste error]. Please debug and fix it."
   ```

3. **Claude Code Will**:
   - Read the relevant files
   - Identify the root cause
   - Fix the code
   - Test the fix
   - Explain what was wrong

### Common Error Scenarios

#### Build/Bundling Errors
```bash
# Error: "Unable to resolve module"
# Solution: Ask Claude Code to check import paths and fix them

# Error: "Metro bundler failed"
# Solution: Ask Claude Code to clear cache and restart
cd NamecardMobile && npm run start:clear
```

#### Runtime Errors in Emulator
```bash
# When you see red screen errors in the emulator:
1. Take a screenshot or copy the error text
2. Send to Claude Code: "Fix this error: [error message]"
3. Claude Code will update the code with hot reload
```

#### Test Failures
```bash
# When tests fail:
npm test -- [test-name]
# Copy the failure output
# Ask: "These tests are failing: [paste output]. Fix them."
```

#### Type Errors
```bash
# Run type check
npm run type:check

# If errors appear, ask Claude Code:
"Fix these TypeScript errors: [paste errors]"
```

### Proactive Error Prevention

**Before Running Commands**, ask Claude Code to:
- Validate configuration files
- Check for missing dependencies
- Verify environment variables
- Test critical paths

### Real-Time Debugging During Development

#### Scenario 1: Component Not Rendering
```
"The CameraScreen isn't showing up. Debug and fix."
```
Claude Code will:
1. Check component imports
2. Verify navigation setup
3. Check for runtime errors
4. Fix the issue

#### Scenario 2: API Not Working
```
"Supabase authentication isn't working. Debug this."
```
Claude Code will:
1. Check API configuration
2. Verify environment variables
3. Test the connection
4. Fix authentication flow

#### Scenario 3: Hot Reload Not Working
```
"Hot reload stopped working. Fix it."
```
Claude Code will:
1. Check Metro bundler status
2. Clear cache if needed
3. Restart development server
4. Verify watchman configuration

### Testing & Validation Commands

```bash
# Always run these before committing:
npm run type:check          # Check TypeScript
npm test                    # Run all tests
npm run lint               # Check code quality

# If any fail, ask Claude Code to fix them immediately
```

### Emergency Debug Commands

```bash
# Complete reset (when nothing works):
npm run clean:all          # Clean everything
npm install                # Reinstall dependencies
npm run start:clear        # Start fresh

# Android-specific issues:
adb devices               # Check device connection
adb logcat                # View Android logs
```

### Best Practices for Working with Claude Code

1. **Always Share Context**
   - What were you trying to do?
   - What command did you run?
   - What did you expect to happen?
   - What actually happened?

2. **Provide Complete Error Messages**
   - Don't truncate error messages
   - Include file paths and line numbers
   - Share stack traces

3. **Test Immediately After Fixes**
   - Verify the fix works
   - Report back to Claude Code if issues persist
   - Claude Code will iterate until it's fixed

4. **Document Recurring Issues**
   - If the same error happens multiple times
   - Ask Claude Code to add preventive measures
   - Update configuration to avoid future occurrence

### Example Debug Sessions

#### Example 1: Import Error
```
User: "Getting error: Cannot find module './components/CameraScreen'"

Claude Code will:
1. Read App.tsx to check imports
2. Check actual file location
3. Update import path
4. Hot reload will show the fix immediately
```

#### Example 2: Build Failure
```
User: "Build failing with SDK version mismatch"

Claude Code will:
1. Run expo-doctor to diagnose
2. Check package.json versions
3. Update mismatched packages
4. Restart build successfully
```

#### Example 3: Test Failure
```
User: "useAuth tests are failing"

Claude Code will:
1. Read the test file
2. Check the hook implementation
3. Identify the mock setup issue
4. Fix the test
5. Run tests to confirm they pass
```

### Integration with Development Flow

```
Write Code → Error Occurs → Ask Claude Code → Fix Applied → Continue
     ↑                                                            ↓
     ←←←←←←←←←←←←←←← Test Passes ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

### Quick Reference Commands

```bash
# Check health
npm run doctor

# Clear and restart
npm run clean && npm start

# Test everything
npm test -- --coverage

# Fix linting
npm run lint:fix

# Check types
npm run type:check

# View emulator logs
adb logcat | grep -i "error"
```

**Remember**: Claude Code is your pair programmer. Don't struggle with errors alone - ask immediately and get instant fixes!

## 🔧 Supabase MCP Server - MANDATORY USAGE

**CRITICAL INSTRUCTION FOR CLAUDE CODE**:

**ALWAYS use the Supabase MCP server for ALL database operations, schema changes, queries, and data management tasks.**

### MCP Server Configuration Location

The Supabase MCP server is configured at:
```
.mcp.json
```

This configuration file contains:
- **SUPABASE_URL**: Your project's Supabase URL
- **SUPABASE_SERVICE_ROLE_KEY**: Admin access key for database operations

### When to Use MCP Server (AUTOMATICALLY)

Claude Code MUST use the MCP server for:

1. **Database Schema Changes**
   - Creating/altering tables
   - Adding/removing columns
   - Creating indexes and constraints
   - Running migration scripts

2. **Database Queries**
   - Reading data from tables
   - Inspecting table structures
   - Checking foreign key relationships
   - Verifying data integrity

3. **Data Management**
   - Creating test data
   - Updating records
   - Deleting test records
   - Bulk operations

4. **RLS Policy Management**
   - Creating/updating Row Level Security policies
   - Checking policy configurations
   - Testing access controls

5. **Storage Operations**
   - Creating storage buckets
   - Managing file permissions
   - Uploading test files

6. **Authentication**
   - Creating test users
   - Managing user roles
   - Checking auth configurations

### How to Use the MCP Server

**DO NOT manually write SQL files or ask the user to run them in Supabase Dashboard.**

Instead, Claude Code should:

```bash
# Example workflow for fixing database issues:

1. User reports: "Foreign key constraint error on contacts table"

2. Claude Code automatically:
   - Uses MCP to inspect the contacts table schema
   - Uses MCP to check the foreign key constraint
   - Uses MCP to run the fix SQL directly on the database
   - Verifies the fix with another MCP query
   - Reports success to the user

3. User does NOTHING manually - everything is automatic
```

### MCP Server Configuration File

**WINDOWS USERS**: The Supabase MCP server configuration uses the `--project-ref` method with `SUPABASE_ACCESS_TOKEN` instead of environment variables.

The configuration file should be located at:
```
C:\Users\[YourUsername]\AppData\Roaming\Claude\.mcp.json
```

Configuration format for Windows:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase",
        "--project-ref=wvahortlayplumgrcmvi"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_6f5a2585aa0f39c561582a2d1933a80eae5d3d13"
      }
    }
  }
}
```

**CRITICAL for Windows**:
- Must use `"command": "cmd"` with `"/c"` in args array
- This wrapper is required for Windows to execute `npx` properly
- Without it, you'll get "Connection closed" errors
- Use `--project-ref` flag instead of `SUPABASE_URL` environment variable
- Use `SUPABASE_ACCESS_TOKEN` instead of `SUPABASE_SERVICE_ROLE_KEY`

**File Location**:
- The `.mcp.json` file MUST be in `C:\Users\[YourUsername]\AppData\Roaming\Claude\`
- NOT in the project directory
- NOT in `C:\ProgramData\ClaudeCode\` (that's for enterprise managed configs only)

**IMPORTANT**:
- This configuration gives Claude Code full access to your Supabase project
- Keep this configuration secure and never commit it to public repositories
- The MCP server will be automatically available in all Claude Code sessions once properly configured

### How Claude Code Uses the MCP Server

When the MCP server is properly configured, Claude Code can:

**Database Operations:**
- Execute SQL queries directly on your Supabase database
- Inspect table schemas and relationships
- Create, read, update, and delete records
- Run migrations and schema changes

**Authentication Management:**
- List and manage users
- Create test accounts
- Reset passwords
- View authentication logs

**Storage Operations:**
- Upload and manage files in Supabase Storage
- List buckets and files
- Generate signed URLs
- Manage file permissions

**Real-time Features:**
- Subscribe to database changes
- Monitor real-time events
- Test webhook configurations

### Automatic MCP Usage Examples

When you ask Claude Code to perform Supabase operations, it will automatically use the MCP server:

**User Request:**
```
"Fix the foreign key constraint error on the contacts table"
```

**Claude Code Automatic Actions:**
1. Uses MCP to inspect the `contacts` table schema
2. Uses MCP to check the foreign key constraints
3. Uses MCP to run the fix SQL (e.g., create trigger, update RLS policies)
4. Uses MCP to verify the fix worked
5. Reports: "✅ Fixed! Foreign key constraint resolved."

**User Request:**
```
"Show me all contacts in the database"
```

**Claude Code Automatic Actions:**
1. Uses MCP to query: `SELECT * FROM contacts LIMIT 10;`
2. Displays the results in a formatted table

**User Request:**
```
"Create the storage bucket for contact images"
```

**Claude Code Automatic Actions:**
1. Uses MCP to run storage bucket creation SQL
2. Uses MCP to set up RLS policies for the bucket
3. Uses MCP to verify the bucket was created
4. Reports: "✅ Storage bucket 'contact-images' created successfully!"

### Real-World Workflow

```
❌ OLD WAY (Manual):
User: "Fix the database error"
Claude: "Please run this SQL in Supabase Dashboard..."
User: *Opens browser, logs into Supabase, copies SQL, runs it*

✅ NEW WAY (Automatic with MCP):
User: "Fix the database error"
Claude: *Uses MCP to inspect, fix, and verify*
Claude: "✅ Fixed! The error has been resolved."
User: *Nothing to do - continues working*
```

### Security Notes

- **Service Role Key**: Has full admin access to your Supabase project
- **Secure Storage**: Configuration file is stored in `.mcp.json` in the root directory
- **Never commit**: Add `.mcp.json` to `.gitignore`
- **Local only**: This configuration is for local development only

---

## 🤖 AUTOMATED QA WITH PLAYWRIGHT MCP - MANDATORY ERROR HANDLING

**CRITICAL INSTRUCTION FOR CLAUDE CODE**:

**When ANY error occurs (user reports error OR system detects error), Claude Code MUST automatically act as a QA agent using Playwright MCP to diagnose and fix the error.**

### Playwright MCP Server Configuration

The Playwright MCP server is configured in your project settings at `C:\Users\walte\.claude.json` for the current project.

**Configuration:**
```json
{
  "playwright": {
    "command": "cmd",
    "args": [
      "/c",
      "npx",
      "-y",
      "@playwright/mcp@latest",
      "--browser",
      "chrome",
      "--viewport-size",
      "1280x720"
    ]
  }
}
```

### When to Use Playwright MCP (AUTOMATICALLY)

Claude Code MUST use Playwright MCP for:

1. **Runtime Errors in Browser/App**
   - UI components not rendering
   - JavaScript errors in console
   - API request failures
   - Navigation issues
   - Form submission errors

2. **Visual/Layout Issues**
   - Broken layouts
   - Missing styles
   - Responsive design problems
   - Component alignment issues

3. **User Interaction Errors**
   - Buttons not working
   - Forms not submitting
   - Navigation broken
   - Click handlers failing

4. **Integration Testing**
   - End-to-end workflow testing
   - Multi-step user flows
   - Cross-component interactions

### Automated QA Error Handling Workflow

**When user says: "I'm getting an error" or "This isn't working" or you detect an error:**

```
STEP 1: ACKNOWLEDGE & PREPARE
├─ "I'll use Playwright MCP to diagnose and fix this error"
├─ Create todo list for systematic QA testing
└─ Identify the error type and affected component

STEP 2: AUTOMATED TESTING WITH PLAYWRIGHT
├─ Use browser_goto to navigate to the affected page
├─ Use browser_snapshot to get accessibility tree
├─ Use browser_console_messages to check for errors
├─ Use browser_screenshot to capture visual state
└─ Use browser_click/browser_fill to reproduce the issue

STEP 3: DIAGNOSE THE ROOT CAUSE
├─ Analyze console errors
├─ Check network requests
├─ Inspect DOM structure
├─ Identify broken code/logic
└─ Document findings

STEP 4: FIX THE ERROR
├─ Read the relevant source files
├─ Apply the fix using Edit tool
├─ Update tests if needed
└─ Run type:check and npm test

STEP 5: VERIFY THE FIX WITH PLAYWRIGHT
├─ Use browser_goto to navigate again
├─ Use browser_click/browser_fill to test the fix
├─ Use browser_console_messages to verify no errors
├─ Use browser_screenshot to confirm visual correctness
└─ Mark todo as completed

STEP 6: REPORT SUCCESS
└─ "✅ Error fixed and verified with Playwright testing!"
```

### Available Playwright MCP Tools

**Navigation & Inspection:**
- `browser_goto(url)` - Navigate to a URL
- `browser_snapshot()` - Get structured accessibility tree
- `browser_console_messages()` - Retrieve console logs/errors
- `browser_screenshot()` - Capture visual state

**User Interaction:**
- `browser_click(selector)` - Click elements
- `browser_fill(selector, text)` - Fill form fields
- `browser_scroll(direction)` - Scroll page content
- `browser_drag(from, to)` - Drag and drop

**Management:**
- `browser_close()` - Close current page

### Real-World QA Examples

#### Example 1: User Reports Button Not Working

```
User: "The login button isn't working"

Claude Code MUST automatically:

1. Create todo list:
   ☐ Navigate to login page with Playwright
   ☐ Inspect button with browser_snapshot
   ☐ Check console for errors
   ☐ Test button click interaction
   ☐ Diagnose the issue
   ☐ Fix the code
   ☐ Re-test with Playwright
   ☐ Verify fix works

2. Execute:
   - browser_goto("http://localhost:8081/login")
   - browser_snapshot() → See button structure
   - browser_console_messages() → Check for errors
   - browser_click("button[type='submit']") → Reproduce issue
   - Found error: "onClick handler not defined"

3. Fix:
   - Read LoginScreen.tsx
   - Add missing onClick handler
   - Run type:check and tests

4. Verify:
   - browser_goto("http://localhost:8081/login")
   - browser_click("button[type='submit']")
   - browser_console_messages() → No errors!
   - browser_screenshot() → Verify success state

5. Report:
   "✅ Fixed! Login button now has proper onClick handler. Verified with Playwright testing."
```

#### Example 2: User Reports UI Not Loading

```
User: "The contact list screen is blank"

Claude Code MUST automatically:

1. browser_goto("http://localhost:8081/contacts")
2. browser_console_messages() → Find error: "Cannot read property 'map' of undefined"
3. browser_snapshot() → Confirm empty state
4. Read ContactList.tsx → Find the bug (missing null check)
5. Fix the code → Add optional chaining
6. browser_goto("http://localhost:8081/contacts") → Re-test
7. browser_console_messages() → No errors!
8. browser_screenshot() → Verify contacts display correctly
9. Report: "✅ Fixed null reference error. Contacts now loading correctly."
```

#### Example 3: User Reports Form Validation Error

```
User: "Form validation isn't showing error messages"

Claude Code MUST automatically:

1. browser_goto("http://localhost:8081/add-contact")
2. browser_fill("input[name='email']", "invalid-email")
3. browser_click("button[type='submit']")
4. browser_snapshot() → Check for error message elements
5. browser_console_messages() → Check validation logic
6. Diagnose: Validation function exists but error state not updating
7. Fix: Update form validation state management
8. Re-test with same steps
9. browser_screenshot() → Verify error messages now appear
10. Report: "✅ Form validation now displays error messages correctly."
```

### Integration with Existing Validation Workflow

**Enhanced Post-Development Validation:**

```bash
# After EVERY code change:

1. TypeScript Type Check
   cd NamecardMobile && npm run type:check

2. Unit Tests
   npm test

3. ✨ NEW: Playwright E2E Testing (Automated)
   Claude Code automatically uses Playwright MCP to:
   - Navigate to affected pages
   - Test user interactions
   - Verify no console errors
   - Confirm visual correctness
   - Screenshot before/after states

4. Report Results
   ✅ TypeScript: No errors
   ✅ Tests: X/X passing
   ✅ Playwright E2E: All interactions verified
```

### Error Detection Triggers

Claude Code should AUTOMATICALLY activate Playwright QA mode when:

1. **User explicitly reports an error**
   - "This isn't working"
   - "I'm getting an error"
   - "The button is broken"
   - "Nothing happens when I click"

2. **User asks to debug/check something**
   - "Check if the form works"
   - "Test the login flow"
   - "Verify the UI loads correctly"

3. **After implementing new features**
   - "I just added authentication, make sure it works"
   - "Test the new contact form"

4. **When TypeScript or tests fail**
   - After fixing code errors, verify with Playwright that the UI works

### Playwright Testing Best Practices

1. **Always start with browser_goto**
   - Navigate to the specific page/route you're testing

2. **Use browser_snapshot for structure**
   - Get accessibility tree to understand UI structure
   - More reliable than pixel-based testing

3. **Check console messages**
   - Always run browser_console_messages() to catch errors
   - Filter for errors with appropriate flags

4. **Take screenshots for visual verification**
   - Capture state before and after actions
   - Helps confirm visual correctness

5. **Test complete user flows**
   - Don't just test one click
   - Test entire workflows (login → navigate → action → result)

6. **Clean up after testing**
   - Use browser_close() when done
   - Keep browser sessions fresh

### Dev Server Integration

**Before using Playwright MCP, ensure dev server is running:**

```bash
# Check if dev server is running
cd NamecardMobile && npm run start:clear

# In background terminal, Expo dev server should be at:
# - Web: http://localhost:8081
# - Android: Use 'a' to open Android emulator
# - iOS: Use 'i' to open iOS simulator
```

### Mandatory QA Checklist

After EVERY fix, Claude Code MUST verify:

```
✅ Code fixed in source files
✅ TypeScript type:check passes
✅ Unit tests pass
✅ Playwright navigation successful
✅ No console errors
✅ User interactions work
✅ Visual state correct
✅ Screenshot confirms fix
```

**DO NOT** consider an error "fixed" until ALL checklist items pass, including Playwright verification.

### Example Todo List for QA Testing

When user reports an error, create this todo structure:

```
1. ☐ Reproduce error with Playwright MCP
2. ☐ Capture console errors and screenshots
3. ☐ Diagnose root cause from error logs
4. ☐ Read relevant source files
5. ☐ Fix the code
6. ☐ Run type:check and tests
7. ☐ Verify fix with Playwright re-test
8. ☐ Confirm no console errors
9. ☐ Take success screenshot
10. ☐ Report completion to user
```

### Summary

**The Golden Rule of Error Handling:**

```
WHEN ERROR OCCURS:
  1. Don't just fix the code
  2. USE PLAYWRIGHT MCP to:
     - Reproduce the error
     - Diagnose the root cause
     - Verify the fix works
     - Confirm no new errors introduced
  3. Report success with evidence

NEVER say "I've fixed it" without Playwright verification!
```

**Remember**: Playwright MCP is your QA automation tool. Use it religiously for every error, every fix, every new feature. The user should see systematic, professional testing, not guesswork.

---