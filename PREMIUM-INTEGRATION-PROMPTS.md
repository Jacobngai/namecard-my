# PREMIUM FEATURES INTEGRATION PROMPTS
*How premium features connect with existing base app*

## 🎯 INTEGRATION STRATEGY

### **WHY These Premium Features:**
- **Business Problem**: Base app only captures contacts, but users forget to follow up
- **Revenue Opportunity**: Users will pay RM299 for AI-powered relationship management
- **Competitive Advantage**: Voice notes + AI transcription + smart reminders = unique value
- **User Journey**: Scan → Save → **FORGET** (Problem) → Scan → Save → **REMEMBER & FOLLOW-UP** (Solution)

---

## 🔗 INTEGRATION POINT 1: ENHANCED BOTTOM NAVIGATION

### Figma AI Prompt:
```
Modify the existing mobile app bottom navigation for business card app to include premium features. 

CONTEXT: Users currently have Camera, Contacts, Profile tabs. We need to add premium features that help users follow up with their scanned contacts, because the main problem is people scan cards but forget to reconnect.
INTEGRATION REQUIREMENTS:
- Keep existing: "Camera" (scanning), "Contacts" (list), "Profile" (settings)
- ADD: "Reminders" tab with notification badge showing count of overdue items
- Visual hierarchy: Free features (Camera, Contacts) in regular blue, Premium features (Reminders) with subtle premium gold accent
- When non-premium user taps Reminders: show upgrade prompt overlay

DESIGN:
- 4-tab bottom navigation bar
- Tabs: Camera | Contacts | Reminders | Profile
- Reminders tab: Bell icon with red notification dot (e.g. "3") showing pending follow-ups
- Premium indicator: Small gold crown icon next to Reminders tab
- Active state: Blue (#2563EB), Premium active: Gold (#F59E0B)
- Inactive state: Gray (#6B7280)

PURPOSE: Guide users naturally from scanning contacts to managing follow-ups, creating upgrade motivation

Style: Professional business app, premium feature discovery
Platform: Mobile app navigation enhancement
```

---

## 🔗 INTEGRATION POINT 2: ENHANCED CONTACT FORM (POST-SCAN)

### Figma AI Prompt:
```
Enhance the existing contact information form to include premium features preview.

CONTEXT: After user scans business card and sees extracted info, we want to show them premium features they could unlock, creating immediate upgrade motivation while the contact is fresh in their mind.

CURRENT STATE: Form has Name, Company, Phone, Email, Address fields + "Send WhatsApp Intro" button

ENHANCEMENT NEEDED:
- Keep all existing fields and WhatsApp button (core functionality)
- ADD premium feature section below basic fields:
  * "Set Follow-up Reminder" with date picker (locked for base users)
  * "Add Voice Note" with microphone icon (locked for base users)
  * Lock icons with "Enterprise Feature" tooltip

DESIGN:
- Original form layout unchanged (top priority)
- New section: "Smart Follow-up" with light gold background (#FEF3C7)
- Locked features: Greyed out with lock icon overlay
- "Unlock with Enterprise" small button
- When base user taps locked feature: upgrade prompt modal

INTERACTION:
- Enterprise users: Full functionality
- Base users: Preview with upgrade prompt
- Visual emphasis on value: "Never forget a follow-up again"

PURPOSE: Show premium value immediately after scanning, when user is most engaged

Style: Progressive disclosure, premium feature teasing
Platform: Mobile app form enhancement
```

---

## 🔗 INTEGRATION POINT 3: ENHANCED CONTACT LIST WITH REMINDERS

### Figma AI Prompt:
```
Enhance the existing contact list to show reminder indicators and integrate follow-up management.

CONTEXT: Users scan contacts but forget to follow up. We need to surface upcoming reminders directly in the contact list so users see follow-up value immediately.

CURRENT STATE: Contact cards show business card thumbnail, name, company, phone, WhatsApp button

INTEGRATION REQUIREMENTS:
- Keep existing contact card layout (core functionality)
- ADD reminder indicators for each contact:
  * Red dot: Overdue reminder 
  * Yellow dot: Due today
  * Blue dot: Upcoming this week
  * No dot: No reminder set

- ADD quick actions for each contact:
  * WhatsApp button (existing)
  * "+ Reminder" button (new - premium feature)
  * "Voice note" icon if contact has notes (premium)

DESIGN ENHANCEMENTS:
- Contact cards show reminder status with colored dots (top-right corner)
- Overdue contacts float to top with subtle red background tint
- "+" quick action button next to WhatsApp for setting reminders
- Voice note indicator: Small microphone icon with count (e.g. "🎤2")

PREMIUM GATES:
- Base users see reminder dots but clicking shows upgrade prompt
- Enterprise users get full reminder functionality
- Search bar includes "Show only with reminders" filter (premium)

PURPOSE: Make follow-up management central to the contact experience

Style: Enhanced productivity, reminder-aware design
Platform: Mobile app list enhancement
```

---

## 🔗 INTEGRATION POINT 4: SMART UPGRADE PROMPTS (CONTEXTUAL)

### Figma AI Prompt:
```
Design contextual upgrade prompts that appear throughout the base app experience.

CONTEXT: We need to convert base users (RM99) to Enterprise (RM299) by showing premium value at the right moments, not annoying them with random popups.

TRIGGER MOMENTS for upgrade prompts:
1. After scanning 5th business card: "Getting busy networking! Upgrade to never miss follow-ups"
2. When viewing contact after 1 week: "Haven't contacted John Smith in 7 days. Set smart reminders?"
3. When exporting contacts: "Export includes follow-up data with Enterprise"
4. When user manually types note: "Save voice notes instead with AI transcription"

DESIGN VARIATIONS:

1. BOTTOM SHEET PROMPT (least intrusive):
   - Slide up from bottom, 1/3 screen height
   - "💡 Smart Suggestion" header
   - Context-aware message
   - "Upgrade to Enterprise" button + "Not now" link

2. TOAST NOTIFICATION (very subtle):
   - Top of screen, 2-second auto-dismiss
   - "🎯 Tip: Set reminders to reconnect with contacts"
   - Tap to expand to upgrade screen

3. EMPTY STATE WITH UPGRADE (in reminder tab):
   - "No reminders yet" illustration
   - "Start following up smartly with Enterprise"
   - Feature preview with locked state

PREMIUM VALUE MESSAGING:
- Focus on user outcome: "Never miss a follow-up"
- Show time saved: "AI transcribes your notes in seconds"  
- Social proof: "Join 1000+ networkers staying connected"

PURPOSE: Convert users naturally based on their usage patterns

Style: Helpful suggestions, non-intrusive, value-focused
Platform: Mobile app upgrade conversion system
```

---

## 🔗 INTEGRATION POINT 5: UNIFIED CONTACT DETAIL WITH PREMIUM FEATURES

### Figma AI Prompt:
```
Redesign the contact detail screen to seamlessly blend base and premium features.

CONTEXT: Contact detail is where users spend most time. We need to show premium value without breaking existing functionality for base users.

CURRENT STATE: Shows business card image, contact info, WhatsApp/Call/Email buttons

INTEGRATION REQUIREMENTS:
- Keep all existing functionality at top (priority)
- ADD premium sections that enhance the contact experience:
  * Timeline of interactions (when contacted via WhatsApp)
  * Reminder management section
  * Voice notes collection
  * AI insights about contact

DESIGN STRUCTURE:
1. Header: Contact name + edit/delete (existing)
2. Business card image (existing) 
3. Action buttons: Call/WhatsApp/Email (existing)
4. NEW: "Interaction Timeline" section
   - "Last contacted: 3 days ago via WhatsApp"
   - "Next reminder: March 20 - Follow up on pricing"
   - Base users see timeline but reminder line is locked
5. NEW: "Smart Notes" section  
   - Voice notes with transcription preview
   - "Add voice note" button (locked for base)
6. NEW: "AI Insights" section
   - "Contact frequency: Monthly"
   - "Best time to follow up: Based on past interactions"
   - Locked for base users with upgrade prompt

PREMIUM GATES:
- Base users see sections but with "Enterprise Feature" locks
- Tapping locked features shows contextual upgrade: "Track all your networking interactions with Enterprise"
- Visual hierarchy: unlocked features prominent, locked features subtle

PURPOSE: Show contact management as a complete relationship system

Style: Progressive feature disclosure, relationship-focused
Platform: Mobile app enhanced detail view
```

---

## 🔗 INTEGRATION POINT 6: SMART ONBOARDING FLOW

### Figma AI Prompt:
```
Design onboarding screens that introduce premium features naturally after base feature success.

CONTEXT: New users should experience base value first, then discover premium features when they're ready to upgrade their networking game.

ONBOARDING SEQUENCE:
1. Scan first card (base feature success)
2. Send WhatsApp intro (base feature success)  
3. Show premium preview: "Most networkers forget to follow up..."
4. Continue with base features, periodic premium hints

DESIGN PROGRESSIVE DISCLOSURE:

Screen 1: "Welcome to Smart Networking"
- Hero: Business card scanning illustration
- "Scan → Connect → Remember" flow
- "Start with scanning" button

Screen 2: After first successful scan
- "Great job! Contact saved"
- "💡 Pro tip: 80% of networkers never follow up"
- "Upgrade to Enterprise for smart reminders"
- "Continue scanning" + "Learn about Enterprise" buttons

Screen 3: After 3rd contact scanned
- "You're building connections!"
- Preview of reminder dashboard
- "Track all your networking with Enterprise"
- "Try Enterprise free for 7 days" button

DESIGN PRINCIPLES:
- Celebrate base feature success first
- Introduce premium as natural evolution
- Use statistics to create urgency: "80% never follow up"
- Show, don't tell: Visual previews of premium features

PURPOSE: Build upgrade motivation through successful base experience

Style: Achievement-based progression, success celebration
Platform: Mobile app onboarding enhancement
```

---

## 🎯 INTEGRATION SUMMARY

### **HOW PREMIUM FEATURES CONNECT:**

1. **Bottom Navigation**: Add "Reminders" tab with notification badges
2. **Contact Form**: Add locked premium fields (reminder, voice note)
3. **Contact List**: Show reminder indicators and quick actions
4. **Contact Details**: Blend timeline, notes, and AI insights seamlessly
5. **Upgrade Prompts**: Context-aware suggestions based on user behavior
6. **Onboarding**: Progressive disclosure of premium value

### **WHY THIS INTEGRATION WORKS:**

- **Natural Flow**: Premium features enhance existing actions
- **Value First**: Users see benefit before paywall
- **Non-Intrusive**: Locked features don't break base experience  
- **Contextual Upgrades**: Prompts appear when users need premium features
- **Progressive Disclosure**: Advanced features revealed gradually

**These prompts will help Figma AI understand exactly where and why to add premium features to your existing app design!** 🚀