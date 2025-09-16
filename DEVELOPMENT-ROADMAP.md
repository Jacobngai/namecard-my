# NAMECARD.MY - DEVELOPMENT ROADMAP
*Starting with MVP Scan App (RM99 Tier)*

## 🎯 DEVELOPMENT STRATEGY
**Build → Test → Launch → Iterate**

Focus on **RM99 tier MVP** to validate core value proposition, then add Enterprise features and distributor system.

---

## 📱 PHASE 1: CORE SCANNING APP (Weeks 1-3)
*The essential MVP that proves the concept works*

### Week 1: Project Setup & Infrastructure
**🔧 Technical Foundation**
- [ ] **Day 1-2**: Initialize React Native + Expo project + Testing framework
- [ ] **Day 3**: Setup Supabase backend (auth, database, storage) + API tests
- [ ] **Day 4**: Configure Google Vision API for text extraction + OCR tests
- [ ] **Day 5**: Setup basic navigation (React Navigation) + navigation tests
- [ ] **Day 6-7**: Create basic UI components and theme + component tests

**📋 Deliverables:**
- Working React Native app with Supabase connection
- Google Vision API integration test
- Basic app navigation structure

**✅ Week 1 Success Criteria:**
- [ ] All tests pass (minimum 80% code coverage)
- [ ] App launches without crashes on iOS/Android
- [ ] Supabase authentication working
- [ ] Google Vision API returns text from test image
- [ ] Navigation between 3 main screens works
- [ ] CI/CD pipeline setup and running

### Week 2: Camera & Contact Extraction
**📸 Core Scanning Functionality**
- [ ] **Day 8-9**: Camera integration (expo-camera) + camera permission tests
- [ ] **Day 10-11**: Image capture and local storage + image handling tests
- [ ] **Day 12-13**: Google Vision API integration + text extraction tests
- [ ] **Day 14**: Contact info parsing (name, phone, email, company) + parsing tests

**📋 Deliverables:**
- Camera screen that captures business cards
- Text extraction from business card images
- Parsed contact information display

**✅ Week 2 Success Criteria:**
- [ ] Camera captures clear, focused images
- [ ] Google Vision API extracts text with >80% accuracy on test cards
- [ ] Contact parser correctly identifies name, phone, email in 9/10 test cases
- [ ] Image storage and retrieval working offline
- [ ] Error handling for camera permissions and API failures
- [ ] Unit tests cover all parsing functions

### Week 3: Contact Input & Storage
**💾 Data Management**
- [ ] **Day 15-16**: Contact input fields (editable after extraction) + form validation tests
- [ ] **Day 17**: Save contacts to Supabase database + database integration tests
- [ ] **Day 18-19**: Basic contact list view + list rendering tests
- [ ] **Day 20-21**: Contact search functionality + search algorithm tests

**📋 Deliverables:**
- Editable contact forms after scanning
- Contacts saved to cloud database
- Basic contact list with search

**✅ Week 3 Success Criteria:**
- [ ] Contact form validates email/phone formats correctly
- [ ] Contacts save to database in <2 seconds
- [ ] Contact list loads 100+ contacts smoothly
- [ ] Search returns results in <1 second
- [ ] Offline-first: contacts save locally when offline
- [ ] Integration tests cover full scan-to-save flow
- [ ] No memory leaks in contact list scrolling

**🎯 Phase 1 Goal:** User can scan → extract → edit → save business cards

---

## 📋 PHASE 2: CONTACT MANAGEMENT (Weeks 4-5)
*Making the contact list useful and exportable*

### Week 4: Contact List Features
**📱 Essential Contact Functions**
- [ ] **Day 22-23**: Contact detail view + detail screen tests
- [ ] **Day 24-25**: Edit existing contacts + edit validation tests
- [ ] **Day 26-27**: Delete contacts + delete confirmation tests
- [ ] **Day 28**: Long-press multi-select functionality + multi-select tests

**📋 Deliverables:**
- Full contact management (view, edit, delete)
- Multi-select contact functionality

**✅ Week 4 Success Criteria:**
- [ ] Contact details display all information correctly
- [ ] Edit saves changes and updates UI immediately
- [ ] Delete shows confirmation and removes from all views
- [ ] Multi-select can handle 50+ contacts without lag
- [ ] Undo functionality works for delete operations
- [ ] All CRUD operations have corresponding tests
- [ ] Error handling for network failures during operations

### Week 5: Export & Profile
**📊 Data Export & User Settings**
- [ ] **Day 29-30**: Excel export functionality for selected contacts + export tests
- [ ] **Day 31-32**: User profile screen + profile management tests
- [ ] **Day 33-34**: WhatsApp introduction message setup + message validation tests
- [ ] **Day 35**: Offline functionality (basic) + offline sync tests

**📋 Deliverables:**
- Excel export for contacts
- User profile with custom WhatsApp intro message
- Basic offline support

**✅ Week 5 Success Criteria:**
- [ ] Excel export generates valid .xlsx file with all contact fields
- [ ] Export handles 500+ contacts without memory issues
- [ ] Profile settings save and persist across app restarts
- [ ] WhatsApp intro message accepts 500 character limit
- [ ] Offline mode saves actions and syncs when online
- [ ] Export functionality tested with edge cases (empty data, special characters)
- [ ] Profile data encrypted and secure

**🎯 Phase 2 Goal:** Complete RM99 tier functionality

---

## 💬 PHASE 3: WHATSAPP INTEGRATION (Week 6)
*The key differentiator that makes networking instant*

### Week 6: WhatsApp Deep Integration
**🚀 Instant Networking**
- [ ] **Day 36-37**: WhatsApp URL generation (wa.me links) + URL generation tests
- [ ] **Day 38**: Auto-populate introduction message + message template tests
- [ ] **Day 39**: Update last_contact timestamp + timestamp tracking tests
- [ ] **Day 40-41**: Test WhatsApp integration across devices + cross-platform tests
- [ ] **Day 42**: Polish and bug fixes + end-to-end testing

**📋 Deliverables:**
- One-click WhatsApp messaging from contacts
- Custom introduction messages
- Last contact tracking

**✅ Week 6 Success Criteria:**
- [ ] WhatsApp opens correctly on iOS/Android with pre-filled message
- [ ] Introduction message includes contact name and custom text
- [ ] Last contact timestamp updates immediately after WhatsApp launch
- [ ] URL encoding handles special characters in names/messages
- [ ] Integration works with WhatsApp Business and regular WhatsApp
- [ ] Fallback handling when WhatsApp not installed
- [ ] End-to-end test: scan → edit → WhatsApp works 100% of time

**🎯 Phase 3 Goal:** Complete MVP ready for user testing

---

## 🧪 PHASE 4: TESTING & POLISH (Week 7)
*Making sure the MVP is solid before launch*

### Week 7: Quality Assurance
**✅ Testing & Optimization**
- [ ] **Day 43-44**: End-to-end testing on real devices + device compatibility tests
- [ ] **Day 45**: Performance optimization + performance benchmarking
- [ ] **Day 46**: UI/UX polish and accessibility + accessibility tests
- [ ] **Day 47**: Error handling and edge cases + stress testing
- [ ] **Day 48-49**: Beta testing with friends/colleagues + user acceptance tests

**📋 Deliverables:**
- Tested, polished MVP
- Beta feedback incorporated
- Ready for app store submission

**✅ Week 7 Success Criteria:**
- [ ] App launches in <3 seconds on average device
- [ ] Camera-to-save flow completes in <30 seconds
- [ ] 95% test coverage across all critical paths
- [ ] Zero crashes in 100 user sessions
- [ ] Passes iOS/Android accessibility guidelines
- [ ] 10 beta testers complete full workflow successfully
- [ ] Memory usage stays under 150MB during normal operation
- [ ] Battery usage comparable to similar camera apps

**🎯 Phase 4 Goal:** Production-ready RM99 tier app

---

## 🚀 PHASE 5: LAUNCH & VALIDATION (Week 8)
*Getting the MVP to market*

### Week 8: App Store Launch
**📱 Go to Market**
- [ ] **Day 50-51**: App store submission (iOS/Android) + store compliance tests
- [ ] **Day 52**: Landing page creation + website performance tests
- [ ] **Day 53-54**: Marketing materials and social media + A/B testing setup
- [ ] **Day 55-56**: Launch and monitor user feedback + analytics implementation

**📋 Deliverables:**
- App live on app stores
- Basic marketing presence
- User feedback collection system

**✅ Week 8 Success Criteria:**
- [ ] App approved and live on both iOS App Store and Google Play
- [ ] Landing page converts at >2% visitor-to-download rate
- [ ] Analytics tracking all key user actions
- [ ] First 10 downloads with no critical bugs reported
- [ ] Payment processing working for RM99 subscriptions
- [ ] Customer support system ready for inquiries
- [ ] App Store Optimization (ASO) keywords performing

**🎯 Phase 5 Goal:** Live app with real user feedback

---

## 💎 PHASE 6: PREMIUM FEATURES (Weeks 9-11)
*Adding Enterprise tier value after validating RM99 tier*

### Week 9: Reminder System
- [ ] Reminder dashboard UI
- [ ] Follow-up date setting
- [ ] Push notifications for reminders
- [ ] Smart filtering (Today/Week/Overdue)

### Week 10: Voice Notes
- [ ] Voice recording integration
- [ ] OpenAI Whisper transcription
- [ ] AI parsing for follow-up dates
- [ ] Voice note playback

### Week 11: Payment & Subscription System
- [ ] RM99 tier payment processing (Stripe/RevenueCat)
- [ ] Enterprise tier (RM299 with distributor codes)
- [ ] Trial period management
- [ ] Payment failure handling

**🎯 Phase 6 Goal:** Paid subscription model validated

---

## 🌍 PHASE 7: DISTRIBUTOR SYSTEM (Weeks 12-14)
*Scaling through global partners*

### Week 12: Distributor Web Portal
- [ ] Distributor registration and dashboard
- [ ] Commission tracking
- [ ] Sales analytics

### Week 13: Admin Dashboard
- [ ] Platform management interface
- [ ] Distributor approval system
- [ ] Pricing configuration

### Week 14: Financial System
- [ ] Automated commission calculation
- [ ] Withdrawal processing
- [ ] Multi-currency support

**🎯 Phase 7 Goal:** Scalable distributor network

---

## ⏱️ TIMELINE SUMMARY

| Phase | Duration | Focus | Key Milestone |
|-------|----------|--------|---------------|
| **Phase 1** | 3 weeks | Core scanning | Can scan & save cards |
| **Phase 2** | 2 weeks | Contact management | Complete RM99 tier |
| **Phase 3** | 1 week | WhatsApp integration | MVP complete |
| **Phase 4** | 1 week | Testing & polish | Production ready |
| **Phase 5** | 1 week | Launch | Live in app stores |
| **Phase 6** | 3 weeks | Premium features | Revenue generation |
| **Phase 7** | 3 weeks | Distributor system | Global scalability |

**Total: 14 weeks (3.5 months) to full platform**

---

## 🎯 SUCCESS CRITERIA

### MVP Success Metrics (After Phase 5):
- [ ] 100+ downloads in first month
- [ ] 70%+ user retention after first scan
- [ ] Average 5+ contacts scanned per active user
- [ ] 15%+ WhatsApp integration usage rate

### Pro Tier Success (After Phase 6):
- [ ] 5%+ conversion rate to Pro subscription
- [ ] $1000+ monthly recurring revenue
- [ ] 80%+ Pro user retention rate

### Platform Success (After Phase 7):
- [ ] 5+ active distributors
- [ ] $5000+ monthly revenue
- [ ] Multi-country presence

---

## 🚧 RISK MITIGATION

### Technical Risks:
- **OCR Accuracy**: Test Google Vision API early, have fallback manual input
- **Platform Compatibility**: Test on multiple devices throughout development
- **Performance**: Regular performance testing, especially image handling

### Business Risks:
- **User Adoption**: Launch RM99 tier with trial period to validate demand
- **Competition**: Focus on unique WhatsApp integration advantage
- **Revenue**: Validate payment willingness before Enterprise features

### Development Risks:
- **Scope Creep**: Stick to phases, resist adding features early
- **Timeline Delays**: Build in 20% buffer for each phase
- **Quality Issues**: Dedicated testing phase before launch

---

## 🧪 TEST-DRIVEN DEVELOPMENT (TDD) APPROACH

### **🔴 RED → 🟢 GREEN → 🔵 REFACTOR Cycle**

**Every feature follows this TDD pattern:**
1. **🔴 RED**: Write failing test first
2. **🟢 GREEN**: Write minimal code to pass test  
3. **🔵 REFACTOR**: Clean up code while tests pass
4. **✅ REPEAT**: Add more tests, improve implementation

### **🧪 TESTING FRAMEWORK SETUP (Day 1)**
```javascript
// Testing Stack
- Jest: Unit testing framework
- React Native Testing Library: Component testing
- Detox: End-to-end testing
- Flipper: Debugging and network inspection
- CodeCov: Test coverage reporting
```

### **📋 TESTING CATEGORIES**

#### **1. UNIT TESTS (70% of tests)**
**Test individual functions and components in isolation**

```javascript
// Example: Contact Parser Tests (Week 2)
describe('ContactParser', () => {
  it('should extract name from business card text', () => {
    const cardText = "John Smith\nSenior Developer\nABC Corp";
    const result = ContactParser.extractName(cardText);
    expect(result).toBe("John Smith");
  });

  it('should extract phone number with various formats', () => {
    expect(ContactParser.extractPhone("+1-555-123-4567")).toBe("+1-555-123-4567");
    expect(ContactParser.extractPhone("555.123.4567")).toBe("555.123.4567");
    expect(ContactParser.extractPhone("(555) 123-4567")).toBe("(555) 123-4567");
  });

  it('should handle missing information gracefully', () => {
    const cardText = "Just a name";
    const result = ContactParser.parseCard(cardText);
    expect(result.name).toBe("Just a name");
    expect(result.email).toBe("");
    expect(result.phone).toBe("");
  });
});
```

#### **2. INTEGRATION TESTS (20% of tests)**
**Test component interactions and API integrations**

```javascript
// Example: Supabase Integration Tests (Week 1)
describe('ContactService', () => {
  it('should save contact to database and return ID', async () => {
    const contact = {
      name: "Test User",
      email: "test@example.com",
      phone: "+1234567890"
    };
    
    const contactId = await ContactService.saveContact(contact);
    expect(contactId).toBeDefined();
    
    const savedContact = await ContactService.getContact(contactId);
    expect(savedContact.name).toBe(contact.name);
  });

  it('should handle offline mode and sync when online', async () => {
    // Test offline storage
    await ContactService.setOfflineMode(true);
    const contactId = await ContactService.saveContact(testContact);
    
    // Verify stored locally
    const localContacts = await ContactService.getOfflineContacts();
    expect(localContacts).toHaveLength(1);
    
    // Test sync when online
    await ContactService.setOfflineMode(false);
    await ContactService.syncOfflineContacts();
    
    const onlineContact = await ContactService.getContact(contactId);
    expect(onlineContact.name).toBe(testContact.name);
  });
});
```

#### **3. END-TO-END TESTS (10% of tests)**
**Test complete user workflows**

```javascript
// Example: Complete Scan Workflow (Week 6)
describe('Complete User Journey', () => {
  it('should complete scan-to-whatsapp workflow', async () => {
    // 1. Launch app
    await device.launchApp();
    
    // 2. Navigate to camera
    await element(by.id('camera-tab')).tap();
    
    // 3. Take photo (mock camera)
    await element(by.id('capture-button')).tap();
    
    // 4. Verify OCR extraction
    await expect(element(by.id('contact-name-input'))).toBeVisible();
    await expect(element(by.id('contact-name-input'))).toHaveText('John Smith');
    
    // 5. Edit contact info
    await element(by.id('contact-phone-input')).typeText('+1234567890');
    
    // 6. Send WhatsApp intro
    await element(by.id('whatsapp-button')).tap();
    
    // 7. Verify WhatsApp opens (mock)
    await expect(element(by.text('WhatsApp'))).toBeVisible();
    
    // 8. Verify contact saved
    await device.pressBack();
    await element(by.id('contacts-tab')).tap();
    await expect(element(by.text('John Smith'))).toBeVisible();
  });
});
```

### **📊 WEEKLY TDD TARGETS**

| Week | Unit Tests | Integration Tests | E2E Tests | Coverage |
|------|------------|-------------------|-----------|----------|
| **Week 1** | 15 tests | 5 tests | 2 tests | 80%+ |
| **Week 2** | 25 tests | 8 tests | 3 tests | 85%+ |
| **Week 3** | 35 tests | 12 tests | 4 tests | 85%+ |
| **Week 4** | 45 tests | 15 tests | 5 tests | 90%+ |
| **Week 5** | 55 tests | 18 tests | 6 tests | 90%+ |
| **Week 6** | 65 tests | 20 tests | 8 tests | 95%+ |
| **Week 7** | 75 tests | 25 tests | 10 tests | 95%+ |

### **🚀 TDD BENEFITS FOR NAMECARD.MY**

#### **🔒 QUALITY ASSURANCE:**
- **Catch bugs early** - Before they reach users
- **Prevent regressions** - New features don't break old ones  
- **Document behavior** - Tests serve as living documentation
- **Enable refactoring** - Confident code improvements

#### **⚡ DEVELOPMENT SPEED:**
- **Faster debugging** - Tests pinpoint exactly what broke
- **Confident deployments** - Green tests = ready to ship
- **Reduced manual testing** - Automated verification
- **Team collaboration** - Clear expectations in tests

#### **💰 BUSINESS VALUE:**
- **Higher app store ratings** - Fewer crashes and bugs
- **Lower support costs** - Less customer complaints
- **Faster feature development** - Solid foundation to build on
- **Subscriber retention** - Reliable app experience

### **🎯 DAILY TDD WORKFLOW**

```
Every Development Day:
1. 📝 Write test for new feature (RED)
2. 🔧 Write minimal code to pass (GREEN)  
3. 🎨 Refactor and improve (BLUE)
4. 🔄 Run full test suite
5. ✅ Commit only when all tests pass
```

**This TDD approach ensures every line of code is tested, every feature works reliably, and every user has a smooth experience!**