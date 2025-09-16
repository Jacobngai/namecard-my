# NAMECARD.MY - PRO TIER WIREFRAMES

## 1. PRO OCR SCREEN (With Voice Notes)

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
│ FOLLOW-UP REMINDER              │
│ [1 Week ▼] [📅 Set Date]       │
│                                 │
│ VOICE NOTE                      │
│ [🎤 Record Note] [▶️ 0:00]      │
│ "Met at tech conference..."     │
│                                 │
├─────────────────────────────────┤
│ [💬 SEND WHATSAPP INTRO]       │
│   (Auto-saves with reminder)   │
└─────────────────────────────────┘
```

**Pro Features:**
- Follow-up reminder dropdown (1 week, 2 weeks, 1 month, custom)
- Voice note recording with playback
- AI transcription shown below recorder
- Auto-save includes reminder and voice note

---

## 2. VOICE NOTE RECORDING INTERFACE

```
┌─────────────────────────────────┐
│ [←] VOICE NOTE                  │
├─────────────────────────────────┤
│                                 │
│          🎤 RECORDING           │
│                                 │
│         ●●●●●●●●●●●             │
│           0:23                  │
│                                 │
│  "Met John at the tech          │
│   conference. Interested in     │
│   our new API product.          │
│   Follow up in 2 weeks about    │
│   enterprise pricing..."        │
│                                 │
│ ═════════════════════════════   │
│                                 │
│ AI DETECTED:                    │
│ • Follow-up: 2 weeks            │
│ • Topic: Enterprise pricing     │
│ • Priority: High interest       │
│                                 │
│ [🔴 STOP] [✅ SAVE] [🗑 DELETE] │
└─────────────────────────────────┘
```

**Voice Features:**
- Real-time transcription during recording
- AI parsing for follow-up intentions
- Visual waveform animation
- Auto-detection of reminder timing from speech

---

## 3. REMINDER DASHBOARD SCREEN

```
┌─────────────────────────────────┐
│ REMINDERS                   [⚙]│
├─────────────────────────────────┤
│ [📅 Today] [⏰ This Week] [📊]  │
├─────────────────────────────────┤
│ 🟡 TODAY (1)                    │
│ ┌─────┬─────────────────────┬─┐ │
│ │[📷] │ Sarah Wilson        │💬│ │
│ │     │ Follow up: Today    │ │ │
│ │     │ 🎤 "Demo scheduling" │ │ │
│ └─────┴─────────────────────┴─┘ │
│                                 │
│ 🟢 THIS WEEK (3)                │
│ ┌─────┬─────────────────────┬─┐ │
│ │[📷] │ John Smith          │💬│ │
│ │     │ Follow up: March 20 │ │ │
│ │     │ 🎤 "Enterprise API"  │ │ │
│ └─────┴─────────────────────┴─┘ │
│                                 │
│ ┌─────┬─────────────────────┬─┐ │
│ │[📷] │ Lisa Chen           │💬│ │
│ │     │ Follow up: March 22 │ │ │
│ │     │ 🎤 "Product demo"    │ │ │
│ └─────┴─────────────────────┴─┘ │
│                                 │
├─────────────────────────────────┤
│ [📷] SCAN    [📋] CONTACTS      │
└─────────────────────────────────┘
```

### Alternative Filter Views:

#### When "📊" (Overdue) Filter Selected:
```
┌─────────────────────────────────┐
│ REMINDERS                   [⚙]│
├─────────────────────────────────┤
│ [📅 Today] [⏰ This Week] [📊]  │
├─────────────────────────────────┤
│ 🔴 LAST WEEK (5)                │
│ ┌─────┬─────────────────────┬─┐ │
│ │[📷] │ Mike Johnson        │💬│ │
│ │     │ Overdue: 2 days     │ │ │
│ │     │ 🎤 "Discuss pricing" │ │ │
│ └─────┴─────────────────────┴─┘ │
│                                 │
│ ┌─────┬─────────────────────┬─┐ │
│ │[📷] │ David Kim           │💬│ │
│ │     │ Overdue: 5 days     │ │ │
│ │     │ 🎤 "Contract review" │ │ │
│ └─────┴─────────────────────┴─┘ │
│                                 │
│ [Show Earlier ▼]               │
│                                 │
├─────────────────────────────────┤
│ [📷] SCAN    [📋] CONTACTS      │
└─────────────────────────────────┘
```

**Reminder Features:**
- Smart filtering system: Today, This Week, Overdue (📊)
- Overdue filter shows only last week to avoid overwhelming
- "Show Earlier" expandable for older overdue items
- Voice note preview in each reminder
- Quick actions (WhatsApp, snooze, mark done)
- Manageable view prevents hundreds of overdue items cluttering interface

---

## 4. CONTACT DETAILS (PRO VERSION)

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
│ ⏰ NEXT REMINDER               │
│ March 20, 2024 - Enterprise API │
│ [✏️ Edit] [⏰ Snooze] [✅ Done] │
│                                 │
│ 🎤 VOICE NOTES (2)             │
│ ┌─────────────────────────────┐ │
│ │ ▶️ 0:45 - "Met at conference"│ │
│ │ "Interested in API product"  │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ▶️ 0:32 - "Follow up pricing"│ │
│ │ "Enterprise tier discussion" │ │
│ └─────────────────────────────┘ │
│                                 │
│ [🎤 ADD VOICE NOTE]            │
│                                 │
├─────────────────────────────────┤
│ [📷] SCAN CARD    [📱] PROFILE  │
└─────────────────────────────────┘
```

**Pro Contact Features:**
- Active reminder display with quick actions
- Voice notes history with playback
- Add new voice notes from contact view
- Reminder management (edit, snooze, complete)

---

## 5. UPGRADE PROMPT SCREENS

### Free User Accessing Pro Feature:

```
┌─────────────────────────────────┐
│           🚀 UPGRADE            │
├─────────────────────────────────┤
│                                 │
│        💎 GO PRO               │
│                                 │
│   Unlock Smart Reminders       │
│      & Voice Notes             │
│                                 │
│ ✅ Never miss a follow-up       │
│ ✅ AI-powered voice notes       │
│ ✅ Smart reminder parsing       │
│ ✅ Advanced export options      │
│                                 │
│      $0.00/month               │
│  (then RM270/year after trial) │
│                                 │
│                                 │
│ [🚀 START FREE TRIAL]          │
│ [💳 SUBSCRIBE NOW]             │
│                                 │
│ [← Continue with Free]         │
└─────────────────────────────────┘
```

---

## 6. VOICE-TO-REMINDER AI PARSING

```
┌─────────────────────────────────┐
│ 🎤 AI PROCESSING...             │
├─────────────────────────────────┤
│                                 │
│ VOICE NOTE TRANSCRIPTION:       │
│ "Met John at the conference.    │
│ He's interested in our API.     │
│ Should follow up in two weeks   │
│ about enterprise pricing and    │
│ schedule a demo."               │
│                                 │
│ ═════════════════════════════   │
│                                 │
│ 🤖 AI SUGGESTIONS:              │
│                                 │
│ ⏰ REMINDER DETECTED:           │
│ Follow up in 2 weeks            │
│ → March 29, 2024               │
│                                 │
│ 🏷️ TOPICS IDENTIFIED:           │
│ • Enterprise pricing           │
│ • Product demo                 │
│ • API integration              │
│                                 │
│ 📋 SUGGESTED ACTIONS:           │
│ • Schedule demo call           │
│ • Send pricing info            │
│                                 │
│ [✅ APPLY ALL] [✏️ EDIT] [❌]   │
└─────────────────────────────────┘
```

**AI Features:**
- Real-time voice processing
- Automatic reminder extraction
- Topic and action identification
- Smart suggestions based on context
- User can accept, edit, or dismiss suggestions