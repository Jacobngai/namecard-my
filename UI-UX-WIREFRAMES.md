# NAMECARD.MY - UI/UX WIREFRAMES

## 1. CAMERA/CAPTURE SCREEN

```
┌─────────────────────────────────┐
│ NAMECARD.MY                  [⚙]│
├─────────────────────────────────┤
│                                 │
│          CAMERA VIEWFINDER      │
│                                 │
│    ┌─────────────────────────┐   │
│    │                         │   │
│    │     BUSINESS CARD       │   │
│    │       PREVIEW           │   │
│    │                         │   │
│    │   [Card Detection Box]  │   │
│    │                         │   │
│    └─────────────────────────┘   │
│                                 │
│                                 │
│             [📷]                │
│        CAPTURE CARD             │
│                                 │
├─────────────────────────────────┤
│ [📋] CONTACTS     [📱] PROFILE   │
└─────────────────────────────────┘
```

**Key Features:**
- Full-screen camera viewfinder
- Business card detection overlay
- Large, prominent capture button
- Bottom navigation (Contacts, Profile)
- Settings icon in top-right
- Auto-focus on business card area

---

## 2. OCR RESULT VERIFICATION SCREEN

```
┌─────────────────────────────────┐
│ [←] CARD DETAILS            [⚙]│
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │   [Business Card Image]    │ │
│ └─────────────────────────────┘ │
│                                 │
│ NAME                            │
│ [John Smith           ]         │
│                                 │
│ COMPANY                         │
│ [ABC Corp             ]         │
│                                 │
│ PHONE                           │
│ [+1-555-0123          ]         │
│                                 │
│ EMAIL                           │
│ [john@abccorp.com     ]         │
│                                 │
│ ADDRESS                         │
│ [123 Main St, City    ]         │
│                                 │
├─────────────────────────────────┤
│ [💬 SEND WHATSAPP INTRO]       │
│   (Auto-saves to contacts)     │
└─────────────────────────────────┘
```

**Key Features:**
- Captured card image at top
- Direct input fields (no separate edit mode)
- Single primary action: WhatsApp intro with auto-save
- Back button to retake photo
- Streamlined workflow - no manual save needed
- Clean, form-like layout

---

## 3. CONTACT LIST SCREEN

```
┌─────────────────────────────────┐
│ CONTACTS                    [⚙]│
├─────────────────────────────────┤
│ [🔍 Search contacts...]        │
├─────────────────────────────────┤
│ ┌─────┬─────────────────────┬─┐ │
│ │[📷] │ John Smith         ☑│💬│ │
│ │     │ ABC Corp            │ │ │
│ │     │ +1-555-0123         │ │ │
│ └─────┴─────────────────────┴─┘ │
│                                 │
│ ┌─────┬─────────────────────┬─┐ │
│ │[📷] │ Jane Doe           ☑│💬│ │
│ │     │ XYZ Ltd             │ │ │
│ │     │ +1-555-0456         │ │ │
│ └─────┴─────────────────────┴─┘ │
│                                 │
│ ┌─────┬─────────────────────┬─┐ │
│ │[📷] │ Mike Johnson        │💬│ │
│ │     │ Tech Inc            │ │ │
│ │     │ +1-555-0789         │ │ │
│ └─────┴─────────────────────┴─┘ │
│                                 │
├─────────────────────────────────┤
│ [📊 EXPORT EXCEL] [📱] PROFILE  │
└─────────────────────────────────┘
```

**Key Features:**
- Search bar at top
- Contact cards with business card thumbnail
- Long press to select contacts (checkboxes appear)
- Multi-select with checkboxes for bulk actions
- WhatsApp quick-action button per contact
- Export Excel function for selected contacts
- Tap contact for details/edit
- Clean list layout

**Selection Mode:**
- Long press any contact to enter selection mode
- Checkboxes appear on all contacts
- Bottom navigation changes to show export options
- Export Excel saves selected contacts to file

---

## 4. CONTACT DETAIL/EDIT SCREEN

```
┌─────────────────────────────────┐
│ [←] JOHN SMITH          [🗑] [✏]│
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │   [Business Card Image]    │ │
│ └─────────────────────────────┘ │
│                                 │
│ 📞 +1-555-0123     [CALL]      │
│ 💬 WhatsApp        [MESSAGE]    │
│ 📧 john@abccorp.com [EMAIL]    │
│                                 │
│ ═════════════════════════════   │
│                                 │
│ COMPANY: ABC Corp               │
│ ADDRESS: 123 Main St, City      │
│ ADDED: March 15, 2024           │
│                                 │
│ ═════════════════════════════   │
│                                 │
│ [💬 SEND WHATSAPP MESSAGE]     │
│ [📞 CALL NOW]                  │
│ [📧 SEND EMAIL]                │
│                                 │
├─────────────────────────────────┤
│ [📷] SCAN CARD    [📱] PROFILE  │
└─────────────────────────────────┘
```

**Key Features:**
- Contact name in header
- Delete and edit icons
- Business card image
- Quick action buttons for communication
- Contact details section
- Multiple ways to reach contact
- Consistent bottom navigation

---

## 5. USER PROFILE/SETTINGS SCREEN

```
┌─────────────────────────────────┐
│ [←] PROFILE                 [✏]│
├─────────────────────────────────┤
│          ┌─────────┐             │
│          │ [PHOTO] │             │
│          └─────────┘             │
│         Your Name               │
│      your@email.com             │
│                                 │
│ ═════════════════════════════   │
│                                 │
│ WHATSAPP INTRODUCTION MESSAGE   │
│ ┌─────────────────────────────┐ │
│ │ Hi! I'm [Your Name] from    │ │
│ │ [Your Company]. Nice        │ │
│ │ meeting you at the event.   │ │
│ │ Let's stay connected!       │ │
│ │                             │ │
│ │ [Edit this message...]      │ │
│ └─────────────────────────────┘ │
│                                 │
│ SETTINGS                        │
│ • Sign Out                      │
│                                 │
├─────────────────────────────────┤
│ [📷] SCAN CARD    [📋] CONTACTS │
└─────────────────────────────────┘
```

**Key Features:**
- User profile photo and info
- Large, editable WhatsApp introduction message
- Settings menu
- Clear text area for custom intro
- Standard settings options
- Bottom navigation

---

## 6. NAVIGATION FLOW DIAGRAM

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CAMERA    │───▶│ OCR VERIFY  │───▶│ CONTACTS    │
│   SCREEN    │    │   SCREEN    │    │   LIST      │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                    │
       │                  ▼                    ▼
       │           ┌─────────────┐    ┌─────────────┐
       │           │  WHATSAPP   │    │  CONTACT    │
       │           │  REDIRECT   │    │  DETAILS    │
       │           └─────────────┘    └─────────────┘
       │                                      │
       ▼                                      ▼
┌─────────────┐                      ┌─────────────┐
│   PROFILE   │◀─────────────────────│    EDIT     │
│  SETTINGS   │                      │  CONTACT    │
└─────────────┘                      └─────────────┘
```

**Key Navigation Points:**
- Camera is the main entry point
- OCR verification is mandatory step
- WhatsApp integration branches from OCR
- Contacts list is central hub
- Profile accessible from any screen
- Edit flows back to contact details

## DESIGN PRINCIPLES:
- **Thumb-friendly**: All primary actions within thumb reach
- **Minimal taps**: Core flow is 2-3 taps maximum
- **Clear hierarchy**: Important actions are visually prominent
- **Consistent**: Same navigation pattern across screens
- **Fast**: No unnecessary confirmation dialogs
- **Accessible**: Large touch targets, clear contrast