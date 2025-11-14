# Android In-App Purchase Setup Guide (2025+)

## Overview

Google Play Console has modernized their in-app purchase verification system. The old "License Key" approach is **deprecated** and no longer recommended.

---

## ✅ Modern Approach (Required)

### **1. Google Play Billing Library v5+**

Your app already uses `expo-in-app-purchases`, which wraps the modern Google Play Billing Library. No additional client-side changes needed.

### **2. Server-Side Verification**

For production apps, you **must** verify purchases on your server to prevent fraud.

#### **Setup Steps:**

1. **Enable Google Play Developer API**
   - Go to: [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Google Play Android Developer API"
   - Go to: APIs & Services → Library
   - Search for "Google Play Android Developer API"
   - Click "Enable"

2. **Create Service Account**
   - Go to: IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Name: `whatscard-play-verification`
   - Role: `Service Account User`
   - Click "Create and Continue"
   - Click "Done"

3. **Generate Service Account Key**
   - Click on your service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Download the JSON file
   - **⚠️ Keep this file secure!** It's like a password.

4. **Link Service Account to Play Console**
   - Go to: [Google Play Console](https://play.google.com/console)
   - Select your app
   - Go to: Setup → API access
   - Click "Link" under "Service accounts"
   - Select your service account
   - Grant permissions:
     - ✅ View financial data
     - ✅ Manage orders and subscriptions
   - Click "Apply"

5. **Store Credentials in Supabase Edge Function**

Create `supabase/functions/verify-android-purchase/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Load service account credentials from environment
const SERVICE_ACCOUNT_EMAIL = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL')!
const PRIVATE_KEY = Deno.env.get('GOOGLE_PRIVATE_KEY')!
const PACKAGE_NAME = 'com.resultmarketing.whatscard'

serve(async (req) => {
  try {
    const { purchaseToken, productId, userId } = await req.json()

    // Step 1: Get OAuth2 access token
    const accessToken = await getAccessToken(SERVICE_ACCOUNT_EMAIL, PRIVATE_KEY)

    // Step 2: Verify purchase with Google Play API
    const verifyUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`

    const response = await fetch(verifyUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`)
    }

    const purchase = await response.json()

    // Step 3: Validate purchase data
    const isValid = validatePurchase(purchase)

    if (isValid) {
      // Step 4: Update user subscription in database
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      const expiryDate = new Date(parseInt(purchase.expiryTimeMillis))

      await supabase
        .from('users')
        .update({
          tier: getSubscriptionTier(productId),
          subscription_end: expiryDate.toISOString(),
        })
        .eq('id', userId)

      // Step 5: Log transaction
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'subscription',
        amount: purchase.priceAmountMicros / 1000000,
        currency: purchase.priceCurrencyCode,
        metadata: {
          platform: 'android',
          productId,
          purchaseToken,
          orderId: purchase.orderId,
        },
      })

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          expiryDate: expiryDate.toISOString(),
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid purchase' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Verification error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function getAccessToken(email: string, privateKey: string): Promise<string> {
  // Generate JWT for Google OAuth2
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  // Sign JWT with private key
  const jwt = await signJWT(payload, privateKey)

  // Exchange JWT for access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const data = await response.json()
  return data.access_token
}

async function signJWT(payload: any, privateKey: string): Promise<string> {
  // Implementation of JWT signing with RS256
  // You can use a library like jose for this
  // See: https://deno.land/x/jose
  throw new Error('Implement JWT signing')
}

function validatePurchase(purchase: any): boolean {
  // Validate that purchase is active and not expired
  const now = Date.now()
  const expiry = parseInt(purchase.expiryTimeMillis)

  return (
    expiry > now &&
    purchase.paymentState === 1 && // Payment received
    purchase.acknowledgementState === 1 // Acknowledged
  )
}

function getSubscriptionTier(productId: string): string {
  if (productId.includes('monthly')) return 'pro'
  if (productId.includes('yearly')) return 'pro'
  return 'free'
}
```

6. **Set Environment Variables in Supabase**

In your Supabase project:
- Go to: Project Settings → Edge Functions
- Add secrets:
  ```
  GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
  GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
  ```

---

### **3. Real-Time Developer Notifications (RTDN)**

Google Play can notify your server when subscription events occur (renewals, cancellations, etc.)

#### **Setup:**

1. **Create Pub/Sub Topic**
   - Go to: [Google Cloud Console](https://console.cloud.google.com/)
   - Go to: Pub/Sub → Topics
   - Click "Create Topic"
   - Name: `whatscard-play-notifications`
   - Click "Create"

2. **Create Pub/Sub Subscription**
   - Click on your topic
   - Click "Create Subscription"
   - Name: `whatscard-play-sub`
   - Delivery type: Push
   - Endpoint URL: `https://[your-project].supabase.co/functions/v1/play-notifications`
   - Click "Create"

3. **Configure in Play Console**
   - Go to: [Google Play Console](https://play.google.com/console)
   - Select your app
   - Go to: Monetization setup → Real-time developer notifications
   - Enable notifications
   - Enter your Pub/Sub topic: `projects/[project-id]/topics/whatscard-play-notifications`
   - Click "Send test notification" to verify

4. **Create Handler Edge Function**

Create `supabase/functions/play-notifications/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const body = await req.json()

    // Decode Pub/Sub message
    const message = JSON.parse(
      atob(body.message.data)
    )

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Handle different notification types
    switch (message.notificationType) {
      case 1: // SUBSCRIPTION_RECOVERED
      case 2: // SUBSCRIPTION_RENEWED
        await handleSubscriptionRenewed(message, supabase)
        break

      case 3: // SUBSCRIPTION_CANCELED
        await handleSubscriptionCanceled(message, supabase)
        break

      case 4: // SUBSCRIPTION_PURCHASED
        await handleSubscriptionPurchased(message, supabase)
        break

      case 12: // SUBSCRIPTION_EXPIRED
        await handleSubscriptionExpired(message, supabase)
        break
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Notification error:', error)
    return new Response('Error', { status: 500 })
  }
})

async function handleSubscriptionRenewed(message: any, supabase: any) {
  // Update user's subscription_end date
  const { subscriptionNotification } = message
  // Fetch latest purchase info from Google Play API
  // Update database accordingly
}

async function handleSubscriptionCanceled(message: any, supabase: any) {
  // Mark subscription as canceled
  // Don't immediately revoke access - wait for expiry
}

async function handleSubscriptionPurchased(message: any, supabase: any) {
  // New subscription purchased
  // Verify and grant access
}

async function handleSubscriptionExpired(message: any, supabase: any) {
  // Subscription expired
  // Revoke premium access
  const { subscriptionNotification } = message

  // Find user by purchase token (you need to store this during purchase)
  await supabase
    .from('users')
    .update({ tier: 'free', subscription_end: null })
    .eq('purchase_token', subscriptionNotification.purchaseToken)
}
```

---

## 📋 Complete Setup Checklist

```
✅ Enable Google Play Developer API in Cloud Console
✅ Create service account
✅ Generate service account JSON key
✅ Link service account to Play Console
✅ Grant API permissions (financial data, orders)
✅ Create Pub/Sub topic for RTDN
✅ Configure RTDN in Play Console
✅ Deploy server-side verification Edge Function
✅ Deploy RTDN handler Edge Function
✅ Set environment variables in Supabase
✅ Test with sandbox purchases
```

---

## 🧪 Testing

### **Test in Internal Testing Track:**

1. Upload AAB to Internal Testing
2. Add test users
3. Install app from testing link
4. Make test purchase
5. Verify in Play Console:
   - Order Management → Subscriptions
   - Check notification logs
6. Verify in your database:
   - User tier updated
   - Transaction recorded

### **Verify Server-Side:**

```bash
# Test your verification endpoint
curl -X POST https://[your-project].supabase.co/functions/v1/verify-android-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseToken": "test_token",
    "productId": "yearly_premium_subscription",
    "userId": "user_uuid"
  }'
```

---

## 🔐 Security Best Practices

1. **Never** include service account credentials in your app code
2. **Always** verify purchases on your server, never trust client
3. **Store** purchase tokens in your database to handle RTDN
4. **Implement** retry logic for failed API calls
5. **Monitor** Pub/Sub delivery failures
6. **Log** all purchase verification attempts
7. **Rate limit** verification endpoints to prevent abuse

---

## 📚 Additional Resources

- [Google Play Billing Library](https://developer.android.com/google/play/billing)
- [Google Play Developer API](https://developers.google.com/android-publisher)
- [Real-time Developer Notifications](https://developer.android.com/google/play/billing/rtdn-reference)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 💡 Recommended: Use RevenueCat

For easier implementation, consider using [RevenueCat](https://www.revenuecat.com/):

✅ Handles all server-side verification automatically
✅ Cross-platform support (iOS + Android)
✅ Built-in analytics and webhook system
✅ Free up to $2,500 MRR
✅ Saves weeks of development time

This is the **recommended approach** for production apps unless you have specific requirements for custom implementation.
