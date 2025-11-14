# Google Play Subscription Setup Guide (2025)

**Last Updated:** January 2025
**Billing Library Version:** 7.0.0 (Mandatory by August 31, 2025)
**Project:** WhatsCard/NameCard.my v1.0

---

## 🚨 CRITICAL: Correct Order of Operations

### The Answer: **AAB FIRST, THEN SUBSCRIPTIONS**

**You MUST upload your Android App Bundle (AAB) to Google Play Console BEFORE you can create subscriptions.**

### Why?

1. **Internal Testing Track Required**: Google Play Console requires at least one AAB uploaded to the internal testing track to unlock monetization features (subscriptions, in-app purchases, ads).

2. **Package Name Verification**: Google needs to verify your app's package name and ensure the app exists before allowing monetization setup.

3. **Payment Profile Activation**: While you need a payment profile, it only becomes active for subscription creation AFTER an APK/AAB is uploaded.

**Source:** [Medium - Setting up Subscription Products](https://medium.com/@kundankuldeep1/setting-up-subscription-products-on-google-play-console-7fb08e90e5a0), [Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/140504)

---

## 📋 Step-by-Step Workflow

### Phase 1: Upload AAB to Internal Testing

#### Step 1.1: Build Your AAB

```bash
cd NamecardMobile/android
./gradlew bundleRelease
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

#### Step 1.2: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (or create new app)
3. Navigate to: **Release > Testing > Internal testing**
4. Click **Create new release**
5. Upload your AAB file
6. Add release notes
7. Click **Review release** → **Start rollout to Internal testing**

**Important:** You don't need to complete the full store listing yet—just get the AAB uploaded to internal testing.

#### Step 1.3: Set Up License Testing (Optional but Recommended)

1. Go to **Settings > License Testing**
2. Add Gmail accounts for testers
3. These testers can test subscriptions without being charged

**Source:** [Google Play Console - Internal Testing](https://support.google.com/googleplay/android-developer/answer/9845334)

---

### Phase 2: Create Payment Profile

1. Go to **Settings > Payments profile**
2. Complete all required information:
   - Business name
   - Address
   - Tax information
   - Bank account details (for payouts)

**Note:** This step can be done in parallel with AAB upload, but subscriptions won't be available until BOTH are complete.

**Source:** [Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/140504)

---

### Phase 3: Create Subscription Products

#### Step 3.1: Navigate to Subscriptions Section

1. Go to **Monetize > Products > Subscriptions**
2. Click **Create subscription**

#### Step 3.2: Create Subscription Product

**Product Details:**
- **Product ID:** `premium_monthly` (must be lowercase, can include underscores, periods, max 40 chars)
- **Name:** "Premium Monthly Subscription"
- **Description:** "Unlock premium features including..."

**⚠️ WARNING:** Product IDs CANNOT be changed or deleted once created. Choose carefully!

**Source:** [RevenueCat - Google Play Product Setup](https://www.revenuecat.com/docs/getting-started/entitlements/android-products)

#### Step 3.3: Create Base Plan

A **base plan** defines the subscription's billing period, renewal type, and price.

**Base Plan Types:**
1. **Auto-renewing:** Users charged automatically at billing period end (most common)
2. **Prepaid:** User pays upfront, no auto-renewal
3. **Installments:** Fixed monthly payments over commitment period (Brazil, France, Italy, Spain only)

**For WhatsCard Monthly Subscription:**
- **Base Plan ID:** `monthly-auto-renew`
- **Billing Period:** 1 month (P1M in ISO 8601 format)
- **Price:** RM 199.00 (or regional equivalent)
- **Grace Period:** 3 days (recommended)
- **Renewal Type:** Auto-renewing

**Limits:**
- Maximum 250 base plans + offers per subscription (combined)
- Maximum 50 active at once

**Source:** [Android Developers - About Subscriptions](https://developer.android.com/google/play/billing/subscriptions)

---

### Phase 4: Create Free Trial Offer

#### Step 4.1: Add Offer to Base Plan

1. Go to your subscription product
2. Click on the base plan you just created
3. Click **Add Offer** (to the right of "Base Plans and Offers")

#### Step 4.2: Configure Free Trial Offer

**Offer Details:**
- **Offer ID:** `free-trial-3-days`
- **Offer Type:** Free trial
- **Trial Duration:** 3 days (P3D in ISO 8601 format)
- **Eligibility:** New subscribers only (default)

**Free Trial Range:** 3 days minimum to 3 years maximum

#### Step 4.3: Eligibility Configuration

**User Eligibility Options:**
- ✅ **Allow one free trial per app** (checked): Users can only use the free trial once across all subscriptions in your app
- ❌ **Unchecked:** Users can use free trials for each subscription product separately

**Recommendation:** Keep checked to prevent abuse.

#### Step 4.4: Important Free Trial Behaviors

**Payment Verification:**
- Google Play verifies users have a valid payment method BEFORE starting the free trial
- Users may see a temporary hold/charge (later reversed)
- This prevents fraudulent free trial abuse

**Cancellation Policy:**
- If user cancels during free trial, subscription remains active until trial ends
- No charge is applied if cancelled during trial
- After trial ends, subscription auto-renews unless cancelled

**Testing:**
- License testers can use free trial offers UNLIMITED times
- Time-based features (free trials) are shortened for testing

**Source:** [Android Developers - About Subscriptions](https://developer.android.com/google/play/billing/subscriptions), [Stack Overflow - Free Trial Testing](https://stackoverflow.com/questions/54095144/google-play-free-trial-period-testing-strategy)

---

### Phase 5: Activate Subscription

1. Review all subscription details
2. Click **Activate** (subscription will move from Draft to Active)
3. **Wait 2-4 hours** for Google's cache to propagate
4. Test with a license tester account

**⚠️ Important:** New subscriptions can take several hours to become available for testing. Don't panic if they don't appear immediately!

**Source:** [Medium - Setting up Subscription Products](https://medium.com/@kundankuldeep1/setting-up-subscription-products-on-google-play-console-7fb08e90e5a0)

---

## 🔧 Technical Implementation: react-native-iap

### Installation Requirements (2025)

**Library Versions:**
```json
{
  "react-native-iap": "14.4.38",
  "react-native-nitro-modules": "latest",
  "react-native": "0.79.6+"
}
```

**Why react-native-iap 14.x?**
- Uses Nitro Modules for high-performance native bridge
- Requires React Native 0.79+
- Supports Google Play Billing Library 6/7
- FREE (no RevenueCat fees!)

**Source:** [react-native-iap npm](https://www.npmjs.com/package/react-native-iap)

### Android Configuration (android/app/build.gradle)

```gradle
android {
    defaultConfig {
        // ... other config

        // REQUIRED: Resolve react-native-iap variant ambiguity
        missingDimensionStrategy 'store', 'play'
    }

    // REQUIRED: Define product flavors for react-native-iap
    flavorDimensions "store"
    productFlavors {
        play {
            dimension "store"
            // Google Play Store variant
        }
    }
}
```

**Why this config?**
- react-native-iap supports both Amazon & Google Play
- Without `missingDimensionStrategy`, Gradle build fails with "variant ambiguity" error
- We're only using Google Play, so we specify 'play' variant

**Source:** [react-native-iap GitHub Issues](https://github.com/dooboolab-community/react-native-iap/issues)

### Kotlin Version Requirement

**android/build.gradle:**
```gradle
buildscript {
    ext {
        kotlinVersion = "2.0.0" // Minimum 2.0+
    }
}
```

**Source:** [Prototyp - React Native In-App Purchases Guide](https://prototyp.digital/blog/react-native-in-app-purchases-guide)

---

## 📱 Code Implementation

### Step 1: Initialize Billing Client

```typescript
import { initConnection, endConnection } from 'react-native-iap';

// In your App.tsx or subscription service
useEffect(() => {
  const initIAP = async () => {
    try {
      await initConnection();
      console.log('IAP connection initialized');
    } catch (err) {
      console.error('Failed to initialize IAP:', err);
    }
  };

  initIAP();

  // Cleanup
  return () => {
    endConnection();
  };
}, []);
```

### Step 2: Fetch Available Subscriptions

```typescript
import { getSubscriptions } from 'react-native-iap';

const skus = ['premium_monthly']; // Product IDs from Google Play Console

const fetchSubscriptions = async () => {
  try {
    const products = await getSubscriptions({ skus });
    console.log('Available subscriptions:', products);
    return products;
  } catch (err) {
    console.error('Failed to fetch subscriptions:', err);
  }
};
```

### Step 3: Request Subscription with Free Trial

```typescript
import { requestSubscription } from 'react-native-iap';
import type { Subscription } from 'react-native-iap';

const subscribeToPremium = async (product: Subscription) => {
  try {
    // Find the free trial offer
    const freeTrialOffer = product.subscriptionOfferDetails?.find(
      (offer) => offer.offerId === 'free-trial-3-days' || offer.offerId === null
    );

    if (!freeTrialOffer) {
      throw new Error('Free trial offer not found');
    }

    // Request subscription with free trial
    const purchase = await requestSubscription({
      sku: product.productId,
      subscriptionOffers: [
        {
          sku: product.productId,
          offerToken: freeTrialOffer.offerToken,
        },
      ],
    });

    console.log('Subscription purchased:', purchase);
    return purchase;
  } catch (err) {
    console.error('Failed to purchase subscription:', err);
  }
};
```

**Important Notes:**
- Free trial offers have `offerId` matching your offer ID (e.g., 'free-trial-3-days')
- Base plan offers (without promotions) have `offerId === null`
- Always use `offerToken` to identify the specific offer

**Source:** [Medium - Subscription in React Native Guide](https://medium.com/@subtain.techling/subscription-in-react-native-a-comprehensive-guide-75fa1ec34f95)

### Step 4: Handle Purchase Updates

```typescript
import { purchaseUpdatedListener, Purchase } from 'react-native-iap';

useEffect(() => {
  const purchaseUpdateSubscription = purchaseUpdatedListener(
    async (purchase: Purchase) => {
      const receipt = purchase.transactionReceipt;

      if (receipt) {
        try {
          // Verify purchase with your backend
          await verifyPurchaseWithBackend(purchase);

          // Acknowledge the purchase (REQUIRED!)
          await finishTransaction({ purchase, isConsumable: false });

          // Grant premium access
          updateUserSubscriptionStatus(true);
        } catch (err) {
          console.error('Purchase verification failed:', err);
        }
      }
    }
  );

  return () => {
    purchaseUpdateSubscription.remove();
  };
}, []);
```

**⚠️ CRITICAL:** You MUST acknowledge purchases using `finishTransaction()`. Unacknowledged purchases will be automatically refunded after 3 days!

**Source:** [Android Developers - Subscription Lifecycle](https://developer.android.com/google/play/billing/lifecycle/subscriptions)

---

## 🔄 Google Play Billing Library 7 Migration (2025)

### Mandatory Deadline

**By August 31, 2025**, all new apps and updates MUST use Billing Library 7 or newer.

**Extension available:** Until November 1, 2025 (request via Play Console)

**Source:** [Android Developers - Billing Library 7 Migration](https://developer.android.com/google/play/billing/migrate-gpblv7)

### Key Changes from Library 6 to 7

#### Breaking API Changes (You MUST Update)

| **Removed API** | **Replacement** |
|-----------------|-----------------|
| `setOldSkuPurchaseToken()` | `setOldPurchaseToken()` |
| `setReplaceProrationMode()` | `setSubscriptionReplacementMode()` |
| `setReplaceSkusProrationMode()` | `setSubscriptionReplacementMode()` |
| `enableAlternativeBilling()` | `enableUserChoiceBilling()` |

#### New Features (Optional)

1. **Installment Plans:** Support for paying subscriptions in installments (Brazil, France, Italy, Spain)
2. **Pending Purchases for Prepaid:** Better handling of pending purchases for prepaid subscriptions
3. **Improved Error Codes:** New `NETWORK_ERROR` code, updated `SERVICE_TIMEOUT` and `SERVICE_UNAVAILABLE`

#### Order ID Behavior Change

**Before (Library 6):**
- Order IDs generated immediately for all purchases, including pending

**After (Library 7):**
- Order IDs NOT generated for pending purchases
- Order IDs populated only after purchase reaches `PURCHASED` state
- Purchase tokens remain available for tracking

**Source:** [RevenueCat - Google Play Billing Library 7 Guide](https://www.revenuecat.com/blog/engineering/google-play-billing-library-7-features-migration/)

### react-native-iap Support

**Good News:** react-native-iap 14.x already supports Billing Library 7!

No code changes required for basic functionality. Just ensure you're using react-native-iap 14.4.38+.

**Source:** [react-native-iap GitHub](https://github.com/dooboolab-community/react-native-iap)

---

## 🧪 Testing Subscriptions

### Test Account Setup

1. **Add License Testers:**
   - Go to **Settings > License Testing**
   - Add Gmail accounts of your testers
   - Testers receive email invitation

2. **Accept Internal Testing Invitation:**
   - Testers must click the internal testing link
   - Install the app from the internal testing track

3. **Testing Behaviors:**
   - License testers can use free trials UNLIMITED times
   - Time-based features are shortened (e.g., 3-day trial becomes instant)
   - No actual charges applied to test accounts

**Source:** [Android Developers - Test Billing Integration](https://developer.android.com/google/play/billing/test)

### Testing Best Practices

1. **Test Free Trial Flow:**
   - Verify free trial offer appears
   - Check trial expiration date
   - Test cancellation during trial
   - Verify no charge if cancelled

2. **Test Auto-Renewal:**
   - Let trial expire without cancellation
   - Verify subscription auto-renews
   - Check payment method charged correctly

3. **Test Subscription Management:**
   - Verify users can view subscription status
   - Test cancellation after trial ends
   - Check refund policy enforcement

**Source:** [Medium - Test Strategy for Free Trials](https://medium.com/brickit-engineering/test-strategy-for-free-trials-and-introductory-prices-in-google-play-8e0e6a0fdf41)

---

## 📚 Official Documentation Links

### Google Play Console
- [Create and Manage Subscriptions](https://support.google.com/googleplay/android-developer/answer/140504)
- [Understanding Subscriptions](https://support.google.com/googleplay/android-developer/answer/12154973)
- [Set Up Internal Testing](https://support.google.com/googleplay/android-developer/answer/9845334)

### Android Developers
- [About Subscriptions](https://developer.android.com/google/play/billing/subscriptions)
- [Billing Library 7 Migration](https://developer.android.com/google/play/billing/migrate-gpblv7)
- [Billing Library Release Notes](https://developer.android.com/google/play/billing/release-notes)
- [Test Billing Integration](https://developer.android.com/google/play/billing/test)
- [Subscription Lifecycle](https://developer.android.com/google/play/billing/lifecycle/subscriptions)

### react-native-iap
- [npm Package](https://www.npmjs.com/package/react-native-iap)
- [GitHub Repository](https://github.com/dooboolab-community/react-native-iap)

### Third-Party Guides
- [RevenueCat - Google Play Product Setup](https://www.revenuecat.com/docs/getting-started/entitlements/android-products)
- [Prototyp - React Native In-App Purchases Guide](https://prototyp.digital/blog/react-native-in-app-purchases-guide)
- [LogRocket - React Native IAP for Android](https://blog.logrocket.com/implement-react-native-in-app-purchases-android-apps/)

---

## ⚠️ Common Pitfalls & Solutions

### Problem 1: "Subscriptions section is disabled"

**Cause:** AAB not uploaded to internal testing yet.

**Solution:**
1. Upload AAB to internal testing track
2. Wait 10-15 minutes for Google to process
3. Refresh Google Play Console
4. Subscriptions section should now be accessible

---

### Problem 2: "Product not found" error in app

**Cause:** Subscription not activated or cache not propagated.

**Solution:**
1. Verify subscription is **Active** (not Draft) in Play Console
2. Wait 2-4 hours for Google's cache to propagate
3. Ensure app is installed from internal testing track (not local build)
4. Check Product ID matches exactly (case-sensitive!)

---

### Problem 3: Free trial offer not showing

**Cause:** Offer not configured correctly or user already used trial.

**Solution:**
1. Verify offer is **Active** in Play Console
2. Check offer eligibility settings
3. Test with a NEW Google account (if "one free trial per app" is enabled)
4. Ensure you're filtering offers correctly in code:
   ```typescript
   const freeTrialOffer = product.subscriptionOfferDetails?.find(
     offer => offer.offerId === 'free-trial-3-days'
   );
   ```

---

### Problem 4: "Variant ambiguity" Gradle build error

**Cause:** react-native-iap provides both Amazon & Google Play variants.

**Solution:**
Add to `android/app/build.gradle`:
```gradle
defaultConfig {
    missingDimensionStrategy 'store', 'play'
}

flavorDimensions "store"
productFlavors {
    play {
        dimension "store"
    }
}
```

---

### Problem 5: Purchase not acknowledged, refunded after 3 days

**Cause:** Forgot to call `finishTransaction()`.

**Solution:**
Always acknowledge purchases immediately:
```typescript
await finishTransaction({ purchase, isConsumable: false });
```

**Source:** [Android Developers - Subscription Lifecycle](https://developer.android.com/google/play/billing/lifecycle/subscriptions)

---

## 📝 Checklist for WhatsCard Subscription Setup

### Phase 1: Pre-Setup
- [ ] Build AAB: `cd android && ./gradlew bundleRelease`
- [ ] Upload AAB to internal testing track
- [ ] Create payment profile in Play Console
- [ ] Add license testers (your Gmail + test accounts)

### Phase 2: Subscription Creation
- [ ] Create subscription product: `premium_monthly`
- [ ] Create base plan: `monthly-auto-renew` (P1M, RM 199.00)
- [ ] Create free trial offer: `free-trial-3-days` (P3D)
- [ ] Set eligibility: "One free trial per app" (checked)
- [ ] Activate subscription

### Phase 3: Technical Implementation
- [ ] Install react-native-iap 14.4.38
- [ ] Install react-native-nitro-modules
- [ ] Add Gradle configuration (missingDimensionStrategy)
- [ ] Update Kotlin version to 2.0+
- [ ] Implement subscription purchase flow
- [ ] Add purchase acknowledgement (finishTransaction)
- [ ] Test with license tester account

### Phase 4: Testing
- [ ] Verify free trial offer appears
- [ ] Test free trial cancellation
- [ ] Test auto-renewal after trial
- [ ] Verify subscription management works
- [ ] Check payment verification flow

### Phase 5: Migration Preparation (for 2025)
- [ ] Verify react-native-iap supports Billing Library 7
- [ ] Update any deprecated API calls if needed
- [ ] Test on latest library version
- [ ] Submit app update before August 31, 2025

---

## 🎯 Summary: Quick Reference

### Correct Order
1. **Upload AAB to internal testing** ← FIRST
2. **Create payment profile** (can be parallel with #1)
3. **Create subscription products** ← AFTER #1 and #2
4. **Create base plans**
5. **Create offers (free trial)**
6. **Activate subscription**
7. **Wait 2-4 hours for cache propagation**
8. **Test with license tester**

### Key Requirements (2025)
- **Billing Library:** Version 7+ (mandatory by Aug 31, 2025)
- **react-native-iap:** Version 14.4.38+ (uses Nitro Modules)
- **React Native:** 0.79.6+ (required for Nitro Modules)
- **Kotlin:** 2.0+ (required for react-native-iap 14.x)
- **Gradle:** 8.10.2 (compatible with Java 17-21, NOT 9.0)

### Free Trial Configuration
- **Duration:** 3 days (P3D) minimum, 3 years maximum
- **Eligibility:** One per app (recommended to prevent abuse)
- **Payment:** Google verifies valid payment method (temporary hold)
- **Cancellation:** Subscription remains active until trial ends, no charge

### Testing
- **License testers:** Unlimited free trial usage
- **Time-based features:** Shortened for testing
- **Cache propagation:** Wait 2-4 hours after activation
- **Test accounts:** Must install from internal testing track

---

**End of Documentation**
