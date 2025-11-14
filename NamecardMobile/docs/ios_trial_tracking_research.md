# iOS Free Trial Tracking with StoreKit & react-native-iap

**Research Date:** 2025-01-07
**Target Platform:** iOS with React Native (react-native-iap 12.15.4)
**StoreKit Version:** StoreKit 2 (iOS 17.2+) & StoreKit 1 (legacy)

---

## Executive Summary

This document provides a comprehensive guide on how App Store Connect/StoreKit tracks free trials and how to detect trial status in React Native apps using `react-native-iap`.

### Key Findings

1. **StoreKit 2 (iOS 17.2+)** uses `Transaction.Offer.PaymentMode.freeTrial` to detect trials
2. **StoreKit 1 (legacy)** uses receipt validation with `isTrialPeriod` and `isInIntroOfferPeriod` fields
3. **App Store Server API** uses `offerDiscountType: "FREE_TRIAL"` in JWSTransactionDecodedPayload
4. **react-native-iap** wraps both approaches, but primarily uses receipt validation
5. **Trial tracking requires server-side validation** for security and accurate subscription management

---

## 1. How StoreKit Tracks Free Trials

### 1.1 StoreKit 2 Approach (iOS 17.2+)

**Transaction.Offer Structure:**
```swift
Transaction.offer {
    id: String              // Offer identifier
    type: introductory | promotional | winBack
    paymentMode: freeTrial | payAsYouGo | payUpFront | oneTime
}
```

**Detecting Trial Status:**
```swift
// Check if purchase is a trial
if transaction.offer?.paymentMode == .freeTrial {
    print("User is on free trial")
}

// Get transaction details
for await result in Transaction.currentEntitlements {
    guard case .verified(let transaction) = result else { continue }

    if transaction.offer?.paymentMode == .freeTrial {
        // Grant trial access
    }
}
```

**Key Fields:**
- `offer.paymentMode`: Determines if the purchase is a trial
- `expirationDate`: When the trial/subscription expires
- `originalID`: Links all renewals to the original purchase

### 1.2 StoreKit 1 Approach (Legacy Receipt Validation)

**Receipt Fields for Trials:**
```json
{
  "receipt": {
    "in_app": [
      {
        "product_id": "com.example.monthly",
        "transaction_id": "1000000123456789",
        "original_transaction_id": "1000000123456789",
        "purchase_date_ms": "1704672000000",
        "expires_date_ms": "1705276800000",
        "is_trial_period": "true",
        "is_in_intro_offer_period": "true"
      }
    ]
  }
}
```

**Key Fields:**
- `is_trial_period`: "true" if currently in trial, "false" otherwise
- `is_in_intro_offer_period`: "true" for any introductory offer (trial, discounted pricing, etc.)
- `expires_date_ms`: UNIX timestamp (milliseconds) when trial/subscription expires

**Important Notes:**
- `is_trial_period` is only present for auto-renewable subscriptions
- Use `expires_date_ms` to calculate trial expiration date
- Compare `expires_date_ms` against current time to verify active status

---

## 2. react-native-iap Trial Detection

### 2.1 Purchase Object Structure (iOS)

When a purchase completes, `react-native-iap` returns:

```typescript
interface Purchase {
  transactionReceipt: string;          // Base64-encoded receipt
  originalTransactionDateIOS?: string;
  originalTransactionIdentifierIOS?: string;
  productId: string;
  transactionDate: string;
  transactionId: string;
  transactionReasonIOS?: string;
}
```

### 2.2 Client-Side Trial Detection

**Step 1: Listen for Purchase Updates**
```typescript
import RNIap, {
  purchaseUpdatedListener,
  finishTransaction
} from 'react-native-iap';

useEffect(() => {
  const purchaseUpdateSubscription = purchaseUpdatedListener(
    async (purchase) => {
      const receipt = purchase.transactionReceipt;

      if (receipt) {
        try {
          // Validate receipt to get trial status
          const isValid = await validateReceiptAndCheckTrial(receipt);

          if (isValid) {
            await finishTransaction(purchase);
          }
        } catch (error) {
          console.error('Receipt validation error:', error);
        }
      }
    }
  );

  return () => {
    purchaseUpdateSubscription.remove();
  };
}, []);
```

**Step 2: Validate Receipt (Client-Side - Testing Only)**
```typescript
async function validateReceiptAndCheckTrial(receipt: string) {
  if (Platform.OS !== 'ios') return false;

  try {
    // WARNING: This exposes your shared secret - use server-side validation in production
    const receiptBody = {
      'receipt-data': receipt,
      'password': 'YOUR_SHARED_SECRET', // From App Store Connect
      'exclude-old-transactions': true
    };

    // For sandbox testing, use true; for production, use false
    const isSandbox = __DEV__;
    const result = await RNIap.validateReceiptIos(receiptBody, isSandbox);

    // Parse response
    if (result.status === 0) { // Receipt valid
      const latestReceiptInfo = result.latest_receipt_info;

      if (latestReceiptInfo && latestReceiptInfo.length > 0) {
        const receiptData = latestReceiptInfo[0];

        const isTrialPeriod = receiptData.is_trial_period === 'true';
        const isInIntroOffer = receiptData.is_in_intro_offer_period === 'true';
        const expiresDateMs = parseInt(receiptData.expires_date_ms);
        const now = Date.now();

        const isActive = expiresDateMs > now;

        console.log('Trial Status:', {
          isTrialPeriod,
          isInIntroOffer,
          isActive,
          expiresAt: new Date(expiresDateMs)
        });

        return isActive;
      }
    }

    return false;
  } catch (error) {
    console.error('Receipt validation failed:', error);
    return false;
  }
}
```

**Known Issues:**
- `isTrialPeriod` has been reported to return false even during active trials in some cases
- First-time purchases may not return `originalTransactionIdentifierIOS`
- Client-side validation exposes shared secret (security risk)

### 2.3 Server-Side Validation (Recommended)

**Architecture:**
```
React Native App → Your Backend Server → App Store Server API → Response
```

**Why Server-Side Validation is Critical:**
1. **Security**: Shared secret never exposed in client code
2. **Accuracy**: Direct communication with Apple's servers
3. **Fraud Prevention**: Client-side validation can be bypassed
4. **Webhook Support**: Receive real-time subscription status changes

**Implementation Pattern:**
```typescript
// Client-side: Send receipt to your backend
async function validateReceiptOnServer(receipt: string) {
  try {
    const response = await fetch('https://yourapi.com/validate-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userAuthToken}`
      },
      body: JSON.stringify({
        receipt,
        platform: 'ios'
      })
    });

    const data = await response.json();

    return {
      isValid: data.isValid,
      isTrialPeriod: data.isTrialPeriod,
      expiresAt: data.expiresAt,
      productId: data.productId
    };
  } catch (error) {
    console.error('Server validation failed:', error);
    throw error;
  }
}
```

---

## 3. App Store Server API (Modern Approach)

### 3.1 JWSTransactionDecodedPayload Structure

Apple's modern approach uses JSON Web Signature (JWS) tokens:

```json
{
  "transactionId": "1000000123456789",
  "originalTransactionId": "1000000123456789",
  "productId": "com.example.monthly",
  "purchaseDate": 1704672000000,
  "expiresDate": 1705276800000,
  "offerType": 1,
  "offerDiscountType": "FREE_TRIAL",
  "offerIdentifier": "trial-7days"
}
```

**Key Fields for Trial Detection:**
- `offerType`: 1 = introductory offer (trial or discounted pricing)
- `offerDiscountType`: "FREE_TRIAL" | "PAY_AS_YOU_GO" | "PAY_UP_FRONT"
- `expiresDate`: UNIX timestamp (milliseconds) when trial expires

### 3.2 Get Transaction Info Endpoint

**Endpoint:**
```
GET https://api.storekit.itunes.apple.com/inApps/v1/transactions/{transactionId}
```

**Authentication:**
- Requires JWT signed with your App Store Connect API key

**Response:**
```json
{
  "signedTransaction": "eyJhbGciOiJFUzI1NiIsIn..."
}
```

Decode the `signedTransaction` JWT to access `JWSTransactionDecodedPayload`.

### 3.3 Trial Status Check Logic

```typescript
function isUserOnTrial(transactionPayload: JWSTransactionDecodedPayload): boolean {
  const now = Date.now();

  return (
    transactionPayload.offerDiscountType === 'FREE_TRIAL' &&
    transactionPayload.expiresDate > now
  );
}

function getTrialExpirationDate(transactionPayload: JWSTransactionDecodedPayload): Date | null {
  if (transactionPayload.offerDiscountType !== 'FREE_TRIAL') {
    return null;
  }

  return new Date(transactionPayload.expiresDate);
}
```

---

## 4. App Store Server Notifications V2 (Webhooks)

### 4.1 Notification Types for Trials

Apple sends webhook notifications for subscription events:

**Trial Started:**
- `notificationType`: `SUBSCRIBED`
- First subscription purchase with `offerDiscountType: "FREE_TRIAL"`

**Trial Converting to Paid:**
- `notificationType`: `DID_RENEW`
- Renewal after trial period ends
- `offerDiscountType` changes from `"FREE_TRIAL"` to null (or another offer)

**Trial Cancelled:**
- `notificationType`: `DID_CHANGE_RENEWAL_STATUS`
- User cancelled trial (auto-renewal disabled)
- Followed by `EXPIRED` notification when trial ends

**Trial Expiring:**
- `notificationType`: `EXPIRED`
- Trial period ended without conversion to paid

**Common Issues:**
- Some users report `DID_FAIL_TO_RENEW` notifications during trial-to-paid conversion
- This appears to be a transient issue that resolves automatically

### 4.2 Webhook Payload Structure

```json
{
  "signedPayload": "eyJhbGciOiJFUzI1NiIsIn..."
}
```

**Decoded Payload (responseBodyV2DecodedPayload):**
```json
{
  "notificationType": "SUBSCRIBED",
  "subtype": "INITIAL_BUY",
  "data": {
    "signedTransactionInfo": "eyJhbGciOiJFUzI1NiIsIn...",
    "signedRenewalInfo": "eyJhbGciOiJFUzI1NiIsIn..."
  }
}
```

Decode `signedTransactionInfo` to access `JWSTransactionDecodedPayload` with trial details.

### 4.3 Webhook Setup

1. **Configure Webhook URL in App Store Connect:**
   - Go to App Store Connect → Your App → App Information
   - Set Production Server URL and Sandbox Server URL

2. **Implement Webhook Endpoint:**
```typescript
// Example Express.js endpoint
app.post('/webhooks/appstore', async (req, res) => {
  try {
    const { signedPayload } = req.body;

    // Decode and verify JWT signature
    const payload = await verifyAndDecodeJWT(signedPayload);

    const { notificationType, data } = payload;

    // Decode transaction info
    const transactionInfo = await verifyAndDecodeJWT(data.signedTransactionInfo);

    // Update user subscription status in your database
    await updateUserSubscription({
      userId: transactionInfo.appAccountToken, // Set during purchase
      notificationType,
      isTrialPeriod: transactionInfo.offerDiscountType === 'FREE_TRIAL',
      expiresAt: new Date(transactionInfo.expiresDate)
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).send('Error');
  }
});
```

---

## 5. App Store Connect Configuration

### 5.1 Setting Up Free Trials

**Steps:**
1. Go to App Store Connect → Your App → Subscriptions
2. Select your Subscription Group
3. Click on the subscription product
4. Go to "Subscription Prices" → "View all Subscription Pricing"
5. Click "Introductory Offers" tab
6. Click "Set up Introductory Offer"
7. Select "Free" and choose duration (3 days, 1 week, 2 weeks, 1 month, 2 months, 3 months, 6 months, 1 year)

**Important Notes:**
- **One trial per subscription group**: Users can only use one introductory offer per subscription group
- **Cannot edit after creation**: Once created, you must delete and recreate to change trial duration
- **Eligibility**: Automatically enforced by StoreKit - users who previously had a trial cannot redeem again

### 5.2 Trial Revenue Tracking

**Key Points:**
- Free trials are **excluded** from "days of paid service"
- Renewal extensions are also excluded
- This affects the 70% → 85% revenue share threshold (one year of paid service)

---

## 6. Best Practices for Trial Tracking (2024-2025)

### 6.1 Security Best Practices

**DO:**
✅ Always validate receipts server-side
✅ Use App Store Server API for verification
✅ Set up webhook notifications for real-time updates
✅ Use JWT-based validation (StoreKit 2)
✅ Store trial expiration dates in your database
✅ Use `appAccountToken` to link purchases to users

**DON'T:**
❌ Never expose shared secret in client code
❌ Don't rely solely on client-side validation
❌ Don't skip receipt validation before granting access
❌ Don't trust purchase data without cryptographic verification

### 6.2 Implementation Checklist

**Client-Side (React Native):**
- [ ] Install `react-native-iap` (version 12.15.4+)
- [ ] Configure iOS capabilities (In-App Purchase)
- [ ] Request subscription products from App Store
- [ ] Implement `purchaseUpdatedListener` for purchase handling
- [ ] Send receipt to backend immediately after purchase
- [ ] Call `finishTransaction()` after successful validation
- [ ] Implement restore purchases flow
- [ ] Handle edge cases (interrupted purchases, network failures)

**Server-Side (Your Backend):**
- [ ] Create endpoint to validate iOS receipts
- [ ] Store App Store shared secret securely (environment variable)
- [ ] Decode and verify JWS signatures (StoreKit 2)
- [ ] Parse `JWSTransactionDecodedPayload` for trial status
- [ ] Store trial expiration dates in database
- [ ] Implement webhook endpoint for App Store Server Notifications
- [ ] Update user subscription status based on notifications
- [ ] Handle edge cases (billing retry, grace periods, refunds)

**Database Schema:**
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  original_transaction_id VARCHAR(255) NOT NULL,
  is_trial_period BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  auto_renew_status BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);
```

### 6.3 Trial Expiration Calculation

**From Receipt:**
```typescript
function calculateTrialExpiration(receiptData: any): Date {
  const expiresDateMs = parseInt(receiptData.expires_date_ms);
  return new Date(expiresDateMs);
}

function isTrialActive(receiptData: any): boolean {
  const expiresAt = calculateTrialExpiration(receiptData);
  const now = new Date();

  return expiresAt > now && receiptData.is_trial_period === 'true';
}
```

**From App Store Server API:**
```typescript
function getSubscriptionStatus(transactionPayload: JWSTransactionDecodedPayload) {
  const now = Date.now();
  const isExpired = transactionPayload.expiresDate < now;
  const isTrial = transactionPayload.offerDiscountType === 'FREE_TRIAL';

  if (isExpired) {
    return { status: 'expired', isTrial: false };
  }

  if (isTrial) {
    return {
      status: 'trial_active',
      isTrial: true,
      expiresAt: new Date(transactionPayload.expiresDate)
    };
  }

  return {
    status: 'paid_active',
    isTrial: false,
    expiresAt: new Date(transactionPayload.expiresDate)
  };
}
```

---

## 7. Differences: StoreKit 1 vs StoreKit 2

| Feature | StoreKit 1 (Legacy) | StoreKit 2 (iOS 17.2+) |
|---------|-------------------|----------------------|
| **Trial Detection** | `is_trial_period` in receipt | `Transaction.offer.paymentMode == .freeTrial` |
| **Validation** | Receipt-based (verifyReceipt API) | JWS signature verification |
| **Server Communication** | Required for validation | Optional (on-device validation possible) |
| **Security** | Base64-encoded receipt | Cryptographically signed JWT |
| **Expiration Check** | Parse `expires_date_ms` from receipt | `transaction.expirationDate` |
| **Transaction History** | Full receipt with all transactions | Paginated `Transaction.all` API |
| **Real-time Updates** | Server webhooks only | `Transaction.updates` async sequence + webhooks |

**Migration Notes:**
- StoreKit 2 doesn't automatically update the App Store receipt
- Apps using both StoreKit 1 and StoreKit 2 should validate via both methods during transition
- react-native-iap primarily uses StoreKit 1 approach (receipt validation)

---

## 8. Common Pitfalls & Solutions

### 8.1 `getAvailablePurchases()` Limitations

**Issue:**
- Returns all purchases ever made, even expired subscriptions
- Cannot directly determine if subscription is currently active
- No trial status flag on iOS

**Solution:**
```typescript
async function checkActiveSubscription() {
  try {
    const purchases = await RNIap.getAvailablePurchases();

    if (purchases.length === 0) {
      return { isActive: false, isTrial: false };
    }

    // Sort by transaction date (most recent first)
    const sortedPurchases = purchases.sort((a, b) =>
      new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    );

    // Validate the most recent purchase
    const latestPurchase = sortedPurchases[0];
    const receipt = latestPurchase.transactionReceipt;

    // Send to server for validation
    const status = await validateReceiptOnServer(receipt);

    return status;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { isActive: false, isTrial: false };
  }
}
```

### 8.2 Trial Eligibility Detection

**Issue:**
- react-native-iap doesn't provide direct trial eligibility check on iOS
- Users who already used a trial cannot redeem another trial

**Solution:**
```typescript
// Server-side: Check transaction history via App Store Server API
async function isEligibleForTrial(userId: string): Promise<boolean> {
  try {
    // Query your database for user's subscription history
    const history = await db.query(
      'SELECT * FROM user_subscriptions WHERE user_id = $1 AND is_trial_period = true',
      [userId]
    );

    // If user has any trial records, they're not eligible
    return history.rows.length === 0;
  } catch (error) {
    console.error('Error checking trial eligibility:', error);
    return false;
  }
}
```

### 8.3 Handling Interrupted Purchases

**Issue:**
- Network failures or app crashes can leave purchases unfinished
- User paid but app didn't receive confirmation

**Solution:**
```typescript
// Check for pending transactions on app launch
async function checkPendingTransactions() {
  try {
    const purchases = await RNIap.getAvailablePurchases();

    for (const purchase of purchases) {
      // Validate each purchase
      const receipt = purchase.transactionReceipt;
      const isValid = await validateReceiptOnServer(receipt);

      if (isValid) {
        // Finish the transaction
        await RNIap.finishTransaction(purchase);
        console.log('Finished pending transaction:', purchase.transactionId);
      }
    }
  } catch (error) {
    console.error('Error checking pending transactions:', error);
  }
}

// Call on app launch
useEffect(() => {
  checkPendingTransactions();
}, []);
```

---

## 9. Testing Trial Subscriptions

### 9.1 Sandbox Testing

**Setup:**
1. Create a Sandbox Tester account in App Store Connect
2. Sign out of App Store on your test device
3. Run your app and attempt purchase
4. Sign in with Sandbox Tester credentials when prompted

**Trial Duration in Sandbox:**
| Production Duration | Sandbox Duration |
|-------------------|-----------------|
| 3 days | 2 minutes |
| 1 week | 3 minutes |
| 2 weeks | 3 minutes |
| 1 month | 5 minutes |
| 2 months | 5 minutes |
| 3 months | 5 minutes |
| 6 months | 10 minutes |
| 1 year | 15 minutes |

**Renewals in Sandbox:**
- Auto-renewable subscriptions renew up to 6 times in sandbox
- After 6 renewals, subscription expires

### 9.2 StoreKit Configuration File (Local Testing)

iOS 14+ supports local StoreKit testing without App Store Connect:

1. Create `StoreKit Configuration.storekit` file in Xcode
2. Add subscription products with trial offers
3. Run app in simulator with StoreKit configuration

**Advantages:**
- No network required
- Instant testing
- Full control over trial scenarios

---

## 10. Example Implementation

### 10.1 Complete React Native Flow

```typescript
// hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import RNIap, {
  purchaseUpdatedListener,
  finishTransaction,
  PurchaseError,
  requestSubscription
} from 'react-native-iap';

interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  expiresAt: Date | null;
  productId: string | null;
}

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isTrial: false,
    expiresAt: null,
    productId: null
  });
  const [loading, setLoading] = useState(false);

  // Initialize IAP connection
  useEffect(() => {
    const initIAP = async () => {
      try {
        await RNIap.initConnection();
        console.log('IAP initialized');

        // Check for existing subscriptions
        await checkSubscriptionStatus();
      } catch (error) {
        console.error('IAP initialization failed:', error);
      }
    };

    initIAP();

    // Listen for purchase updates
    const purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase) => {
        const receipt = purchase.transactionReceipt;

        if (receipt) {
          try {
            // Validate receipt on your server
            const result = await validateReceiptOnServer(receipt);

            if (result.isValid) {
              setStatus({
                isActive: true,
                isTrial: result.isTrial,
                expiresAt: new Date(result.expiresAt),
                productId: result.productId
              });

              // Finish transaction
              await finishTransaction(purchase);
            }
          } catch (error) {
            console.error('Receipt validation failed:', error);
          }
        }
      }
    );

    return () => {
      purchaseUpdateSubscription.remove();
      RNIap.endConnection();
    };
  }, []);

  async function checkSubscriptionStatus() {
    try {
      const purchases = await RNIap.getAvailablePurchases();

      if (purchases.length === 0) {
        setStatus({
          isActive: false,
          isTrial: false,
          expiresAt: null,
          productId: null
        });
        return;
      }

      // Get most recent purchase
      const latestPurchase = purchases.sort((a, b) =>
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      )[0];

      const receipt = latestPurchase.transactionReceipt;
      const result = await validateReceiptOnServer(receipt);

      setStatus({
        isActive: result.isValid,
        isTrial: result.isTrial,
        expiresAt: result.expiresAt ? new Date(result.expiresAt) : null,
        productId: result.productId
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }

  async function subscribe(productId: string) {
    try {
      setLoading(true);

      await requestSubscription({
        sku: productId,
        ...(Platform.OS === 'ios' && {
          appAccountToken: 'USER_UNIQUE_ID' // Link purchase to your user
        })
      });

      // purchaseUpdatedListener will handle the rest
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return {
    status,
    loading,
    subscribe,
    refresh: checkSubscriptionStatus
  };
}

// Validate receipt on your backend
async function validateReceiptOnServer(receipt: string) {
  const response = await fetch('https://yourapi.com/validate-receipt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userAuthToken}`
    },
    body: JSON.stringify({ receipt })
  });

  if (!response.ok) {
    throw new Error('Receipt validation failed');
  }

  return await response.json();
}
```

### 10.2 Server-Side Validation (Node.js + Express)

```typescript
// server/routes/iap.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

// Apple's verification endpoints
const SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';
const PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';

router.post('/validate-receipt', async (req, res) => {
  try {
    const { receipt } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate receipt with Apple
    const result = await validateWithApple(receipt);

    if (result.status !== 0) {
      return res.status(400).json({ error: 'Invalid receipt' });
    }

    // Parse latest receipt info
    const latestReceiptInfo = result.latest_receipt_info[0];
    const isTrialPeriod = latestReceiptInfo.is_trial_period === 'true';
    const expiresDateMs = parseInt(latestReceiptInfo.expires_date_ms);
    const now = Date.now();
    const isValid = expiresDateMs > now;

    // Store in database
    await supabase.from('user_subscriptions').upsert({
      user_id: userId,
      product_id: latestReceiptInfo.product_id,
      transaction_id: latestReceiptInfo.transaction_id,
      original_transaction_id: latestReceiptInfo.original_transaction_id,
      is_trial_period: isTrialPeriod,
      expires_at: new Date(expiresDateMs).toISOString(),
      auto_renew_status: result.pending_renewal_info[0]?.auto_renew_status === '1',
      updated_at: new Date().toISOString()
    });

    res.json({
      isValid,
      isTrial: isTrialPeriod,
      expiresAt: new Date(expiresDateMs).toISOString(),
      productId: latestReceiptInfo.product_id
    });
  } catch (error) {
    console.error('Receipt validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

async function validateWithApple(receipt: string) {
  const requestBody = {
    'receipt-data': receipt,
    'password': process.env.APPLE_SHARED_SECRET,
    'exclude-old-transactions': true
  };

  // Try production first
  let response = await fetch(PRODUCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  let result = await response.json();

  // If production returns sandbox receipt error (21007), retry with sandbox
  if (result.status === 21007) {
    response = await fetch(SANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    result = await response.json();
  }

  return result;
}

export default router;
```

---

## 11. Resources

### Official Documentation
- [App Store Server API](https://developer.apple.com/documentation/appstoreserverapi)
- [App Store Server Notifications V2](https://developer.apple.com/documentation/appstoreservernotifications)
- [StoreKit 2](https://developer.apple.com/documentation/storekit)
- [JWSTransactionDecodedPayload](https://developer.apple.com/documentation/appstoreserverapi/jwstransactiondecodedpayload)
- [react-native-iap Documentation](https://github.com/hyochan/react-native-iap)

### Useful Libraries
- [react-native-iap](https://www.npmjs.com/package/react-native-iap) - In-app purchase library
- [App Store Server Library (Node.js)](https://github.com/apple/app-store-server-library-node) - Official Apple library for server-side validation

### Community Resources
- [react-native-iap GitHub Issues](https://github.com/hyochan/react-native-iap/issues) - Common problems and solutions
- [Stack Overflow: react-native-iap](https://stackoverflow.com/questions/tagged/react-native-iap)
- [App Store Connect Help](https://developer.apple.com/app-store-connect/)

---

## 12. Conclusion

### Key Takeaways

1. **Always use server-side validation** for production apps
2. **StoreKit 2** offers better security and performance, but **react-native-iap** primarily uses StoreKit 1 approach
3. **Trial status** is determined by `offerDiscountType: "FREE_TRIAL"` (StoreKit 2) or `is_trial_period: "true"` (StoreKit 1)
4. **Expiration dates** are critical for determining active subscription status
5. **App Store Server Notifications** provide real-time subscription updates
6. **Test thoroughly** in sandbox with accelerated renewal times

### Next Steps

For your WhatsCard app:

1. ✅ Configure subscription products in App Store Connect with 7-day free trial
2. ✅ Implement server-side receipt validation endpoint
3. ✅ Set up App Store Server Notifications webhook
4. ✅ Create Supabase database tables for subscription tracking
5. ✅ Implement client-side `useSubscription` hook
6. ✅ Test trial flow in sandbox environment
7. ✅ Handle edge cases (interrupted purchases, restore purchases, billing issues)

---

**Document Version:** 1.0
**Last Updated:** 2025-01-07
**Author:** Claude Code Research Agent
