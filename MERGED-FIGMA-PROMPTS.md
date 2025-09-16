# NAMECARD.MY - MERGED FIGMA AI PROMPTS
*Focused, context-window optimized prompts that build progressively*

## 📋 PROMPT STRATEGY
- **Each prompt = 1 focused task** (fits AI context window)
- **Progressive building**: Base screens → Enhanced screens → Premium screens
- **Clear context**: What exists + what to modify/create
- **No overlap**: Each prompt handles one specific component

---

# 🆓 PHASE 1: BASE SCREENS (RM99 Tier)

## PROMPT 1A: Base Camera Screen
```
REFERENCE: Use the existing camera screen design from NAMECARD.MY Figma file as base template.

KEEP EXISTING DESIGN:
- Same layout, colors, typography, spacing as current camera screen
- Same top navigation with NAMECARD.MY logo + settings icon
- Same dotted rectangle scanning frame with corner brackets
- Same blue capture button (#2563EB) and positioning
- Same scanning animation and "Processing business card..." overlay
- Same bottom navigation: Camera (active) | Contacts | Profile

MODIFY ONLY: Ensure design is pixel-perfect match to existing Figma camera screen

PURPOSE: Maintain design consistency with existing camera screen
Style: Match current NAMECARD.MY design system exactly
Platform: Mobile app (iOS/Android)
```

## PROMPT 1B: Base Contact Form  
```
REFERENCE: Use the existing contact form design from NAMECARD.MY Figma file as base template.

KEEP EXISTING DESIGN:
- Same header layout with "Contact Details" + back arrow styling
- Same business card thumbnail positioning and sizing
- Same input field styling, spacing, and typography
- Same "Send WhatsApp Intro" button design and color (#2563EB)
- Same form layout with Name, Company, Phone, Email, Address fields
- Same "Contact will be saved automatically" text positioning and styling

MODIFY ONLY: Ensure design matches existing Figma contact form exactly

PURPOSE: Maintain design consistency with existing contact form
Style: Match current NAMECARD.MY design system exactly
Platform: Mobile app form
```

## PROMPT 1C: Base Contact List
```
REFERENCE: Use the existing contact list design from NAMECARD.MY Figma file as base template.

KEEP EXISTING DESIGN:
- Same header styling with "Contacts" title + settings icon positioning
- Same search bar design, placeholder text, and magnifying glass icon
- Same contact card layout and spacing in vertical list
- Same business card thumbnail size and positioning (left)
- Same typography hierarchy: Name (large), Company (medium), Phone (small)
- Same WhatsApp button styling and positioning (right)
- Same bottom navigation styling: Camera | Contacts (active) | Profile

MODIFY ONLY: Ensure design matches existing Figma contact list exactly

PURPOSE: Maintain design consistency with existing contact list
Style: Match current NAMECARD.MY design system exactly
Platform: Mobile app list interface
```

## PROMPT 1D: Base Profile Screen
```
REFERENCE: Use the existing profile screen design from NAMECARD.MY Figma file as base template.

KEEP EXISTING DESIGN:
- Same header styling with "Profile" title + edit icon positioning
- Same user section layout: avatar placeholder + "Your Name" + email typography
- Same WhatsApp introduction section styling and layout
- Same text area design for intro message and edit button styling
- Same settings menu items styling: Account Settings, Export Data, Help, Sign Out
- Same bottom navigation styling: Camera | Contacts | Profile (active)
- Same section spacing, typography, and color scheme

MODIFY ONLY: Ensure design matches existing Figma profile screen exactly

PURPOSE: Maintain design consistency with existing profile screen
Style: Match current NAMECARD.MY design system exactly
Platform: Mobile app profile
```

## PROMPT 1E: Base Contact Detail
```
REFERENCE: Use the existing contact detail design from NAMECARD.MY Figma file as base template.

KEEP EXISTING DESIGN:
- Same header layout: contact name + back arrow + edit/delete icons styling
- Same business card image sizing and positioning (large, centered)
- Same action button styling and layout for phone/WhatsApp/email
- Same contact info section layout: Company, Address, Added date typography
- Same primary action buttons styling: "Send WhatsApp Message", "Call Now", "Send Email"
- Same overall spacing, colors, and typography hierarchy

MODIFY ONLY: Ensure design matches existing Figma contact detail screen exactly

PURPOSE: Maintain design consistency with existing contact detail screen
Style: Match current NAMECARD.MY design system exactly
Platform: Mobile app detail screen
```

---

# 💎 PHASE 2: PREMIUM INTEGRATIONS (Base → Enhanced)

## PROMPT 2A: Enhanced Contact Form
```
REFERENCE: Use the existing contact form design from NAMECARD.MY Figma file as exact base.

KEEP EXISTING DESIGN (unchanged):
- Same header, business card thumbnail, input fields, WhatsApp button
- Same styling, spacing, typography, colors exactly as current design

ADD PREMIUM PREVIEW SECTION (below existing WhatsApp button):
- Use same design language: colors, typography, spacing, button styles
- "Smart Follow-up" section with light gold background (#FEF3C7)
- "Set Reminder" field with date picker + lock icon (🔒)
- "Add Voice Note" with microphone icon + lock icon (🔒)
- Lock styling matches current design system

STYLING: Blend seamlessly with existing Figma design - same fonts, button styles, spacing

PURPOSE: Enhance existing form while maintaining design consistency
Integration: Add premium preview using current design system
```

## PROMPT 2B: Enhanced Contact List  
```
REFERENCE: Use the existing contact list design from NAMECARD.MY Figma file as exact base.

KEEP EXISTING DESIGN (unchanged):
- Same header, search bar, contact cards layout, bottom navigation
- Same business card thumbnails, typography, WhatsApp buttons
- Same styling, spacing, colors exactly as current design

ADD REMINDER INDICATORS (minimal additions):
- Small colored dots (top-right corner of each contact card):
  * Red dot: Overdue reminder, Yellow dot: Due today, Blue dot: Upcoming
- Small "+" reminder button next to existing WhatsApp button
- Small voice note icon (🎤2) if contact has notes
- Use same design system: colors, icon styles, spacing as current design

STYLING: Blend seamlessly with existing contact card design - same fonts, colors, layouts

PURPOSE: Enhance contact cards while maintaining design consistency  
Integration: Add minimal indicators using current design system
```

## PROMPT 2C: Enhanced Bottom Navigation
```
REFERENCE: Use the existing 3-tab bottom navigation from NAMECARD.MY Figma file as exact base.

KEEP EXISTING DESIGN (unchanged):
- Same Camera, Contacts, Profile tab styling, icons, typography
- Same active/inactive states, colors, spacing exactly as current design
- Same overall bottom navigation bar styling and positioning

ADD: Reminders tab (between Contacts and Profile):
- Bell icon matching current icon style and sizing
- Notification badge (red dot with count) using same design system
- Small gold crown indicator using current design language
- Active state: Blue (#2563EB) matching existing active tab styling
- Maintain same spacing, typography, icon sizing as current tabs

STYLING: Blend seamlessly with existing navigation - same fonts, icons, spacing

PURPOSE: Extend navigation while maintaining design consistency
Integration: Add 4th tab using current design system exactly
```

## PROMPT 2D: Enhanced Contact Detail
```
REFERENCE: Use the existing contact detail screen from NAMECARD.MY Figma file as exact base.

KEEP EXISTING DESIGN (unchanged):
- Same header, business card image, action buttons styling
- Same contact info section, primary action buttons
- Same styling, spacing, typography, colors exactly as current design

ADD PREMIUM SECTIONS (below existing content):
- Use same design language: section styling, typography, spacing, colors
- "Interaction Timeline" section with same card styling as existing sections
- "Voice Notes" section with playable items using current design system
- "AI Insights" section with lock icons matching current style
- Lock icons (🔒) styled consistently with current design language

STYLING: Blend seamlessly with existing detail screen - same section styling, fonts, spacing

PURPOSE: Extend contact detail while maintaining design consistency
Integration: Add premium sections using current design system exactly
```

---

# 🚀 PHASE 3: PREMIUM-ONLY SCREENS (RM299 Tier)

## PROMPT 3A: Reminder Dashboard
```
REFERENCE: Use the existing NAMECARD.MY design system from Figma file for consistency.

DESIGN USING EXISTING SYSTEM:
- Header styling: Match existing "Contacts" header layout and typography
- Filter tabs: Use same tab styling as existing contact form sections
- Reminder cards: Use same card layout as existing contact list cards
- Business card thumbnails: Same sizing and positioning as contact list
- Typography hierarchy: Same font sizes, weights as existing screens
- Color scheme: Use existing colors (#2563EB blue, plus red/yellow for urgency)
- Bottom navigation: Use existing 4-tab navigation with Reminders active

LAYOUT (using existing components):
- Header with "Reminders" title styled like existing headers
- Filter tabs styled like existing form sections  
- Reminder cards styled like existing contact cards but with reminder info
- Floating "+" button using existing button styling

PURPOSE: Premium screen using existing design language for consistency
Style: Match current NAMECARD.MY design system exactly
```

## PROMPT 3B: Voice Note Recording
```
REFERENCE: Use the existing NAMECARD.MY design system from Figma file for consistency.

DESIGN USING EXISTING SYSTEM:
- Header styling: Match existing contact detail header with back arrow
- Contact name: Same typography as existing contact headers
- Recording area: Use existing card/section styling for background
- Transcription section: Use existing input field styling for text areas
- AI suggestions: Use existing form section styling with list items
- Control buttons: Use existing button styling (STOP=red, SAVE/DELETE=secondary)
- Typography: Same font hierarchy as existing screens

LAYOUT (using existing components):
- Header styled like existing "Contact Details" header
- Recording area using existing card component styling
- Transcription section using existing form field styling
- Control buttons using existing button component styles

PURPOSE: Premium screen using existing design language for consistency
Style: Match current NAMECARD.MY design system exactly
```

## PROMPT 3C: Subscription Upgrade
```
REFERENCE: Use the existing NAMECARD.MY design system from Figma file for consistency.

DESIGN USING EXISTING SYSTEM:
- Header styling: Match existing screen headers with close X icon
- Value proposition: Use existing typography hierarchy for headlines
- Feature list: Use existing list/form styling with checkmarks
- Pricing display: Use existing card/section styling for pricing info
- Action buttons: Use existing primary button styling for "Start Free Trial"
- Secondary actions: Use existing secondary button and link styling
- Color scheme: Use existing blue (#2563EB) for primary actions

LAYOUT (using existing components):
- Header styled like existing profile/settings headers
- Feature sections using existing card component styling
- Pricing cards using existing form section styling
- Button hierarchy using existing button component styles

PURPOSE: Conversion screen using existing design language for consistency
Style: Match current NAMECARD.MY design system exactly
```

---

# 🎨 PHASE 4: INTEGRATION ELEMENTS

## PROMPT 4A: Contextual Upgrade Prompts
```
REFERENCE: Use the existing NAMECARD.MY design system from Figma file for consistency.

DESIGN USING EXISTING SYSTEM:
- Bottom sheet: Use existing modal/overlay styling and positioning
- Typography: Same font hierarchy and text styling as existing screens
- Buttons: Use existing primary button styling for upgrade actions
- Close/dismiss: Use existing X icon and secondary link styling  
- Background: Use existing overlay/modal background styling
- Message cards: Use existing card/section component styling

FORMATS (using existing components):
1. Bottom sheet: Existing modal styling with context message + upgrade button
2. Toast notification: Existing alert/banner styling with tap interaction
3. Empty state: Existing empty state styling with illustration + upgrade

STYLING: Match existing modal, button, and card components exactly
Integration: Blend seamlessly with existing design language
```

## PROMPT 4B: Premium UI Components
```
REFERENCE: Use the existing NAMECARD.MY design system from Figma file for consistency.

DESIGN USING EXISTING SYSTEM:
- Lock icons: Style to match existing icon set and sizing
- Status badges: Use existing button/badge styling with color variations
- Voice waveform: Use existing color scheme (#2563EB) with animation
- AI suggestion cards: Use existing card component styling with light background
- Crown indicators: Style to match existing icon system and sizing
- Loading states: Use existing loading/spinner styling with custom text

COMPONENTS (using existing design language):
1. Lock icons: Existing icon styling with gold accent (#F59E0B)
2. Status badges: Existing badge styling with yellow/red color variants
3. Waveform: Existing color palette with blue gradient animation
4. AI cards: Existing card component with checkmark/X button styling
5. Crown indicators: Existing icon styling with premium gold color
6. Loading states: Existing spinner/loading component with AI messaging

STYLING: Match existing icon, button, card, and animation styles exactly
Integration: Blend seamlessly with existing component library
```

---

## 🎯 USAGE INSTRUCTIONS

### **PHASE 1**: Generate base screens (5 prompts)
- Use existing Figma components as reference
- Focus on core RM99 functionality

### **PHASE 2**: Enhance base screens (4 prompts)  
- Modify existing designs to show premium value
- Add locked features and upgrade hints

### **PHASE 3**: Create premium screens (3 prompts)
- Build Enterprise-only functionality
- Focus on follow-up and AI features  

### **PHASE 4**: Add integration elements (2 prompts)
- Create upgrade prompts and premium components
- Complete the conversion funnel

**Each prompt is focused, has clear context, and builds on previous work!** 🚀