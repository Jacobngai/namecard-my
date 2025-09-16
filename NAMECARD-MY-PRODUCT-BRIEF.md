# SMART NETWORKING APP (NAMECARD.MY) - PRODUCT BRIEF

## CORE CONCEPT:
A simple camera-first app that helps users efficiently manage personal networking contacts through business card scanning and intelligent follow-up reminders.

## CORE USER FLOW:
1. Take picture of business card OR selfie with contact
2. OCR automatically extracts and displays contact information
3. Optional quick additions (note, follow-up timing)
4. Save to contacts list
5. Receive smart follow-up reminders

## KEY FEATURES:

### CAPTURE METHODS:
- Primary: Business card photo with OCR extraction
- Alternative: Selfie mode for casual networking (when no business card is exchanged)

### AUTO-EXTRACTED INFORMATION (via OCR):
- Name
- Phone number
- Email address
- Company name
- Company address

### OPTIONAL QUICK ADDITIONS (Single screen after OCR):
- Follow-up reminder: Dropdown options (1 week, 2 weeks, 1 month, 3 months, or "no reminder")
- Quick note: Single text field for context
- Voice note: Optional voice recording with AI transcription
- Tags: Quick select (Friend, Family, Prospect, Partner, Referral, Other)

### VOICE NOTE ENHANCEMENT:
- Users can record voice notes about the contact
- AI transcription converts speech to text
- AI can parse follow-up intentions from voice notes (e.g., "follow up in 3 weeks" automatically sets reminder)
- Original voice recording is preserved alongside transcription

### CONTACT MANAGEMENT:
- Contact list with business card photo as profile picture
- Display key info: name, company, phone, email
- Direct integration: Tap phone number → call, tap WhatsApp icon → WhatsApp message
- Edit contact details anytime

### FOLLOW-UP DASHBOARD:
- Separate view showing upcoming and overdue follow-ups
- Sort by date, priority, or relationship type
- Quick actions from dashboard (call, message, mark as contacted)

## DESIGN PRINCIPLES:
- Speed first: Minimum viable flow is Photo → Save (2 taps)
- Progressive enhancement: Additional features are optional, not required
- Flexibility: Supports different user preferences (voice, text, minimal input)
- No forced workflows: Users choose their own level of detail

## TARGET USER FLOW TIMES:
- Speed users: 10-15 seconds (photo, verify OCR, save)
- Detail users: 30-45 seconds (photo, add notes/timing, save)
- Voice users: 20-30 seconds (photo, voice note, save)

## TECHNICAL REQUIREMENTS:

### MOBILE APP:
- High-accuracy OCR for business cards
- Voice-to-text transcription
- AI parsing of voice notes for follow-up timing
- Integration with phone's contact app, calling, and messaging apps
- Push notifications for follow-up reminders
- Local storage with optional cloud backup

### DISTRIBUTOR WEB PLATFORM:
- Distributor registration and onboarding system
- Real-time commission tracking and analytics
- Automated payout and withdrawal management
- Discount code generation and validation
- Customer acquisition tracking
- Multi-currency support for global operations

### ADMIN DASHBOARD:
- Global platform management and monitoring
- Pricing structure configuration (market prices, discounts, commissions)
- Distributor management (approval, suspension, performance tracking)
- Financial oversight (commission rates, withdrawal fees, revenue analytics)
- Regional market configuration
- Customer support and dispute resolution tools

## SUCCESS METRICS:
- Time from meeting contact to saved in app
- Follow-up reminder completion rate
- Daily active usage during networking events
- User retention after first networking event

## TECHNICAL DECISIONS:

### Platform & Technology:
- **Platform**: React Native + Expo
- **Backend**: Supabase (authentication, database, cloud storage)
- **Database**: Supabase PostgreSQL (with local caching)
- **OCR Service**: Google Vision API
- **Voice Transcription**: OpenAI Whisper
- **Offline Strategy**: App works offline for basic features - saves cards locally, backend processes when internet available
- **Contact Management**: Separate contact database (not integrated with phone's native contacts)

### MVP SCOPE:

#### ABSOLUTELY ESSENTIAL (v1.0):
- Name card capture with OCR
- Contact lists management (View, Search, Edit, Delete)
- Auto WhatsApp introduction feature

#### NICE-TO-HAVE (Future versions):
- Voice notes with AI transcription
- Follow-up reminders and dashboard
- Advanced tagging and categorization
- Call integration
- AI parsing of voice notes for follow-up timing

### BUSINESS MODEL:
- **Target Audience**: General networking (not specific user types)
- **Monetization**: Freemium subscription model with global distributor network

#### SUBSCRIPTION TIERS:

**🆓 FREE TIER** ($0/month):
- Business card OCR and contact management
- Excel export and WhatsApp integration
- Unlimited contact storage

**💎 PRO TIER** (RM199/year):
- All Free features PLUS:
- Follow-up reminders with smart filtering (Today/This Week/Overdue)
- Smart overdue management (shows last week only, expandable)
- Voice notes with AI transcription (OpenAI Whisper)
- AI parsing of voice notes for automatic reminder setting
- Advanced export options and priority support

**🚀 ENTERPRISE TIER** (RM599/year):
- All Pro features PLUS:
- Advanced analytics and reporting
- Team collaboration features
- Custom integrations
- Priority support and training

#### DISTRIBUTOR NETWORK MODEL:

**📈 GLOBAL DISTRIBUTION SYSTEM:**
- **Distributor Registration**: Partners receive unique distributor codes
- **Commission Structure**: 50% discount codes generate distributor profits
- **Automated Payouts**: Commission tracking and withdrawal system
- **Multi-tier Pricing**: Different markets, different pricing strategies

**💰 DISTRIBUTOR ECONOMICS:**
- **Pro Tier**: Market price RM199 → With code RM99 (Distributor earns RM40)
- **Enterprise Tier**: Market price RM599 → With code RM299 (Distributor earns RM100)
- **Withdrawal Fees**: Platform fee deducted from distributor earnings
- **Balance Management**: Real-time tracking of earnings and payouts

**🌍 DISTRIBUTOR BENEFITS:**
- **Web Dashboard**: Manage accounts, track sales, view commissions
- **Marketing Materials**: Branded promotional content
- **Regional Pricing**: Localized pricing for different markets
- **Performance Analytics**: Sales tracking and customer insights

### MVP USER FLOW:
1. **Camera** → Capture business card photo
2. **OCR** → Extract contact information (editable input fields)
3. **WhatsApp** → Send introduction (auto-saves contact)
4. **Contact List** → View all saved contacts with export options

### USER PROFILE SETTINGS:
- **Introduction Message**: User sets custom introduction text in profile settings
- **WhatsApp Integration**: Creates WhatsApp link (wa.me) and auto-directs to WhatsApp app

### CONTACT LIST FEATURES:
- **View**: Display all saved contacts with business card photos
- **Search**: Find contacts by name, company, or other details
- **Long Press Selection**: Multi-select contacts for bulk operations
- **Excel Export**: Export selected contacts to Excel file
- **Edit**: Modify contact information
- **Delete**: Remove contacts from list
- **WhatsApp**: Quick access to send messages to any saved contact

### OFFLINE FUNCTIONALITY:
- Core capture and save works without internet
- OCR processing queued for when connection available
- Local storage with sync when online
- Graceful degradation of cloud-dependent features