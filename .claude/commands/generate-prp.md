# Generate PRP for NAMECARD.MY Feature

## Feature file: $ARGUMENTS

Generate a comprehensive Product Requirements Prompt (PRP) for NAMECARD.MY feature implementation with thorough research and context. This PRP will be used by an AI agent to implement the feature with self-validation and iterative refinement.

## 🔍 Research Process

### 1. **Codebase Analysis**
   - Search for similar features in `/NamecardMobile` directory
   - Identify existing patterns in:
     - `/components` - UI components and screens
     - `/services` - Business logic and API integrations
     - `/utils` - Helper functions
   - Note conventions:
     - React Native + TypeScript patterns
     - Expo SDK usage
     - Offline-first architecture (LocalStorage → ContactService → Supabase)
   - Check test patterns in `/tests` (if exists)

### 2. **External Research**
   - React Native/Expo documentation
   - Supabase integration patterns
   - Google Vision API for OCR
   - RevenueCat for subscriptions
   - WhatsApp deep linking
   - Include specific documentation URLs

### 3. **NAMECARD.MY Specific Context**
   - Review key documentation:
     - `DATABASE-SCHEMA.md` - Database structure
     - `DEVELOPMENT-ROADMAP.md` - Feature priorities
     - `SUBSCRIPTION-TIERS.md` - Pricing model
     - `OFFLINE_TEST_VERIFICATION.md` - Offline requirements
   - Check recent fixes in `FIX_SUMMARY.md`

## 📝 PRP Generation Template

### Structure for NAMECARD.MY PRPs:

```markdown
# PRP: [Feature Name] for NAMECARD.MY

## 📋 Context & Requirements
- **Goal**: [Specific measurable goal]
- **Users**: Business professionals in Malaysia & globally
- **Constraints**: Must work offline-first, support React Native
- **Dependencies**: [List services/APIs needed]

## 🏗️ Implementation Blueprint

### Phase 1: [Setup/Foundation]
REFERENCE: [Existing file patterns to follow]
1. [Step with specific file/component]
2. [Include code snippets where helpful]
3. [Reference existing patterns]

### Phase 2: [Core Implementation]
REFERENCE: [Similar implementations in codebase]
1. [Detailed implementation steps]
2. [Error handling approach]
3. [Offline-first considerations]

### Phase 3: [Integration & Polish]
1. [Supabase sync if applicable]
2. [UI/UX improvements]
3. [Performance optimization]

## 🧪 Validation Gates

### For React Native/Expo:
```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Unit tests (if available)
npm test

# Build check
npx expo prebuild --clear
```

### Functional Validation:
- [ ] Works completely offline
- [ ] Syncs when online (if applicable)
- [ ] No authentication errors in guest mode
- [ ] Performance targets met

## ✅ Success Criteria
- [ ] Feature works offline
- [ ] No regression in existing features
- [ ] Follows existing patterns
- [ ] Tests pass (if applicable)
- [ ] Performance within targets

## 📚 Documentation & References
- [Specific Expo SDK docs]
- [Supabase client docs]
- [Third-party API docs]
- Internal: [Reference existing files]

## ⚠️ Gotchas & Considerations
- [Known issues with libraries]
- [Platform-specific concerns]
- [Memory/performance constraints]
```

## 🎯 NAMECARD.MY Specific Considerations

### Architecture Patterns to Follow:
1. **Offline-First**: LocalStorage → ContactService → Supabase
2. **Component Structure**: Functional components with hooks
3. **State Management**: React state + Context (no Redux yet)
4. **Navigation**: React Navigation bottom tabs + stack
5. **Styling**: StyleSheet with consistent patterns

### Common Features to Reference:
- **Camera/OCR**: `/components/CameraScreen.tsx`
- **Contacts**: `/services/contactService.ts`
- **Local Storage**: `/services/localStorage.ts`
- **Auth**: `/services/authManager.ts` (optional)

## 📊 Quality Scoring

Rate the PRP on these criteria (1-10):
1. **Completeness**: All context included?
2. **Clarity**: Implementation path clear?
3. **Validation**: Gates executable?
4. **Patterns**: Follows existing code?
5. **Offline**: Handles offline scenarios?

**Overall Confidence Score**: [X/10] for one-pass implementation

## 💾 Output

Save the generated PRP as:
```
NamecardMobile/PRPs/[feature-name].prp.md
```

## ✅ Quality Checklist

Before finalizing:
- [ ] Researched existing codebase patterns
- [ ] Included offline-first considerations
- [ ] Referenced actual files from project
- [ ] Validation gates are executable
- [ ] Follows React Native best practices
- [ ] Considers Malaysia market specifics
- [ ] Addresses subscription tiers if relevant
- [ ] Includes performance targets

## 🚀 Example Usage

```bash
# In Claude Code:
/generate-prp NamecardMobile/INITIAL_OCR_SCANNING.md
/generate-prp NamecardMobile/INITIAL_SUBSCRIPTION_SYSTEM.md
/generate-prp NamecardMobile/INITIAL_DISTRIBUTOR_PORTAL.md
```

Remember: The goal is **one-pass implementation success** through comprehensive context that enables the AI agent to self-correct and validate.