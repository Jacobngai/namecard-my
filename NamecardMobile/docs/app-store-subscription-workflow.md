# App Store Connect Subscription Setup Workflow (2024-2025)

**Research Date:** January 2025
**Sources:** Apple Developer Documentation, Superwall, RevenueCat, Expo Documentation

---

## ✅ CRITICAL ANSWER: BUILD FIRST OR SUBSCRIPTIONS FIRST?

**SUBSCRIPTIONS MUST BE CREATED BEFORE BUILD UPLOAD**

**The Correct Order:**

```
1. Create app in App Store Connect
2. Create subscription groups and products
3. Configure free trials (introductory offers)
4. Complete all localization and metadata
5. Ensure subscriptions are in "Ready to Submit" state
6. THEN upload build via EAS Submit
7. Test in TestFlight
8. Submit for App Review
```

**Why this order?**
- Subscriptions MUST be in "Ready to Submit" or "Approved" state to work in TestFlight
- Subscriptions in "Missing Metadata" state will NOT work during testing or review
- Your app code references subscription Product IDs, so they must exist before the build
- TestFlight can only test subscriptions that already exist in App Store Connect

---

## 📋 Step-by-Step Workflow for Free Trial Setup

### Phase 1: Prerequisites (Before ANY Subscription Work)

**Required Before You Start:**
1. ✅ Active Apple Developer Account ($99/year)
2. ✅ App created in App Store Connect
3. ✅ Bundle ID matches between Xcode/Expo and App Store Connect
4. ✅ Developer agreements signed
5. ✅ Tax and banking information submitted

### Phase 2: Create Subscription Group

**Location:** App Store Connect → Your App → App Store → Monetization → Subscriptions

1. Click "+" under "Subscription Groups"
2. Create subscription group:
   - **Reference Name:** e.g., "WhatsCard Premium Plans"
   - **Note:** Users can only subscribe to ONE product per group at a time
   - **Think of it like a menu:** Customer picks one item, can swap later

### Phase 3: Create Individual Subscriptions

**For Each Subscription (Monthly, Yearly):**

1. Click "+" under your subscription group
2. Fill in basic info:
   - **Reference Name:** Internal only (e.g., "WhatsCard Pro Monthly")
   - **Product ID:** Permanent identifier (e.g., `com.whatscard.pro.monthly`)
     - ⚠️ CANNOT be changed after creation
     - Include plan details in the name for clarity
3. Click "Create"

### Phase 4: Configure Subscription Details

**For Each Subscription, Configure:**

#### 4.1 Duration
- Select: 1 month, 1 year, etc.

#### 4.2 Availability
1. Click "Setup Availability"
2. Choose territories (countries where subscription will be sold)
3. Save

#### 4.3 Pricing
1. Click "Add Subscription Price"
2. Set base price in your currency
3. Apple auto-converts to all territories
4. Choose availability dates
5. Save

#### 4.4 Localization
1. Click "Add Localization"
2. Select language
3. Fill required fields:
   - **Display Name:** User-facing name (e.g., "Premium Monthly")
   - **Description:** What the user gets with this subscription
4. Repeat for all supported languages
5. Save

### Phase 5: Configure Free Trial (Introductory Offer)

**Critical for 3-Day Free Trial:**

1. Under your subscription, find "Subscription Prices"
2. Click the "+" button next to prices
3. Select "Create Introductory Offer"
4. Choose offer type:
   - ✅ **"Free"** (for free trial)
   - ❌ "Pay as you go" (discounted intro price)
   - ❌ "Pay up front" (one-time intro price)
5. Configure free trial:
   - **Duration:** 3 days
   - **Start Date:** Immediate or scheduled
   - **End Date:** Leave blank for ongoing
   - **Territories:** Match subscription availability
6. Click "Create"

**Important Free Trial Rules:**
- Users get ONE free trial PER SUBSCRIPTION GROUP (not per subscription)
- If user tries monthly free trial, they can't get yearly free trial (same group)
- Free trial starts immediately upon subscription
- User is NOT charged until trial ends
- User can cancel anytime during trial (no charge)
- Apple automatically bills at trial end unless canceled

### Phase 6: Review Information (REQUIRED for App Review)

1. Scroll to "Review Information" section
2. Upload screenshot showing:
   - Your paywall UI
   - The subscription displayed
   - Clear pricing and trial offer
3. Add review notes if needed
4. Save

### Phase 7: Verify "Ready to Submit" Status

**Before Uploading Build, Check:**
- ✅ Subscription status: "Ready to Submit" (NOT "Missing Metadata")
- ✅ All localizations complete
- ✅ Pricing configured for all territories
- ✅ Free trial (introductory offer) created
- ✅ Review screenshot uploaded
- ✅ Developer agreements active

**If Stuck in "Missing Metadata":**
- Check all required fields are filled
- Verify pricing is set
- Ensure at least one localization exists
- Confirm developer agreements are signed
- Submit tax/banking info if missing

---

## Phase 8: Build, Upload, and Test

### 8.1 Build Your App

**With Expo/EAS:**
```bash
cd NamecardMobile
eas build --platform ios --profile production
```

**Important:**
- Ensure your code includes the subscription Product IDs you created
- Implement StoreKit 2 for subscription handling
- Test locally with StoreKit Configuration File first

### 8.2 Upload to App Store Connect

**With EAS Submit:**
```bash
eas submit --platform ios --latest
```

**What Happens:**
1. Build uploads to App Store Connect
2. Build enters "Processing" phase (5-10 minutes)
3. Build becomes available in TestFlight
4. Build status changes to "Ready to Submit"

### 8.3 TestFlight Testing

**2024 Critical Update:**
- TestFlight subscriptions now renew **every 24 hours** (changed December 2024)
- Previously: Renewed every few minutes for rapid testing
- Now: More realistic testing, but slower

**Testing Subscriptions in TestFlight:**
1. Add internal or external testers
2. Testers must use sandbox Apple ID (NOT production)
3. Create sandbox tester accounts in App Store Connect:
   - App Store Connect → Users and Access → Sandbox Testers
4. Tester downloads via TestFlight
5. Tester initiates subscription
6. Free trial starts (3 days in TestFlight = 3 real days)
7. Verify subscription state in your app

**TestFlight Subscription Limitations:**
- Subscriptions do NOT charge real money
- Free trials work exactly as in production
- Cancellations can be tested
- Renewals occur every 24 hours

---

## 🚨 First-Time Submission Special Requirements

**If This Is Your FIRST In-App Purchase EVER for This App:**

Apple requires:
1. **Must submit subscription WITH a new app version**
2. If you have multiple subscriptions, submit ALL of them together
3. Cannot submit subscription alone without app update

**After First Approval:**
- You can add new subscriptions WITHOUT submitting new app versions
- New subscriptions can be created and submitted anytime
- Existing app will automatically see new subscriptions

---

## 📱 StoreKit 2 Implementation (Code Side)

**After App Store Connect Setup, Implement in Code:**

### 1. Fetch Products
```swift
let productIDs = ["com.whatscard.pro.monthly", "com.whatscard.pro.yearly"]
let products = try await Product.products(for: productIDs)
```

### 2. Check Free Trial Eligibility
```swift
for product in products {
    if let subscription = product.subscription {
        let isEligible = await subscription.isEligibleForIntroOffer
        // Display "Start Free Trial" if eligible
        // Display regular price if not eligible
    }
}
```

### 3. Purchase Subscription
```swift
let result = try await product.purchase()
switch result {
    case .success(let verification):
        // Unlock premium features
    case .userCancelled:
        // User cancelled
    case .pending:
        // Awaiting approval
}
```

### 4. Handle Subscription Status
```swift
for await result in Transaction.updates {
    // Handle subscription state changes
    // (renewals, cancellations, expirations)
}
```

---

## 🎯 Summary: The Golden Rules

1. ✅ **Create subscriptions BEFORE uploading build**
2. ✅ **Ensure "Ready to Submit" status before TestFlight**
3. ✅ **First subscription must be submitted with app version**
4. ✅ **Free trials = Introductory Offers with "Free" type**
5. ✅ **One free trial per subscription group per user (lifetime)**
6. ✅ **Upload paywall screenshot in Review Information**
7. ✅ **TestFlight subscriptions renew every 24 hours (2024 update)**

---

## 🔗 Official Documentation Links

- [App Store Connect Workflow](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-workflow/)
- [Offer Auto-Renewable Subscriptions](https://developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions)
- [Set Up Introductory Offers](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions)
- [StoreKit 2 Documentation](https://developer.apple.com/documentation/storekit)
- [WWDC 2024: Implement App Store Offers](https://developer.apple.com/videos/play/wwdc2024/10110/)
- [Expo Submit iOS](https://docs.expo.dev/submit/ios/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

## 📝 Next Steps for WhatsCard

Based on this research, here's your action plan:

1. ✅ Complete all App Store Connect prerequisites (agreements, tax, banking)
2. ✅ Create subscription group: "WhatsCard Premium"
3. ✅ Create two subscriptions:
   - `com.whatscard.pro.monthly` - RM199/year (monthly billing)
   - `com.whatscard.pro.yearly` - RM199/year (yearly billing)
4. ✅ Configure 3-day free trials for both
5. ✅ Add localization (English, Malay)
6. ✅ Upload paywall screenshot
7. ✅ Verify "Ready to Submit" status
8. ✅ Build with EAS: `eas build --platform ios --profile production`
9. ✅ Submit with EAS: `eas submit --platform ios --latest`
10. ✅ Test in TestFlight
11. ✅ Submit for App Review

**Timeline Estimate:**
- App Store Connect setup: 1-2 hours
- Build and upload: 30 minutes
- Processing time: 10-15 minutes
- TestFlight testing: 1-2 days
- App Review: 1-3 days

**Total:** ~3-5 days from subscription creation to App Store approval
