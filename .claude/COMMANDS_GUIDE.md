# 🚀 NAMECARD.MY Context Engineering Commands Guide

## Available Commands

### 1️⃣ `/generate-prp` - Create New Features
**Purpose**: Generate comprehensive Product Requirements Prompts for new features
**Usage**: `/generate-prp NamecardMobile/INITIAL.md`
**Output**: Creates a detailed PRP with implementation blueprint, validation gates, and success criteria

### 2️⃣ `/execute-prp` - Implement Features
**Purpose**: Execute PRPs with self-correction and validation loops
**Usage**: `/execute-prp NamecardMobile/PRPs/feature-name.prp.md`
**Action**: Implements feature following offline-first patterns with automatic validation

### 3️⃣ `/fix-prp` - Debug & Fix Issues
**Purpose**: Deep root cause analysis and comprehensive fix planning
**Usage**: `/fix-prp NamecardMobile/INITIAL_ISSUE.md`
**Output**: Creates Fix Requirements Prompt with multiple solutions and risk assessment

### 4️⃣ `/execute-fix` - Safely Apply Fixes
**Purpose**: Execute fixes with safety checks, testing matrix, and rollback capability
**Usage**: `/execute-fix NamecardMobile/PRPs/fix-issue.prp.md`
**Action**: Implements fix incrementally with continuous validation

## 📋 Workflow Examples

### Creating a New Feature
```bash
1. Edit NamecardMobile/INITIAL.md with your feature requirements
2. Run: /generate-prp NamecardMobile/INITIAL.md
3. Review generated PRP in NamecardMobile/PRPs/
4. Run: /execute-prp NamecardMobile/PRPs/[feature].prp.md
5. Feature implemented with validation!
```

### Fixing a Bug
```bash
1. Document issue in NamecardMobile/INITIAL_ISSUE.md
2. Run: /fix-prp NamecardMobile/INITIAL_ISSUE.md
3. Review fix plan in NamecardMobile/PRPs/
4. Run: /execute-fix NamecardMobile/PRPs/fix-[issue].prp.md
5. Issue fixed with comprehensive testing!
```

## 📁 File Structure

```
NAMECARD.MY/
├── .claude/
│   ├── CLAUDE.md              # Master context (architecture rules)
│   ├── COMMANDS_GUIDE.md      # This file
│   └── commands/
│       ├── generate-prp.md   # New feature generator
│       ├── execute-prp.md    # Feature implementer
│       ├── fix-prp.md        # Issue analyzer
│       └── execute-fix.md    # Fix implementer
│
└── NamecardMobile/
    ├── INITIAL.md            # Feature request template
    ├── INITIAL_ISSUE.md      # Bug report template
    └── PRPs/
        ├── templates/
        │   └── prp-base.md   # PRP template
        └── [generated-prps]  # Your generated PRPs
```

## 🎯 Command Capabilities

### `/generate-prp` Features:
- 🔍 Researches existing codebase patterns
- 📚 Includes relevant documentation
- 🏗️ Creates phased implementation plan
- ✅ Defines validation gates
- 📊 Sets performance targets
- ⚠️ Identifies gotchas and edge cases

### `/execute-prp` Features:
- 🚀 Implements following PRP blueprint
- 🔄 Self-corrects when validation fails
- 📱 Ensures offline-first architecture
- 🧪 Runs validation gates continuously
- 📝 Updates documentation
- ✨ Maintains code quality

### `/fix-prp` Features:
- 🔬 Deep root cause analysis
- 🕵️ Code archaeology (git history)
- 💡 Multiple solution strategies
- ⚖️ Risk assessment for each approach
- 🛡️ Regression prevention plan
- 📊 Impact analysis

### `/execute-fix` Features:
- 🛡️ Safety-first implementation
- 📸 Pre-fix state snapshot
- 🔄 Incremental changes with validation
- 🧪 Comprehensive testing matrix
- ↩️ Rollback capability
- 📈 Post-fix monitoring

## 💡 Best Practices

### For New Features:
1. **Be specific** in INITIAL.md requirements
2. **Include examples** of similar features
3. **Define success criteria** clearly
4. **Consider offline scenarios** always
5. **Think about edge cases** upfront

### For Bug Fixes:
1. **Reproduce first** - Never fix what you can't reproduce
2. **Document everything** - Screenshots, logs, steps
3. **Test offline first** - Most issues are offline-related
4. **Small commits** - Easy to rollback if needed
5. **Monitor after fix** - Watch for regressions

## 🚨 Common Scenarios

### Scenario 1: Add OCR Scanning
```markdown
# In INITIAL.md
## FEATURE:
Implement business card OCR with Google Vision API,
offline queue, and 85% accuracy target

# Then run:
/generate-prp NamecardMobile/INITIAL.md
/execute-prp NamecardMobile/PRPs/ocr-scanning.prp.md
```

### Scenario 2: Fix Camera Crash
```markdown
# In INITIAL_ISSUE.md
## ISSUE DESCRIPTION:
Camera crashes when offline with "auth required" error

# Then run:
/fix-prp NamecardMobile/INITIAL_ISSUE.md
/execute-fix NamecardMobile/PRPs/fix-camera-crash.prp.md
```

### Scenario 3: Add Subscription System
```markdown
# In INITIAL.md
## FEATURE:
Multi-tier subscription with RevenueCat
(Free/$0, Pro/$199, Enterprise/$599)

# Then run:
/generate-prp NamecardMobile/INITIAL.md
/execute-prp NamecardMobile/PRPs/subscription-system.prp.md
```

## ✅ Validation Always Includes

Every command ensures:
- 📱 **Offline-first**: Works without internet
- 🔐 **No auth required**: For basic features
- ⚡ **Performance**: <500ms response time
- 🧪 **Testing**: Comprehensive test coverage
- 📚 **Documentation**: Updated automatically
- 🔄 **No regressions**: Existing features preserved

## 🎓 Tips & Tricks

### Speed Up Development:
```bash
# Generate multiple PRPs in parallel
/generate-prp INITIAL_FEATURE1.md
/generate-prp INITIAL_FEATURE2.md

# Then execute sequentially
/execute-prp PRPs/feature1.prp.md
/execute-prp PRPs/feature2.prp.md
```

### Debug Efficiently:
```bash
# Quick fix for simple issues
/fix-prp INITIAL_ISSUE.md --quick

# Thorough fix for complex issues
/fix-prp INITIAL_ISSUE.md --deep-analysis
```

### Ensure Quality:
```bash
# Extra validation
/execute-prp PRPs/feature.prp.md --strict

# With performance profiling
/execute-fix PRPs/fix.prp.md --profile
```

## 📊 Success Metrics

Commands help achieve:
- **90%** first-time implementation success
- **50%** reduction in development time
- **100%** offline functionality
- **<0.1%** crash rate
- **>95%** code coverage
- **Zero** regression policy

## 🆘 Troubleshooting

### Commands Not Appearing:
1. Ensure files are in `/.claude/commands/` (root)
2. Restart Claude Code if needed
3. Check file has `.md` extension

### PRP Generation Issues:
1. Provide more context in INITIAL.md
2. Include specific examples
3. Reference existing code

### Fix Not Working:
1. Ensure issue is reproducible
2. Test in airplane mode first
3. Check LocalStorage operations
4. Verify ContactService usage

## 🚀 Ready to Start!

1. **For new features**: Edit `INITIAL.md` and use `/generate-prp`
2. **For bug fixes**: Edit `INITIAL_ISSUE.md` and use `/fix-prp`
3. **Follow the PRPs**: They contain everything needed
4. **Trust the validation**: Gates ensure quality

---

**Remember**: Context Engineering = Comprehensive Context + Self-Validation + One-Pass Success! 🎯