# Google Play Billing: Free Trial Lifecycle & Subscription Behavior

**Research Date:** January 2025
**Sources:** Android Developer Documentation, Google Play Console Help

---

## CRITICAL ANSWERS

### 1. When EXACTLY does the trial start?

**Answer:** Trial starts **immediately upon purchase confirmation** when the user completes the transaction.

- User clicks "Start 3-Day Free Trial"
- Google Play verifies valid payment method exists
- User confirms purchase → **Trial begins at this moment**
- Timer starts counting down from 3 days (72 hours)

**Payment Method Verification:**
- Google may place a temporary hold/charge to verify payment method
- This hold is **reversed or refunded** automatically
- Verification happens **before** trial begins

---

### 2. If user cancels during trial, do they keep access?

**Answer:** **YES - Users RETAIN full access until trial period ends**

**Official Policy:**
> "If a user cancels a subscription at any time during the free trial, the subscription remains active until the end of the trial, and they aren't charged when the free trial period ends."

**What happens when user cancels during trial:**
1. User cancels subscription (any time during 3-day trial)
2. Google Play marks subscription as "will not renew"
3. User **keeps full access** to premium features
4. Timer continues counting down
5. At trial end (Day 3, 11:59 PM): Subscription expires
6. User **is NOT charged**
7. Premium access ends

**Key Insight:** Unlike some platforms that revoke access immediately, Google Play follows the **"access until end of period"** model for trials.

---

### 3. When trial ends, what happens if user hasn't canceled?

**Answer:** **Automatic conversion to paid subscription with immediate charge**

**Timeline:**
```
Day 0, 12:00 PM: Trial starts
Day 3, 11:59 PM: Trial ends
Day 3, 12:00 AM (next day): AUTOMATIC CHARGE occurs
                             First billing period begins
```

**Automatic Conversion Process:**
1. Trial period completes (3 days)
2. Google Play **immediately charges** the user's payment method
3. Subscription converts to **full paid subscription**
4. Billing interval begins (monthly/yearly based on plan)
5. User receives receipt notification
6. Developer receives `SUBSCRIPTION_RENEWED` notification

**Official Policy:**
> "The trial period runs for the period of time that you set and then automatically converts to a full subscription managed according to the subscription's billing interval and price."

**No Grace Period for Trial Conversion:**
- First charge happens **immediately** when trial ends
- No "few hours later" or "next day" delay
- User is charged at 12:00:01 AM on Day 4 (end of trial)

---

### 4. How long after trial ends until auto-charge happens?

**Answer:** **IMMEDIATELY (0 minutes delay)**

**Exact Timing:**
- Trial End: Day 3, 11:59:59 PM
- First Charge: Day 4, 12:00:00 AM (1 second later)

**If Payment Fails:**

Google Play has a **recovery system** for failed payments:

#### Grace Period (Optional, developer-configured)
- Duration: Up to 48 hours or longer
- User **retains access** to subscription
- Google retries payment multiple times
- Developer receives `SUBSCRIPTION_IN_GRACE_PERIOD` notification

#### Account Hold (After Grace Period)
- Duration: Up to 60 days
- User **loses access** to subscription
- Google continues retry attempts
- Developer receives `SUBSCRIPTION_ON_HOLD` notification
- **Total recovery period (Grace + Hold) must be ≥30 days**

#### Recovery or Cancellation
- **If payment succeeds:** Subscription restored (`SUBSCRIPTION_RECOVERED`)
- **If payment fails after 60 days:** Subscription canceled (`SUBSCRIPTION_EXPIRED`)

**Key Timeline:**
```
Trial End → Immediate Charge Attempt
         ↓ (if fails)
    Grace Period (0-48hrs+, user keeps access)
         ↓ (if still fails)
    Account Hold (up to 60 days, user loses access)
         ↓ (if still fails)
    Subscription Canceled
```

---

### 5. Can user start trial, cancel, then re-subscribe within the 3 days?

**Answer:** **YES, but with important limitations**

#### Scenario A: Re-subscribe While Trial Still Active

**User cancels on Day 1 of 3-day trial:**
1. User still has 2 days of trial access remaining
2. User can click "Resubscribe" in Google Play subscriptions
3. **Same subscription continues** (same purchase token)
4. Auto-renewal is **turned back ON**
5. User will be charged when trial ends on Day 3

**Key Point:** This is **restoring** the existing trial, not starting a new one.

#### Scenario B: Re-subscribe After Trial Expires

**If user lets trial expire without re-subscribing:**
1. Trial ends on Day 3
2. User loses premium access
3. User can re-subscribe later (up to 1 year)
4. **NEW subscription created** (new purchase token)
5. **NO new trial** - User is charged immediately at full price

**Official Policy:**
> "If a user resubscribes to the same SKU, they are no longer eligible for free trials or introductory price."

#### Trial Eligibility Rules

**One Trial Per User Per Subscription:**
- Each Google account can use **one free trial per subscription product** (SKU)
- Canceling and re-subscribing does **NOT grant another trial**
- This prevents trial abuse

**Example:**
- User A uses 3-day trial for "Pro Monthly" → **Trial used**
- User A cancels and re-subscribes to "Pro Monthly" → **Charged immediately (no trial)**
- User A subscribes to "Pro Yearly" → **New trial available** (different SKU)

---

## SUBSCRIPTION LIFECYCLE STATES

### State Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     PURCHASE INITIATED                       │
│                  (User clicks "Subscribe")                   │
└────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  TRIAL ACTIVE   │ ◄──── User can cancel
                    │   (3 days)      │       and keep access
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
           (Canceled)              (Not Canceled)
                │                         │
                ▼                         ▼
         ┌──────────────┐       ┌────────────────┐
         │ TRIAL EXPIRES│       │ AUTO-CHARGE    │
         │  (No Charge) │       │  (Immediate)   │
         └──────────────┘       └────────┬───────┘
                                          │
                            ┌─────────────┴──────────────┐
                            │                            │
                       (Success)                    (Failure)
                            │                            │
                            ▼                            ▼
                  ┌──────────────────┐         ┌─────────────────┐
                  │  PAID ACTIVE     │         │  GRACE PERIOD   │
                  │  (Renews)        │         │  (Keeps Access) │
                  └──────────────────┘         └────────┬────────┘
                                                         │
                                              ┌──────────┴─────────┐
                                              │                    │
                                         (Recovered)          (Failed)
                                              │                    │
                                              ▼                    ▼
                                    ┌──────────────┐      ┌──────────────┐
                                    │ PAID ACTIVE  │      │ ACCOUNT HOLD │
                                    │  (Restored)  │      │ (Loses Access│
                                    └──────────────┘      └──────┬───────┘
                                                                  │
                                                       ┌──────────┴────────┐
                                                       │                   │
                                                  (Recovered)        (Failed 60d)
                                                       │                   │
                                                       ▼                   ▼
                                             ┌──────────────┐    ┌────────────┐
                                             │ PAID ACTIVE  │    │  EXPIRED   │
                                             │  (Restored)  │    │ (Canceled) │
                                             └──────────────┘    └────────────┘
```

---

## REAL-TIME DEVELOPER NOTIFICATIONS (RTDNs)

Google Play sends webhook notifications for subscription events:

### Trial Events
- `SUBSCRIPTION_PURCHASED` - Trial started
- `SUBSCRIPTION_CANCELED` - User canceled during trial
- `SUBSCRIPTION_EXPIRED` - Trial ended without conversion

### Paid Subscription Events
- `SUBSCRIPTION_RENEWED` - Trial converted to paid OR renewal occurred
- `SUBSCRIPTION_IN_GRACE_PERIOD` - Payment failed, retrying
- `SUBSCRIPTION_ON_HOLD` - Grace period ended, still retrying
- `SUBSCRIPTION_RECOVERED` - Payment fixed, subscription restored

---

## DEVELOPER ACKNOWLEDGMENT REQUIREMENTS

**CRITICAL:** Developers must acknowledge new subscriptions within **3 days** or user gets automatic refund.

**Acknowledgment Timeline:**
```
Purchase Occurs → Developer receives RTDN
                ↓
         Must call acknowledge()
         within 3 days (72 hours)
                ↓
         ┌──────┴──────┐
         │             │
    (Acknowledged) (Not Acknowledged)
         │             │
         ▼             ▼
   Subscription   Automatic Refund
    Continues     + Subscription Ends
```

**For Prepaid Plans:**
- Plans ≥1 week: 3 days to acknowledge
- Plans <1 week: Must acknowledge within **half the plan duration**

---

## KEY IMPLEMENTATION CONSIDERATIONS

### For WhatsCard App (react-native-iap)

#### 1. Trial Start Detection
```typescript
// When user purchases subscription with trial
const purchase = await requestSubscription({
  sku: 'namecard.pro.monthly',
  // Trial starts immediately upon successful purchase
});

// Check if purchase includes trial
if (purchase.transactionDate) {
  // Trial began at transactionDate timestamp
  const trialStartTime = new Date(purchase.transactionDate);
  const trialEndTime = new Date(trialStartTime);
  trialEndTime.setDate(trialEndTime.getDate() + 3); // 3-day trial
}
```

#### 2. Cancellation Handling
```typescript
// User retains access even after canceling during trial
// Check autoRenewingAndroid or autoRenewingIOS
if (!purchase.autoRenewing) {
  // User canceled, but still has access until expiryDate
  if (Date.now() < new Date(purchase.expiryDate).getTime()) {
    // Still within trial period - grant access
    isPremiumUser = true;
  }
}
```

#### 3. Payment Failure Recovery
```typescript
// Handle grace period and account hold
const subscriptionState = purchase.purchaseStateAndroid;

switch (subscriptionState) {
  case 0: // PURCHASED - Active
    isPremiumUser = true;
    break;
  case 1: // CANCELED - Check expiry
    isPremiumUser = Date.now() < new Date(purchase.expiryDate).getTime();
    break;
  case 2: // PENDING - In grace period
    isPremiumUser = true; // Still has access
    showPaymentRetryPrompt(); // Encourage fixing payment
    break;
}
```

#### 4. Trial Re-use Prevention
```typescript
// Google Play handles this automatically
// Once user uses trial for a SKU, subsequent purchases charge immediately
// No additional logic needed in app

// For analytics, track:
// - First-time subscribers (had trial)
// - Returning subscribers (paid immediately)
```

---

## TESTING RECOMMENDATIONS

### Use License Testing in Play Console

**Test Accounts Configuration:**
1. Go to Play Console → Setup → License testing
2. Add test Gmail accounts
3. Test accounts can create/cancel subscriptions instantly

**Testing Scenarios:**

#### Test 1: Normal Trial Flow
1. Start 3-day trial
2. Wait for expiry (accelerated in test mode)
3. Verify auto-charge occurs
4. Verify premium access continues

#### Test 2: Trial Cancellation
1. Start 3-day trial
2. Cancel immediately
3. Verify access retained until end of trial
4. Verify no charge at trial end
5. Verify premium access ends after trial

#### Test 3: Payment Failure
1. Use test card that declines payment
2. Let trial expire
3. Verify grace period behavior
4. Verify account hold behavior
5. Test recovery with valid payment

#### Test 4: Re-subscription
1. Complete trial and let expire
2. Re-subscribe to same SKU
3. Verify immediate charge (no new trial)
4. Verify premium access restored

---

## COMMON PITFALLS

### 1. Immediate Access Revocation
**Mistake:** Revoking premium access when user cancels during trial
**Correct:** Keep access active until trial expiry date

### 2. Missing Acknowledgment
**Mistake:** Not calling `acknowledgePurchase()` within 3 days
**Correct:** Always acknowledge immediately after validation

### 3. Grace Period = No Access
**Mistake:** Removing access during grace period
**Correct:** User retains access during grace period (payment retrying)

### 4. Ignoring Account Hold
**Mistake:** Continuing to grant access during account hold
**Correct:** Remove access during account hold (payment failed)

### 5. Assuming Delay Before First Charge
**Mistake:** Expecting hours/days between trial end and charge
**Correct:** Charge happens immediately (within seconds) of trial expiry

---

## REFERENCES

- [Subscription Lifecycle - Android Developers](https://developer.android.com/google/play/billing/lifecycle/subscriptions)
- [About Subscriptions - Android Developers](https://developer.android.com/google/play/billing/subscriptions)
- [Understanding Subscriptions - Play Console Help](https://support.google.com/googleplay/android-developer/answer/12154973)
- [Manage Subscriptions - Play Console Help](https://support.google.com/googleplay/android-developer/answer/140504)

---

## SUMMARY TABLE

| Question | Answer |
|----------|--------|
| **Trial Start** | Immediately upon purchase confirmation |
| **Cancellation Access** | User **keeps access** until trial ends |
| **Trial End Behavior** | Auto-charge happens **immediately** (within seconds) |
| **Grace Period** | Optional, up to 48+ hours, user **keeps access** |
| **Account Hold** | Up to 60 days, user **loses access** |
| **Re-subscribe During Trial** | YES - Restores auto-renewal, same trial continues |
| **Re-subscribe After Trial** | YES - New subscription, **NO new trial**, charged immediately |
| **Trial Eligibility** | **One trial per Google account per SKU** (lifetime) |
| **Acknowledgment Deadline** | **3 days** or automatic refund |
| **Payment Retry** | Automatic for up to 60 days (grace + hold) |

---

## NEXT STEPS FOR IMPLEMENTATION

1. **Update subscription state management** to track:
   - Trial status (active/canceled/expired)
   - Expiry dates for access control
   - Auto-renewal status
   - Grace period and account hold states

2. **Implement access retention logic**:
   - Grant access based on expiry date, not cancellation status
   - Continue access during grace period
   - Remove access during account hold

3. **Add analytics tracking**:
   - Trial starts
   - Trial cancellations
   - Trial-to-paid conversions
   - Payment recovery success rate

4. **Test all scenarios** using Play Console license testing

5. **Monitor RTDNs** for subscription state changes

6. **Handle edge cases**:
   - Multiple devices
   - Offline access during trial
   - Family sharing (if enabled)

---

**Last Updated:** January 2025
**Maintained By:** WhatsCard Development Team
