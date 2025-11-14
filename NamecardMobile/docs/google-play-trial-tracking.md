# Google Play Billing Trial Tracking Guide

**Comprehensive guide for tracking free trials in React Native apps using react-native-iap (2024-2025)**

---

## Table of Contents

1. [How Google Play Billing Tracks Trials](#how-google-play-billing-tracks-trials)
2. [Client-Side Trial Detection](#client-side-trial-detection)
3. [Server-Side Trial Verification](#server-side-trial-verification)
4. [Real-Time Developer Notifications (RTDN)](#real-time-developer-notifications-rtdn)
5. [react-native-iap Implementation](#react-native-iap-implementation)
6. [Best Practices](#best-practices)
7. [Code Examples](#code-examples)

---

## How Google Play Billing Tracks Trials

### Overview

Google Play Billing Library 6/7 uses a **multi-phase pricing model** where free trials are represented as the **first pricing phase** with `priceAmountMicros = 0`.

### Key Concepts

**Pricing Phases Structure:**
```
Subscription Offer
  └─ Pricing Phases (array)
       ├─ Phase 1: Free Trial (priceAmountMicros = 0)
       ├─ Phase 2: Intro Price (optional)
       └─ Phase 3: Regular Price
```

**Important Changes from Billing Library 5:**
- ❌ **Deprecated:** `isIntroductoryPricePeriod` as a direct boolean property
- ✅ **New:** Check `pricingPhases` array to determine trial status
- ✅ **New:** `subscriptionOfferDetails` contains all offer information

---

## Client-Side Trial Detection

### 1. Product-Level: Check if Product Offers a Trial

**When to use:** Display "Start Free Trial" button if product supports trials

#### Android Native (Google Play Billing Library 5+)

```java
int trialDays = -1;
if(BillingClient.ProductType.SUBS.equals(productDetails.getProductType())) {
    List<ProductDetails.SubscriptionOfferDetails> subscriptionPlans =
        productDetails.getSubscriptionOfferDetails();
    ProductDetails.SubscriptionOfferDetails pricingPlan =
        subscriptionPlans.get(planIndex);
    ProductDetails.PricingPhase firstPricingPhase =
        pricingPlan.getPricingPhases().getPricingPhaseList().get(0);

    // Check if first phase is free trial
    if(firstPricingPhase.getPriceAmountMicros() == 0) {
        trialDays = parseDuration(firstPricingPhase.getBillingPeriod());
    }
}
```

#### Kotlin (Modern Approach)

```kotlin
private fun parseIso8601ToDays(period: String): Int {
    return try {
        val parsedPeriod = Period.parse(period) // Uses java.time.Period
        parsedPeriod.days
    } catch (e: DateTimeParseException) {
        DEFAULT_DAYS_VALUE
    }
}

private fun hasFreeTrial(subscriptionOfferDetails: List<ProductDetails.SubscriptionOfferDetails>): Boolean {
    return subscriptionOfferDetails.any { offer ->
        val firstPhase = offer.pricingPhases.pricingPhaseList.firstOrNull()
        firstPhase?.priceAmountMicros == 0L
    }
}
```

#### ISO 8601 Duration Format

Google Play uses ISO 8601 format for trial periods:

| Format | Meaning |
|--------|---------|
| `P1W` | 1 week |
| `P1M` | 1 month |
| `P3M` | 3 months |
| `P6M` | 6 months |
| `P1Y` | 1 year |

**Trial Requirements:** 3 days minimum, 3 years maximum

---

### 2. User-Level: Check if User is Eligible for Trial

**When to use:** Show "Start Trial" vs "Start Subscription" dynamically

#### Limitation

⚠️ **Google Play does NOT expose a direct client-side trial eligibility API.**

Trial eligibility is enforced **server-side** by Google Play:
- Users who previously used a trial for this product are **not eligible**
- Google Play silently removes trial offers for ineligible users

#### Workaround Approach

```javascript
import { getPurchaseHistory } from 'react-native-iap';

// Check if user has purchase history for this product
const checkTrialEligibility = async (productId) => {
  try {
    const purchaseHistory = await getPurchaseHistory();

    // If user has ANY previous purchase of this product, likely not eligible
    const hasPreviousPurchase = purchaseHistory.some(
      purchase => purchase.productId === productId
    );

    return !hasPreviousPurchase; // Rough estimate
  } catch (error) {
    console.error('Error checking trial eligibility:', error);
    return true; // Default to showing trial offer
  }
};
```

**Important Notes:**
- This is **NOT 100% accurate** - Google's eligibility rules are more complex
- Recommended approach: **Show trial offer based on product data, let Google Play handle eligibility validation at purchase time**

---

### 3. Purchase-Level: Check if Current Subscription is on Trial

**When to use:** Display trial end date in UI, show "Trial ends in X days"

#### react-native-iap Approach

```javascript
import { getAvailablePurchases } from 'react-native-iap';

const checkCurrentTrialStatus = async () => {
  try {
    const purchases = await getAvailablePurchases();

    // For iOS: Check isTrialPeriod field
    // For Android: Must verify server-side via Google Play Developer API

    const activePurchase = purchases.find(
      p => p.productId === 'your_subscription_id'
    );

    if (activePurchase) {
      // iOS has isTrialPeriod field (if extended=true)
      if (Platform.OS === 'ios' && activePurchase.isTrialPeriod) {
        return { onTrial: true, purchase: activePurchase };
      }

      // Android: Must verify via backend (see Server-Side section)
      if (Platform.OS === 'android') {
        // Send purchaseToken to backend for verification
        const trialStatus = await verifyPurchaseOnBackend(
          activePurchase.purchaseToken
        );
        return { onTrial: trialStatus.paymentState === 2, purchase: activePurchase };
      }
    }

    return { onTrial: false, purchase: null };
  } catch (error) {
    console.error('Error checking trial status:', error);
    return { onTrial: false, purchase: null };
  }
};
```

**Android Purchase Object Fields:**
```javascript
{
  productId: 'your_subscription_id',
  transactionReceipt: '{"orderId":"...","packageName":"...","productId":"...",...}',
  purchaseToken: 'fhkmabdogjf...', // Used for server-side verification
  transactionDate: 1699900000000,
  dataAndroid: '{"orderId":"..."}',
  purchaseStateAndroid: 1, // 1 = purchased
  isAcknowledgedAndroid: true,
  autoRenewingAndroid: true,
  // Note: isTrialPeriod is primarily for iOS
}
```

---

## Server-Side Trial Verification

### Google Play Developer API

**Endpoint:** `GET https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{packageName}/purchases/subscriptions/{subscriptionId}/tokens/{token}`

#### SubscriptionPurchase Response Fields

**Critical Fields for Trial Detection:**

```json
{
  "startTimeMillis": "1699900000000",
  "expiryTimeMillis": "1700900000000",
  "paymentState": 2,  // ← KEY FIELD: 2 = FREE TRIAL
  "autoRenewing": true,
  "priceCurrencyCode": "USD",
  "priceAmountMicros": "0",
  "introductoryPriceInfo": {
    "introductoryPriceCurrencyCode": "USD",
    "introductoryPriceAmountMicros": "0",
    "introductoryPricePeriod": "P1M",
    "introductoryPriceCycles": 1
  }
}
```

#### Payment State Values

| Value | Meaning | User Status |
|-------|---------|-------------|
| 0 | Payment pending | Subscription active but payment processing |
| 1 | Payment received | Paid subscription in good standing |
| 2 | **Free trial** | **User is on free trial** |
| 3 | Pending deferred upgrade/downgrade | Subscription will change at renewal |

### Backend Implementation Example (Node.js)

```javascript
const { google } = require('googleapis');
const androidpublisher = google.androidpublisher('v3');

async function verifySubscriptionTrial(packageName, subscriptionId, purchaseToken) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'path/to/service-account-key.json',
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    const result = await androidpublisher.purchases.subscriptions.get({
      packageName: packageName,
      subscriptionId: subscriptionId,
      token: purchaseToken,
    });

    const subscription = result.data;

    // Check if user is on trial
    const isOnTrial = subscription.paymentState === 2;
    const trialEndTime = subscription.expiryTimeMillis;

    return {
      isOnTrial,
      trialEndTime: isOnTrial ? parseInt(trialEndTime) : null,
      startTime: parseInt(subscription.startTimeMillis),
      expiryTime: parseInt(subscription.expiryTimeMillis),
      autoRenewing: subscription.autoRenewing,
    };
  } catch (error) {
    console.error('Error verifying subscription:', error);
    throw error;
  }
}
```

### Supabase Edge Function Example

```typescript
// supabase/functions/verify-subscription/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { google } from 'npm:googleapis@118.0.0';

serve(async (req) => {
  const { purchaseToken, subscriptionId } = await req.json();

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY') || '{}'),
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const androidpublisher = google.androidpublisher({
    version: 'v3',
    auth: await auth.getClient(),
  });

  const result = await androidpublisher.purchases.subscriptions.get({
    packageName: Deno.env.get('ANDROID_PACKAGE_NAME'),
    subscriptionId,
    token: purchaseToken,
  });

  const subscription = result.data;
  const isOnTrial = subscription.paymentState === 2;

  // Store in Supabase database
  // UPDATE users SET
  //   is_on_trial = isOnTrial,
  //   trial_end_date = subscription.expiryTimeMillis
  // WHERE user_id = ...

  return new Response(
    JSON.stringify({
      isOnTrial,
      trialEndTime: subscription.expiryTimeMillis,
      paymentState: subscription.paymentState,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

---

## Real-Time Developer Notifications (RTDN)

### Overview

Google Play sends **real-time webhooks** to your backend when subscription state changes.

### Important Limitation

⚠️ **There is NO specific notification type for trial start/end events.**

Instead, use these generic subscription events:

| Notification Type | Code | When Sent |
|-------------------|------|-----------|
| SUBSCRIPTION_PURCHASED | 4 | When subscription starts (including trial start) |
| SUBSCRIPTION_RENEWED | 2 | When subscription renews (including trial → paid conversion) |
| SUBSCRIPTION_CANCELED | 3 | User cancels subscription |
| SUBSCRIPTION_EXPIRED | 13 | Subscription expired |

### RTDN Payload Structure

```json
{
  "message": {
    "data": "eyJwYWNrYWdlTmFtZSI6ImNvbS5leGFtcGxlLmFwcCIsImV2ZW50VGltZU1pbGxpcyI6IjE2OTk5MDAwMDAwMDAiLCJzdWJzY3JpcHRpb25Ob3RpZmljYXRpb24iOnsidmVyc2lvbiI6IjEuMCIsIm5vdGlmaWNhdGlvblR5cGUiOjQsInB1cmNoYXNlVG9rZW4iOiJmaGttYWJkb2dqZi4uLiIsInN1YnNjcmlwdGlvbklkIjoieW91cl9zdWJzY3JpcHRpb25faWQifX0=",
    "messageId": "message-id-123",
    "publishTime": "2023-11-13T15:00:00.000Z"
  },
  "subscription": "projects/your-project/subscriptions/rtdn-subscription"
}
```

**Decoded `message.data` (base64):**

```json
{
  "packageName": "com.example.app",
  "eventTimeMillis": "1699900000000",
  "subscriptionNotification": {
    "version": "1.0",
    "notificationType": 4, // SUBSCRIPTION_PURCHASED
    "purchaseToken": "fhkmabdogjf...",
    "subscriptionId": "your_subscription_id"
  }
}
```

### Backend RTDN Handler

```javascript
// Express.js webhook endpoint
app.post('/webhooks/google-play-rtdn', async (req, res) => {
  try {
    // Decode base64 message data
    const message = JSON.parse(
      Buffer.from(req.body.message.data, 'base64').toString('utf-8')
    );

    const { subscriptionNotification, packageName } = message;
    const { notificationType, purchaseToken, subscriptionId } = subscriptionNotification;

    console.log('RTDN Notification:', notificationType, subscriptionId);

    // Handle trial start (SUBSCRIPTION_PURCHASED = 4)
    if (notificationType === 4) {
      // Verify subscription via Google Play Developer API
      const subscriptionData = await verifySubscriptionTrial(
        packageName,
        subscriptionId,
        purchaseToken
      );

      // If paymentState === 2, user started a trial
      if (subscriptionData.isOnTrial) {
        console.log('User started free trial');
        // Update database: is_on_trial = true, trial_end_date = expiryTime
      } else {
        console.log('User started paid subscription (skipped trial)');
        // Update database: is_premium = true
      }
    }

    // Handle trial → paid conversion (SUBSCRIPTION_RENEWED = 2)
    if (notificationType === 2) {
      const subscriptionData = await verifySubscriptionTrial(
        packageName,
        subscriptionId,
        purchaseToken
      );

      // If paymentState === 1, trial converted to paid
      if (subscriptionData.paymentState === 1) {
        console.log('Trial converted to paid subscription');
        // Update database: is_on_trial = false, is_premium = true
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('RTDN Error:', error);
    res.status(500).send('Error');
  }
});
```

---

## react-native-iap Implementation

### 1. Detect Trial Offer When Displaying Product

```javascript
import { getSubscriptions } from 'react-native-iap';

const displaySubscriptionOffer = async () => {
  try {
    const subscriptions = await getSubscriptions({
      skus: ['monthly_premium', 'yearly_premium']
    });

    const monthlySubscription = subscriptions.find(
      sub => sub.productId === 'monthly_premium'
    );

    if (Platform.OS === 'android') {
      // Check subscriptionOfferDetails for trial offer
      const trialOffer = monthlySubscription?.subscriptionOfferDetails?.find(
        offer => offer.offerId === 'free-trial' || !offer.offerId
      );

      if (trialOffer) {
        const firstPhase = trialOffer.pricingPhases?.pricingPhaseList?.[0];
        const isFreeTrial = firstPhase?.priceAmountMicros === '0';

        if (isFreeTrial) {
          console.log('Trial period:', firstPhase.billingPeriod); // e.g., "P1M"
          // Display: "Start 1 Month Free Trial"
        }
      }
    }

    if (Platform.OS === 'ios') {
      // Check introductoryPrice field
      if (monthlySubscription?.introductoryPrice) {
        console.log('Trial period:', monthlySubscription.introductoryPrice);
        // Display: "Start Free Trial"
      }
    }
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
  }
};
```

### 2. Request Subscription with Trial

```javascript
import { requestSubscription } from 'react-native-iap';

const purchaseSubscription = async (subscription) => {
  try {
    if (Platform.OS === 'android') {
      const { subscriptionOfferDetails, productId } = subscription;

      // Find trial offer or base offer
      const offerDetail = subscriptionOfferDetails.find(
        offer => offer.offerId === 'free-trial' || !offer.offerId
      );

      if (!offerDetail) {
        throw new Error('Offer detail not found');
      }

      const purchase = await requestSubscription({
        sku: productId,
        subscriptionOffers: [
          {
            sku: productId,
            offerToken: offerDetail.offerToken,
          },
        ],
      });

      console.log('Purchase successful:', purchase);

      // Send purchaseToken to backend for trial verification
      await verifyPurchaseOnBackend(purchase.purchaseToken);

      return purchase;
    }

    if (Platform.OS === 'ios') {
      const purchase = await requestSubscription({
        sku: subscription.productId,
      });

      console.log('Purchase successful:', purchase);

      // iOS receipt validation
      await verifyPurchaseOnBackend(purchase.transactionReceipt);

      return purchase;
    }
  } catch (error) {
    console.error('Purchase error:', error);
    throw error;
  }
};
```

### 3. Check Active Trial Status

```javascript
import { getAvailablePurchases } from 'react-native-iap';

const checkActiveTrialStatus = async () => {
  try {
    const purchases = await getAvailablePurchases();

    const activePurchase = purchases.find(
      p => p.productId === 'monthly_premium'
    );

    if (!activePurchase) {
      return { hasActiveTrial: false };
    }

    // For iOS: Check isTrialPeriod field
    if (Platform.OS === 'ios' && activePurchase.isTrialPeriod) {
      return {
        hasActiveTrial: true,
        trialEndDate: new Date(activePurchase.expirationDate),
      };
    }

    // For Android: Must verify via backend
    if (Platform.OS === 'android') {
      const response = await fetch('YOUR_BACKEND/verify-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseToken: activePurchase.purchaseToken,
          subscriptionId: activePurchase.productId,
        }),
      });

      const data = await response.json();

      return {
        hasActiveTrial: data.isOnTrial,
        trialEndDate: data.trialEndTime ? new Date(parseInt(data.trialEndTime)) : null,
      };
    }

    return { hasActiveTrial: false };
  } catch (error) {
    console.error('Error checking trial status:', error);
    return { hasActiveTrial: false };
  }
};
```

---

## Best Practices

### 1. Display Trial Availability Based on Product Data

✅ **DO:** Show "Start 7-Day Free Trial" if product has trial offer
❌ **DON'T:** Try to predict user eligibility client-side

```javascript
// Good approach
const trialOffer = subscription.subscriptionOfferDetails.find(
  offer => offer.offerId === 'free-trial'
);
if (trialOffer) {
  // Show "Start Free Trial" button
} else {
  // Show "Subscribe Now" button
}

// Let Google Play handle eligibility validation at purchase time
```

### 2. Always Verify Trials Server-Side

✅ **DO:** Verify `paymentState` via Google Play Developer API
❌ **DON'T:** Trust client-side trial detection for premium feature access

```javascript
// Backend must call Google Play Developer API
const subscription = await androidpublisher.purchases.subscriptions.get({...});
const isOnTrial = subscription.paymentState === 2;

// Store in database
await supabase
  .from('users')
  .update({
    is_on_trial: isOnTrial,
    trial_end_date: subscription.expiryTimeMillis,
    is_premium: isOnTrial || subscription.paymentState === 1,
  })
  .eq('user_id', userId);
```

### 3. Handle RTDN Webhooks for Real-Time Updates

✅ **DO:** Set up RTDN webhooks to catch trial start/end events
❌ **DON'T:** Poll Google Play API repeatedly

```javascript
// RTDN webhook handler
if (notificationType === 4) { // SUBSCRIPTION_PURCHASED
  const { isOnTrial } = await verifySubscriptionTrial(...);
  if (isOnTrial) {
    // User started trial
  }
}

if (notificationType === 2) { // SUBSCRIPTION_RENEWED
  const { paymentState } = await verifySubscriptionTrial(...);
  if (paymentState === 1) {
    // Trial converted to paid
  }
}
```

### 4. Cache Trial Status in Your Database

✅ **DO:** Store trial status in Supabase/database for fast access
❌ **DON'T:** Call Google Play API on every app launch

**Recommended Database Schema:**

```sql
CREATE TABLE user_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  is_premium BOOLEAN DEFAULT false,
  is_on_trial BOOLEAN DEFAULT false,
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  purchase_token TEXT,
  subscription_id TEXT,
  payment_state INTEGER, -- 0=pending, 1=paid, 2=trial, 3=deferred
  auto_renewing BOOLEAN,
  last_verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Show Trial End Date in UI

✅ **DO:** Display remaining trial days to encourage conversion
❌ **DON'T:** Hide trial information from users

```javascript
const TrialBanner = ({ trialEndDate }) => {
  const daysRemaining = Math.ceil(
    (trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View style={styles.banner}>
      <Text>Free Trial: {daysRemaining} days remaining</Text>
      <Button title="Upgrade Now" onPress={handleUpgrade} />
    </View>
  );
};
```

### 6. Test Thoroughly

✅ **DO:** Use Google Play Console test accounts
✅ **DO:** Test trial start, trial end, and trial → paid conversion
❌ **DON'T:** Rely on production testing only

**Testing Checklist:**
- [ ] Trial offer appears in subscription details
- [ ] User can start trial successfully
- [ ] Backend receives RTDN webhook on trial start
- [ ] Trial status verified via API shows `paymentState: 2`
- [ ] Trial end date stored correctly
- [ ] Trial converts to paid on renewal
- [ ] Backend receives RTDN webhook on conversion
- [ ] `paymentState` changes from 2 → 1 after conversion

---

## Code Examples

### Complete React Native Component Example

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Platform, Alert } from 'react-native';
import {
  getSubscriptions,
  requestSubscription,
  getAvailablePurchases
} from 'react-native-iap';

const SubscriptionScreen = () => {
  const [subscription, setSubscription] = useState(null);
  const [isOnTrial, setIsOnTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState(null);
  const [hasTrialOffer, setHasTrialOffer] = useState(false);

  useEffect(() => {
    loadSubscription();
    checkTrialStatus();
  }, []);

  const loadSubscription = async () => {
    try {
      const subs = await getSubscriptions({ skus: ['monthly_premium'] });
      const sub = subs[0];
      setSubscription(sub);

      // Check if trial offer exists
      if (Platform.OS === 'android') {
        const trialOffer = sub?.subscriptionOfferDetails?.find(
          offer => {
            const firstPhase = offer.pricingPhases?.pricingPhaseList?.[0];
            return firstPhase?.priceAmountMicros === '0';
          }
        );
        setHasTrialOffer(!!trialOffer);
      } else {
        setHasTrialOffer(!!sub?.introductoryPrice);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const checkTrialStatus = async () => {
    try {
      const purchases = await getAvailablePurchases();
      const activePurchase = purchases.find(p => p.productId === 'monthly_premium');

      if (!activePurchase) {
        setIsOnTrial(false);
        return;
      }

      // iOS: Check isTrialPeriod field
      if (Platform.OS === 'ios' && activePurchase.isTrialPeriod) {
        setIsOnTrial(true);
        setTrialEndDate(new Date(activePurchase.expirationDate));
        return;
      }

      // Android: Verify via backend
      if (Platform.OS === 'android') {
        const response = await fetch('YOUR_BACKEND/verify-trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purchaseToken: activePurchase.purchaseToken,
            subscriptionId: 'monthly_premium',
          }),
        });

        const data = await response.json();
        setIsOnTrial(data.isOnTrial);
        if (data.trialEndTime) {
          setTrialEndDate(new Date(parseInt(data.trialEndTime)));
        }
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (Platform.OS === 'android') {
        const offerDetail = subscription?.subscriptionOfferDetails?.find(
          offer => offer.offerId === 'free-trial' || !offer.offerId
        );

        const purchase = await requestSubscription({
          sku: 'monthly_premium',
          subscriptionOffers: [{
            sku: 'monthly_premium',
            offerToken: offerDetail.offerToken,
          }],
        });

        // Verify on backend
        await fetch('YOUR_BACKEND/verify-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purchaseToken: purchase.purchaseToken,
            subscriptionId: 'monthly_premium',
          }),
        });
      } else {
        await requestSubscription({ sku: 'monthly_premium' });
      }

      Alert.alert('Success', 'Subscription activated!');
      checkTrialStatus();
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Failed to subscribe');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {isOnTrial && trialEndDate && (
        <View style={{ padding: 10, backgroundColor: '#FFE5B4', marginBottom: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>
            Free Trial Active
          </Text>
          <Text>
            Trial ends: {trialEndDate.toLocaleDateString()}
          </Text>
        </View>
      )}

      <Button
        title={hasTrialOffer ? "Start Free Trial" : "Subscribe Now"}
        onPress={handleSubscribe}
      />
    </View>
  );
};

export default SubscriptionScreen;
```

---

## Summary

### Key Takeaways

1. **Product-Level Trial Detection (Client-Side):**
   - Check `subscriptionOfferDetails` → `pricingPhases` → first phase with `priceAmountMicros = 0`
   - Use to display "Start Free Trial" button

2. **User Eligibility (Client-Side):**
   - ❌ No direct API for checking eligibility
   - ✅ Show trial offer, let Google Play handle eligibility validation

3. **Active Trial Status (Server-Side Required):**
   - Call Google Play Developer API
   - Check `paymentState === 2` for active trial
   - Store in database for fast access

4. **Real-Time Updates:**
   - Set up RTDN webhooks
   - Handle `SUBSCRIPTION_PURCHASED` (4) for trial start
   - Handle `SUBSCRIPTION_RENEWED` (2) for trial → paid conversion

5. **react-native-iap:**
   - Use `subscriptionOfferDetails` on Android
   - iOS has `isTrialPeriod` field (if `extended=true`)
   - Always verify server-side before granting premium access

---

## References

- [Google Play Billing Library Documentation](https://developer.android.com/google/play/billing)
- [Google Play Developer API - SubscriptionPurchase](https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptions)
- [Real-Time Developer Notifications Reference](https://developer.android.com/google/play/billing/rtdn-reference)
- [react-native-iap GitHub Repository](https://github.com/hyochan/react-native-iap)
- [react-native-iap Documentation](https://hyochan.github.io/react-native-iap/)

---

**Last Updated:** November 2024
**Verified with:** Google Play Billing Library 6/7, react-native-iap 12.15.4+
