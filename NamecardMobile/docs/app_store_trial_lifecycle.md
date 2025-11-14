# App Store Trial Cancellation Behavior & Subscription Lifecycle

**Research Date:** 2025-11-07
**Project:** WhatsCard 1.0 (NAMECARD.MY)
**Purpose:** Implementation-critical documentation for react-native-iap subscription handling

---

## CRITICAL QUESTIONS ANSWERED

### 1. When user clicks "Start 3-Day Free Trial" and confirms, when EXACTLY does the trial start?

**Answer:** The trial starts **immediately upon purchase confirmation**.

**Evidence:**
- The `original_purchase_date` field in the receipt indicates the beginning of the subscription period
- StoreKit generates a Transaction with its own `expiresDate` specifically for the trial duration
- App Store confirmation message states: "This subscription will start with a free trial lasting [X] days after which you will be charged $[amount]"

**Implementation Impact:**
- Trial access should be granted immediately upon successful purchase
- Use `original_purchase_date` from receipt to determine trial start
- For StoreKit 2: Check Transaction's `expiresDate` to determine when trial ends

---

### 2. If user cancels during trial, do they keep access until trial ends or lose access immediately?

**Answer:** **For third-party apps (like WhatsCard), users KEEP ACCESS until trial ends.**

**Apple Policy (Critical Distinction):**

**Third-Party Apps (Enforced by Apple):**
- ✅ **Users retain access** to premium features until the trial period expires
- Apple mandates this consumer-friendly behavior for all third-party developers
- Cancellation only disables auto-renewal; does not revoke entitlement

**Apple's Own Services (Inconsistent):**
- ❌ Apple Music and some Apple services may **remove access immediately** upon cancellation
- Behavior varies by country/region (US vs UK reported differences)

**Implementation Impact for WhatsCard:**
```typescript
// CORRECT IMPLEMENTATION
// Check if trial has expired, not if subscription is canceled
const isTrialActive = (subscription) => {
  const now = Date.now();
  const expiresDate = subscription.expiresDate; // From StoreKit Transaction
  const isCanceled = !subscription.willAutoRenew;

  // User keeps access even if canceled, until trial expires
  return now < expiresDate;
};

// WRONG IMPLEMENTATION (DO NOT USE)
const isTrialActive = (subscription) => {
  return subscription.willAutoRenew; // This would immediately revoke access on cancellation
};
```

**Key Receipt Fields:**
- `expires_date` / `expires_date_ms` - When subscription expires (UNIX epoch time in milliseconds)
- `is_trial_period` - Boolean indicating if current period is a trial
- `auto_renew_status` - Set to `false` when user cancels (but access remains until `expires_date`)

---

### 3. When trial ends, what happens if user hasn't canceled?

**Answer:** Subscription **automatically converts to paid** at the end of the trial period.

**Opt-Out Trial Model (App Store Standard):**
- Trial automatically switches to paid subscription after expiration
- This is the default behavior for all App Store trials
- Depends on user inertia (many users continue either out of satisfaction or forgetting to cancel)

**Trial Duration Options Available:**
- 3 days (WhatsCard uses this)
- 1 week
- 2 weeks
- 1 month
- 2 months
- 3 months
- 6 months
- 1 year

**Implementation Impact:**
- No additional code needed for conversion (handled by Apple)
- Monitor for `DID_CHANGE_RENEWAL_STATUS` notification from StoreKit
- Subscription state transitions from "trial" to "active paid" automatically

---

### 4. How long after trial ends until auto-charge happens?

**Answer:** Auto-charge happens **immediately** at the end of the trial period (at `expires_date`).

**Important Timing Rules:**

**24-Hour Cancellation Window:**
- Users must cancel **at least 24 hours BEFORE** trial ends to avoid being charged
- This is Apple's required cancellation deadline

**Example Timeline (3-Day Trial):**
```
Day 0, 10:00 AM - User starts trial (original_purchase_date)
Day 3, 10:00 AM - Trial expires (expires_date)
Day 3, 10:00 AM - Auto-charge occurs (if not canceled 24+ hours prior)

To avoid charge, user must cancel by:
Day 2, 10:00 AM (24 hours before trial expiration)
```

**Implementation Impact:**
```typescript
// Calculate cancellation deadline
const getCancellationDeadline = (expiresDate: Date) => {
  return new Date(expiresDate.getTime() - (24 * 60 * 60 * 1000)); // 24 hours before expiry
};

// Check if user can still cancel without being charged
const canCancelWithoutCharge = (expiresDate: Date) => {
  const deadline = getCancellationDeadline(expiresDate);
  return Date.now() < deadline.getTime();
};
```

**Display to User:**
- Show: "Cancel by [date/time] to avoid being charged"
- Use red warning text when within 24-hour window
- Consider push notification 48 hours before trial ends

---

### 5. Can user start trial, cancel, then re-subscribe within the 3 days?

**Answer:** **No, but they can re-subscribe to a PAID subscription (not another trial).**

**Trial Eligibility Rules:**
- A user is **NOT eligible** for a free trial if they already used:
  1. An introductory offer of that subscription
  2. Any subscription within the same subscription group
- Apple tracks this via `is_trial_period` and `is_in_intro_offer_period` fields in receipt history

**What Happens If User Tries to Re-Subscribe During Canceled Trial:**
- User will be charged full price immediately (no trial offered)
- They will have access until the new paid subscription period expires

**Implementation Impact:**
```typescript
// Check trial eligibility before showing trial offer
const isEligibleForTrial = (purchaseHistory) => {
  // Check all previous transactions in receipt
  for (const transaction of purchaseHistory) {
    if (transaction.is_trial_period === "true" ||
        transaction.is_in_intro_offer_period === "true") {
      return false; // User already used trial
    }
  }
  return true;
};

// For canceled but not expired trials
const handleReSubscribeDuringTrial = (subscription) => {
  if (!subscription.willAutoRenew && Date.now() < subscription.expiresDate) {
    // User canceled but trial still active
    // Offer to re-enable auto-renewal (free, keeps current trial)
    return {
      action: "reEnableAutoRenewal",
      message: "Your trial is still active. Re-enable to continue after trial ends.",
      cost: "No charge now. $199/year after trial."
    };
  } else if (Date.now() > subscription.expiresDate) {
    // Trial expired, user wants to re-subscribe
    return {
      action: "purchasePaidSubscription",
      message: "Trial expired. Subscribe for full access.",
      cost: "$199/year (charged immediately)"
    };
  }
};
```

**Re-subscription Process (After Cancellation):**
- Handled as a **new purchase** in your app (same code path as original subscription)
- User can find expired subscriptions in iOS Settings > Apple ID > Subscriptions > Expired section
- Or re-purchase directly from your app's subscription screen

**StoreKit 2 API:**
- Use `isEligibleForIntroOffer` property to check eligibility
- Pass subscription group ID to determine if user has used trial before

---

### 6. Difference between StoreKit 1 vs StoreKit 2 for trial handling?

**Answer:** StoreKit 2 provides **significant improvements** but both can handle trials correctly.

---

## StoreKit 1 vs StoreKit 2 Comparison

### StoreKit 1 Limitations

**Trial Management:**
- ❌ No built-in tools for managing free trial time, introductory offers, or grace periods
- ❌ Must manually parse and validate receipts (complex, error-prone)
- ❌ Receipt validation is the **only way** to determine purchases and entitlements

**Trial Detection:**
```swift
// StoreKit 1 - Complex receipt parsing required
let receiptURL = Bundle.main.appStoreReceiptURL
let receiptData = try Data(contentsOf: receiptURL!)
// Send to your server or Apple's verifyReceipt endpoint
// Parse JSON response to find is_trial_period field
```

**Compatibility:**
- ✅ Works with iOS 3.0+
- ✅ Required for apps supporting iOS 14 and earlier

---

### StoreKit 2 Improvements

**Simplified Trial API:**
```swift
// StoreKit 2 - Clean, native Swift API
if let subscription = product.subscription {
    // Check eligibility
    let isEligible = await subscription.isEligibleForIntroOffer

    // Get offer details
    if let introOffer = subscription.introductoryOffer {
        switch introOffer.paymentMode {
        case .freeTrial:
            print("Free trial available")
        case .payUpFront:
            print("Upfront discount")
        case .payAsYouGo:
            print("Per-period discount")
        }
    }
}
```

**Better Subscription Management:**
- ✅ `Transaction.currentEntitlements` - Get active subscriptions directly
- ✅ Native subscription status: `subscribed`, `expired`, `inBillingRetryPeriod`, `inGracePeriod`, `revoked`
- ✅ Simplified refund requests and purchase verification
- ✅ No need for manual receipt parsing

**Trial State Checking:**
```swift
// StoreKit 2 - Direct access to trial status
for await transaction in Transaction.currentEntitlements {
    if let subscription = transaction.subscription {
        // Check if trial is active
        let isInTrial = subscription.currentEntitlement?.offerType == .introductory
        let expiresDate = subscription.currentEntitlement?.expirationDate

        // Grant access until expiresDate (even if canceled)
        if Date.now < expiresDate {
            grantAccess()
        }
    }
}
```

**Key Fields in StoreKit 2:**

**JWSTransactionDecodedPayload:**
- `offerType` - Set to `1` for introductory offers (including free trials)
- `expiresDate` - When transaction expires (milliseconds since epoch)
- `originalPurchaseDate` - When subscription was first purchased
- `revocationDate` - If subscription was refunded/revoked

**JWSRenewalInfoDecodedPayload:**
- `autoRenewStatus` - Boolean, `false` when user cancels
- `expirationIntent` - Reason subscription will expire (if canceled)
- `gracePeriodExpiresDate` - If in billing grace period

**Compatibility:**
- ⚠️ **Requires iOS 15+**
- ⚠️ Must use StoreKit 1 for iOS 14 and earlier support

---

## Trial Handling in react-native-iap

**Recommended for WhatsCard:**
- Use `react-native-iap` v12.15.4 (compatible with Expo SDK 53)
- Works with both StoreKit 1 and StoreKit 2 (library abstracts the differences)
- Provides unified API for iOS and Android

**Key Functions:**

```typescript
import {
  getSubscriptions,
  requestSubscription,
  getPurchaseHistory,
  getAvailablePurchases,
} from 'react-native-iap';

// 1. Check if user is eligible for trial
const checkTrialEligibility = async () => {
  const purchaseHistory = await getPurchaseHistory();

  // Check if any previous transaction used trial
  for (const purchase of purchaseHistory) {
    if (purchase.transactionReceipt) {
      const receipt = JSON.parse(purchase.transactionReceipt);
      if (receipt.is_trial_period === "true") {
        return false; // Already used trial
      }
    }
  }
  return true;
};

// 2. Initiate trial subscription
const startTrial = async () => {
  try {
    await requestSubscription({
      sku: 'com.namecard.pro.monthly', // Product ID
    });
    // Trial starts immediately upon success
  } catch (error) {
    console.error('Trial purchase failed:', error);
  }
};

// 3. Check current subscription status
const checkSubscriptionStatus = async () => {
  const purchases = await getAvailablePurchases();

  for (const purchase of purchases) {
    const receipt = JSON.parse(purchase.transactionReceipt);
    const expiresDate = new Date(parseInt(receipt.expires_date_ms));
    const now = new Date();

    // User has access if subscription hasn't expired (even if canceled)
    if (now < expiresDate) {
      return {
        isActive: true,
        isInTrial: receipt.is_trial_period === "true",
        expiresDate: expiresDate,
        willAutoRenew: purchase.autoRenewingAndroid || receipt.auto_renew_status === "1",
      };
    }
  }

  return { isActive: false };
};

// 4. Handle cancellation (user still has access until expires_date)
const handleCancellation = (subscription) => {
  // User canceled but trial not yet expired
  if (!subscription.willAutoRenew && subscription.isActive) {
    // Show message: "Your trial will end on [expiresDate]"
    // Do NOT revoke access immediately
    return {
      message: `Trial active until ${subscription.expiresDate.toLocaleDateString()}`,
      showReEnableButton: true,
    };
  }
};

// 5. Deep link to subscription management
import { deepLinkToSubscriptions } from 'react-native-iap';

const manageSubscription = () => {
  // Opens iOS Settings > Apple ID > Subscriptions
  deepLinkToSubscriptions();
};
```

**Important Receipt Fields:**
- `original_purchase_date_ms` - Trial start time (UNIX milliseconds)
- `expires_date_ms` - Trial end time (UNIX milliseconds) - **USE THIS FOR ACCESS CONTROL**
- `is_trial_period` - "true" if in trial, "false" if paid
- `auto_renew_status` - "1" if will renew, "0" if canceled
- `cancellation_date_ms` - If subscription was refunded (rare)

---

## Billing Retry & Grace Period (When Trial Converts to Paid)

### Billing Retry Process (Automatic - All Subscriptions)

**What Happens When Payment Fails:**
1. Trial expires at `expires_date`
2. Apple attempts to charge for first paid period
3. If payment fails, subscription enters **Billing Retry State**
4. Apple retries billing over **60 days** with increasing intervals
5. If all retries fail, subscription expires permanently

**During Billing Retry:**
- ❌ **User does NOT have access** (subscription is considered inactive)
- App Store continues attempting to charge
- User can update payment method to restore subscription

**Implementation:**
```typescript
// Check if subscription is in billing retry
const checkBillingRetry = (subscription) => {
  const state = subscription.subscriptionState;

  if (state === 'inBillingRetryPeriod') {
    // Subscription inactive but Apple still retrying
    return {
      hasAccess: false,
      message: "Payment issue. Please update payment method.",
      action: "deepLinkToSubscriptions"
    };
  }
};
```

---

### Grace Period (Optional - Developer Configures)

**What is Grace Period:**
- Developer can enable grace period in App Store Connect
- Gives users **continued access** while Apple retries billing
- Prevents service interruption for billing issues

**Grace Period Duration Options:**
- 3 days
- 16 days (recommended by Apple)
- 28 days
- ⚠️ **Weekly subscriptions:** Maximum 6 days (regardless of selection)

**When Grace Period Applies:**
- Can be configured for "All Renewals" (including trial-to-paid conversion)
- Or "Only Paid to Paid Renewals" (excludes trial-to-paid conversions)

**Implementation:**
```typescript
// Check if subscription is in grace period
const checkGracePeriod = (subscription) => {
  const state = subscription.subscriptionState;

  if (state === 'inGracePeriod') {
    // User still has access, but payment issue needs resolution
    return {
      hasAccess: true,
      showWarning: true,
      message: "Payment issue. Update payment method to continue service.",
      gracePeriodEnds: subscription.gracePeriodExpiresDate
    };
  }
};
```

**StoreKit 2 Grace Period Detection:**
```swift
if subscription.state == .inGracePeriod {
    // User has access but needs to fix billing
    let gracePeriodEnds = subscription.gracePeriodExpiresDate
    showBillingWarning(expiresAt: gracePeriodEnds)
}
```

**Key Difference:**
- **Billing Retry:** No access during retry period (60 days max)
- **Grace Period:** Access continues during retry period (3-28 days max)

**Recommendation for WhatsCard:**
- ✅ **Enable 16-day grace period** for all renewals
- ✅ Show in-app warning when subscription enters grace period
- ✅ Provide button to update payment method (deep link to subscriptions)
- ✅ Send push notification 3 days before grace period ends

---

## Subscription State Machine (Complete Lifecycle)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUBSCRIPTION LIFECYCLE                        │
└─────────────────────────────────────────────────────────────────┘

1. USER STARTS TRIAL
   ├─ User clicks "Start 3-Day Free Trial"
   ├─ Confirms in App Store sheet
   ├─ original_purchase_date = NOW
   ├─ expires_date = NOW + 3 days
   ├─ is_trial_period = "true"
   ├─ auto_renew_status = "1"
   └─ ✅ ACCESS GRANTED IMMEDIATELY

2. USER CANCELS TRIAL (Optional)
   ├─ User navigates to iOS Settings > Subscriptions
   ├─ Clicks "Cancel Subscription"
   ├─ auto_renew_status = "0"
   ├─ expires_date = UNCHANGED
   ├─ is_trial_period = "true"
   └─ ✅ ACCESS CONTINUES UNTIL expires_date

3. TRIAL EXPIRES (Day 3)
   ├─ Current time reaches expires_date
   │
   ├─ IF USER CANCELED (auto_renew_status = "0"):
   │  ├─ Subscription expires
   │  ├─ is_trial_period = "true"
   │  ├─ No charge occurs
   │  └─ ❌ ACCESS REVOKED
   │
   └─ IF USER DID NOT CANCEL (auto_renew_status = "1"):
      ├─ Apple attempts to charge $199
      │
      ├─ IF PAYMENT SUCCEEDS:
      │  ├─ New transaction created
      │  ├─ is_trial_period = "false"
      │  ├─ expires_date = NOW + 1 year
      │  └─ ✅ ACCESS CONTINUES (now paid)
      │
      └─ IF PAYMENT FAILS:
         ├─ IF GRACE PERIOD ENABLED:
         │  ├─ state = "inGracePeriod"
         │  ├─ grace_period_expires_date = NOW + 16 days
         │  ├─ ✅ ACCESS CONTINUES (warning shown)
         │  ├─ Apple retries billing for 16 days
         │  └─ If payment fixed: Convert to paid subscription
         │     If not fixed: Enter Billing Retry (no access)
         │
         └─ IF GRACE PERIOD DISABLED:
            ├─ state = "inBillingRetryPeriod"
            ├─ ❌ ACCESS REVOKED
            ├─ Apple retries billing for 60 days
            └─ If payment fixed: Restore access
               If not fixed: Subscription expires permanently

4. PAID SUBSCRIPTION ACTIVE
   ├─ is_trial_period = "false"
   ├─ auto_renew_status = "1"
   ├─ expires_date = 1 year from trial end
   └─ ✅ ACCESS GRANTED

5. USER CANCELS PAID SUBSCRIPTION
   ├─ auto_renew_status = "0"
   ├─ expires_date = UNCHANGED
   └─ ✅ ACCESS CONTINUES UNTIL expires_date

6. PAID SUBSCRIPTION EXPIRES
   ├─ Current time reaches expires_date
   ├─ No more renewal attempts
   └─ ❌ ACCESS REVOKED
```

---

## Implementation Checklist for WhatsCard

### Pre-Launch Setup

- [ ] Create subscription products in App Store Connect:
  - `com.namecard.pro.monthly` - RM199/year with 3-day trial
  - `com.namecard.enterprise` - RM599/year with 3-day trial
- [ ] Enable **16-day grace period** for all renewals
- [ ] Configure introductory offer: 3-day free trial
- [ ] Submit subscription metadata and screenshots
- [ ] Test subscription flow in Sandbox environment

### Code Implementation

- [ ] Install `react-native-iap@12.15.4`
- [ ] Add Gradle configuration for `missingDimensionStrategy 'store', 'play'`
- [ ] Implement trial eligibility checking (`is_trial_period` in purchase history)
- [ ] Implement subscription status checking (use `expires_date_ms`, not `auto_renew_status`)
- [ ] Grant access if `Date.now() < expires_date_ms` (even if canceled)
- [ ] Show trial countdown in UI ("3 days remaining")
- [ ] Show cancellation deadline warning ("Cancel by [date] to avoid charge")
- [ ] Implement grace period detection and warning UI
- [ ] Add "Manage Subscription" button → `deepLinkToSubscriptions()`
- [ ] Handle re-subscription flow (check if user already used trial)

### UI/UX Requirements

- [ ] Trial offer screen:
  - "Start 3-Day Free Trial"
  - "Then RM199/year"
  - "Cancel anytime before [date] to avoid charge"
- [ ] Active trial screen:
  - "Trial ends in X days"
  - "Cancel by [date] to avoid being charged"
  - "Manage Subscription" button
- [ ] Canceled trial screen:
  - "Trial active until [date]"
  - "Re-enable auto-renewal?" button
- [ ] Grace period warning:
  - "Payment issue detected"
  - "Update payment method to continue"
  - Red banner with urgency
- [ ] Billing retry screen:
  - "Subscription inactive"
  - "Update payment method to restore access"
  - "Manage Subscription" button

### Testing Scenarios

- [ ] Start trial → Verify immediate access
- [ ] Cancel trial → Verify access continues until expires_date
- [ ] Wait for trial to expire (canceled) → Verify access revoked
- [ ] Wait for trial to expire (not canceled) → Verify auto-charge and paid access
- [ ] Simulate payment failure → Verify grace period warning (if enabled)
- [ ] Simulate payment failure → Verify billing retry (no access)
- [ ] Try to start trial again → Verify "Already used trial" message
- [ ] Test re-subscription after cancellation → Verify full price charge

### Backend Integration

- [ ] Set up receipt validation endpoint (validate with Apple's servers)
- [ ] Store subscription status in Supabase `users` table:
  - `subscription_status`: 'trial' | 'active' | 'canceled' | 'expired' | 'grace_period' | 'billing_retry'
  - `trial_start_date`: original_purchase_date
  - `trial_end_date`: expires_date (for trial period)
  - `subscription_expires_date`: expires_date (for current period)
  - `auto_renew_enabled`: auto_renew_status
- [ ] Create webhook listener for App Store Server Notifications:
  - `DID_CHANGE_RENEWAL_STATUS` (user canceled)
  - `DID_RENEW` (trial converted to paid)
  - `DID_FAIL_TO_RENEW` (entered billing retry)
  - `GRACE_PERIOD_EXPIRED` (grace period ended without payment)
- [ ] Sync subscription status on app launch
- [ ] Handle subscription expiration cleanup

---

## Common Pitfalls & Solutions

### ❌ WRONG: Revoking access immediately when user cancels
```typescript
// DON'T DO THIS
if (!subscription.autoRenewStatus) {
  revokeAccess(); // User loses access immediately!
}
```

### ✅ CORRECT: Check expires_date, not auto-renewal status
```typescript
// DO THIS
if (Date.now() < subscription.expiresDate) {
  grantAccess(); // User keeps access even if canceled
}
```

---

### ❌ WRONG: Assuming trial starts at arbitrary time
```typescript
// DON'T DO THIS
const trialStart = new Date(); // Wrong! Not when you check, but when purchased
```

### ✅ CORRECT: Use original_purchase_date from receipt
```typescript
// DO THIS
const trialStart = new Date(receipt.original_purchase_date_ms);
const trialEnd = new Date(receipt.expires_date_ms);
```

---

### ❌ WRONG: Not handling grace period
```typescript
// DON'T DO THIS
if (subscription.state === 'inGracePeriod') {
  revokeAccess(); // User should still have access!
}
```

### ✅ CORRECT: Continue access during grace period with warning
```typescript
// DO THIS
if (subscription.state === 'inGracePeriod') {
  grantAccess();
  showBillingWarning("Payment issue. Update payment method.");
}
```

---

### ❌ WRONG: Not checking trial eligibility
```typescript
// DON'T DO THIS
// Always showing "Start Free Trial" button
```

### ✅ CORRECT: Check purchase history for prior trial usage
```typescript
// DO THIS
const isEligible = await checkTrialEligibility();
if (isEligible) {
  showButton("Start 3-Day Free Trial");
} else {
  showButton("Subscribe for RM199/year");
}
```

---

## Summary: Key Implementation Rules

1. **Trial starts immediately** upon purchase confirmation (`original_purchase_date`)
2. **User keeps access** until trial expires (`expires_date`), even if they cancel
3. **Auto-charge happens immediately** at trial expiration (if not canceled 24+ hours prior)
4. **Check `expires_date`, not `auto_renew_status`** for access control
5. **Trial is one-time only** per user per subscription group
6. **Re-subscription after cancellation** is possible but will be charged full price (no trial)
7. **Use StoreKit 2** if possible (iOS 15+) for cleaner API
8. **react-native-iap handles both** StoreKit 1 and 2 transparently
9. **Enable grace period** for better user experience during billing issues
10. **Deep link to subscription management** - don't try to build in-app cancellation UI

---

## Additional Resources

### Official Documentation
- [App Store Subscriptions Overview](https://developer.apple.com/app-store/subscriptions/)
- [Set Up Introductory Offers (Apple)](https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions)
- [StoreKit 2 Documentation](https://developer.apple.com/storekit/)
- [Receipt Fields Reference](https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ReceiptFields.html)

### Libraries
- [react-native-iap GitHub](https://github.com/dooboolab/react-native-iap)
- [react-native-iap Type Definitions](https://unpkg.com/browse/react-native-iap@6.0.0/src/types/apple.d.ts)

### Tutorials
- [iOS In-App Subscription Tutorial with StoreKit 2 (RevenueCat)](https://www.revenuecat.com/blog/engineering/ios-in-app-subscription-tutorial-with-storekit-2-and-swift/)
- [Implement Free Trials with StoreKit 2 (HackerNoon)](https://hackernoon.com/implement-free-trials-in-your-app-with-storekit-2-a-step-by-step-guide)
- [Subscription in React Native Guide (Medium)](https://medium.com/@subtain.techling/subscription-in-react-native-a-comprehensive-guide-75fa1ec34f95)

### Benchmark Data
- [App Subscription Trial Benchmarks 2025](https://www.businessofapps.com/data/app-subscription-trial-benchmarks/)
- [Trial Conversion Rates (RevenueCat)](https://www.revenuecat.com/blog/growth/app-trial-conversion-rate-insights/)

---

## Version History

**v1.0 - 2025-11-07**
- Initial research and documentation
- Covers StoreKit 1 & 2, react-native-iap integration
- Includes complete lifecycle state machine
- Trial cancellation behavior clarified (third-party apps keep access)
- Billing retry and grace period explained

---

**Document Status:** ✅ Ready for implementation
**Saved to:** `C:\Users\walte\OneDrive\Desktop\Claude CODE\NAMECARD.MY 1.0.0\NamecardMobile\docs\app_store_trial_lifecycle.md`
