# 📱 App Store & Play Store Subscription Setup Guide

Complete step-by-step guide to configure all 4 subscription plans in App Store Connect and Google Play Console.

---

## 🍎 iOS - App Store Connect Setup

### Your App Details
- **App ID**: 6754809694
- **Bundle ID**: `com.alittlebetter.alittlebetter`
- **Subscription Group**: Premium Access (21821977)

### Step 1: Login to App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Navigate to **My Apps** → **WhatsCard** (App ID: 6754809694)
3. Click **Subscriptions** in the left sidebar

---

### Step 2: Create Basic Monthly Subscription

1. Click **➕ Create Subscription** (or add to existing Subscription Group)
2. **Select Subscription Group**: Premium Access (21821977)

**General Information:**
- **Reference Name**: WhatsCard Basic Monthly
- **Product ID**: `whatscard_basic_monthly` (⚠️ CRITICAL: Must match exactly)
- **Subscription Duration**: 1 Month (Auto-Renewable)

**Subscription Pricing:**
- **Price**: $5.95 USD/month
- **Availability**: All territories or select specific countries

**Localization (English - U.S.):**
- **Display Name**: WhatsCard Basic
- **Description**: Scan business cards, save contacts to cloud, and export to Excel. Perfect for essential networking needs.

**Review Information:**
- Upload a screenshot showing the Basic plan features
- Add review notes if needed

3. Click **Save**
4. Click **Submit for Review** (required before it appears in App Store API)

---

### Step 3: Create Basic Yearly Subscription

1. Click **➕ Create Subscription**
2. **Select Subscription Group**: Premium Access (21821977)

**General Information:**
- **Reference Name**: WhatsCard Basic Yearly
- **Product ID**: `whatscard_basic_yearly` (⚠️ CRITICAL: Must match exactly)
- **Subscription Duration**: 1 Year (Auto-Renewable)

**Subscription Pricing:**
- **Price**: $71.50 USD/year
- **Availability**: All territories

**Localization (English - U.S.):**
- **Display Name**: WhatsCard Basic (Annual)
- **Description**: Scan business cards, save contacts to cloud, and export to Excel. Save 17% with annual billing!

3. Click **Save**
4. Click **Submit for Review**

---

### Step 4: Verify Existing Premium Subscriptions

**Already Configured (DO NOT MODIFY):**

**Premium Monthly:**
- Product ID: `whatscard_premium_monthly` ✅
- Price: $9.95 USD/month
- Status: Active

**Premium Yearly:**
- Product ID: `whatscard_premium_yearly` ✅
- Price: $119.40 USD/year
- Status: Active

⚠️ **Do NOT change these existing product IDs** - users with active subscriptions depend on them.

---

### Step 5: Wait for Apple Review

**Processing Time**: 24-48 hours

**Status Check:**
1. Go to **Subscriptions** tab
2. Check status of new subscriptions:
   - ⏳ **Pending Developer Release** → Approved, ready to activate
   - ✅ **Ready to Submit** → Submit now
   - ❌ **Rejected** → Fix issues and resubmit

**Important:**
- Subscriptions MUST be approved before they appear in `fetchProducts()` API
- Test in **Sandbox** environment with a Sandbox Test Account while waiting for approval

---

### Step 6: Test with Sandbox Account

**Create Sandbox Tester:**
1. App Store Connect → **Users and Access** → **Sandbox Testers**
2. Click **➕** to add tester
3. Use a NEW email (not your real Apple ID)
4. Save tester credentials

**Test on Device:**
1. iOS Settings → App Store → Sign Out
2. Run your app build (TestFlight or development build)
3. Try to purchase - iOS will prompt for Sandbox login
4. Login with Sandbox tester credentials
5. Verify all 4 products load and purchase works

---

## 🤖 Android - Google Play Console Setup

### Your App Details
- **Package Name**: `com.resultmarketing.whatscard`
- **Developer Account**: Drinking Monster (6055773806895794556)
- **Service Fee**: 15%

### Step 1: Login to Google Play Console
1. Go to https://play.google.com/console
2. Select **WhatsCard** app
3. Navigate to **Monetize** → **Subscriptions**

---

### Step 2: Create Basic Monthly Subscription

1. Click **Create subscription**

**Subscription Details:**
- **Product ID**: `basic_monthly_subscription` (⚠️ CRITICAL: Must match exactly)
- **Name**: WhatsCard Basic
- **Description**: Scan business cards, save contacts to cloud, and export to Excel. Essential networking features.

**Base Plan Setup:**
1. Click **Add base plan**
2. **Base plan ID**: `basic-monthly`
3. **Billing period**: 1 month (recurring)
4. **Auto-renewing**: Yes

**Pricing:**
- **Price**: $5.95 USD/month
- Set pricing for all countries (or use default conversions)

**Eligibility:**
- **New customers**: Yes
- **Upgrade**: Yes (from free or other plans)
- **Downgrade**: Yes
- **Free trial**: Optional (e.g., 7 days free trial)

2. Click **Activate** to make the subscription live

---

### Step 3: Create Basic Yearly Subscription

1. Click **Create subscription**

**Subscription Details:**
- **Product ID**: `basic_yearly_subscription` (⚠️ CRITICAL: Must match exactly)
- **Name**: WhatsCard Basic (Annual)
- **Description**: Scan business cards, save contacts to cloud, and export to Excel. Save 17% with annual billing!

**Base Plan Setup:**
1. Click **Add base plan**
2. **Base plan ID**: `basic-yearly`
3. **Billing period**: 1 year (recurring)
4. **Auto-renewing**: Yes

**Pricing:**
- **Price**: $71.50 USD/year

2. Click **Activate**

---

### Step 4: Verify Existing Premium Subscriptions

**Already Configured (DO NOT MODIFY):**

**Premium Monthly:**
- Product ID: `monthly_premium_subscription` ✅
- Base Plan ID: `premium-monthly`
- Price: $9.95 USD/month
- Status: Active

**Premium Yearly:**
- Product ID: `yearly_premium_subscription` ✅
- Base Plan ID: `premium-yearly`
- Price: $119.40 USD/year
- Status: Active

⚠️ **Do NOT change these existing product IDs** - users with active subscriptions depend on them.

---

### Step 5: Publish to Internal Testing Track

**Important**: Subscriptions are ONLY available to testers on Internal Testing track or higher.

1. Navigate to **Testing** → **Internal testing**
2. Create a new release (or update existing)
3. Upload your APK/AAB with the updated IAP code
4. Add testers:
   - Click **Testers** tab
   - Create email list (e.g., "WhatsCard Testers")
   - Add tester email addresses
5. Click **Review release** → **Start rollout to Internal testing**

**Wait Time**: 5-10 minutes for release to propagate

---

### Step 6: Test Subscriptions

**Test Account Setup:**
1. Ensure tester is added to Internal Testing email list
2. Tester must accept the opt-in link sent via email
3. Install app from Play Store (via Internal Testing link)

**Test Purchasing:**
1. Open app on tester's device
2. Navigate to subscription screen
3. Verify all 4 subscriptions load
4. Test purchase flow (Google Play will process real payment for testers)

**License Testing (Optional - Free Testing):**
1. Go to Play Console → **Setup** → **License testing**
2. Add tester email to **License testers** list
3. Set **Test response**: License Test Response
4. Tester can now purchase WITHOUT real payment

---

## 🔍 Verification Checklist

### Before Going Live

**iOS App Store Connect:**
- [ ] `whatscard_basic_monthly` created and submitted for review
- [ ] `whatscard_basic_yearly` created and submitted for review
- [ ] Both subscriptions in same Subscription Group as Premium plans
- [ ] Pricing correct: $5.95/month, $71.50/year
- [ ] Localization added (at minimum English)
- [ ] Sandbox tested successfully

**Android Play Console:**
- [ ] `basic_monthly_subscription` created and activated
- [ ] `basic_yearly_subscription` created and activated
- [ ] Base plans configured with correct billing periods
- [ ] Pricing correct: $5.95/month, $71.50/year
- [ ] Published to Internal Testing track
- [ ] Tested with real tester account

**App Code:**
- [ ] `config/iap-config.ts` has correct Product IDs
- [ ] `services/iapService.ts` fetches all 4 products
- [ ] `components/screens/PaywallScreen.tsx` displays all 4 plans
- [ ] Mock mode tested (all 4 plans show)
- [ ] Type checks pass: `npm run type:check`
- [ ] App builds successfully

---

## ⚠️ Common Issues & Solutions

### iOS: Products Not Appearing in fetchProducts()

**Symptoms:**
- `fetchProducts()` returns 0 products
- Alert shows "App Store returned 0 products"

**Causes & Solutions:**

1. **Products not submitted for review**
   - Solution: Submit subscriptions for review in App Store Connect
   - Wait 24-48 hours for approval

2. **Product IDs don't match exactly**
   - Check: `whatscard_basic_monthly` (not `whatscard-basic-monthly` with hyphen)
   - Check: `whatscard_basic_yearly`
   - Solution: Product IDs in code MUST match App Store Connect exactly

3. **Bundle ID mismatch**
   - Check: App bundle ID is `com.alittlebetter.alittlebetter`
   - Solution: Ensure provisioning profile matches

4. **App not published to TestFlight**
   - Solution: Upload build to TestFlight (even if just for testing)
   - Subscriptions require at least one build in TestFlight

5. **Not using Sandbox account**
   - Solution: Sign out of real Apple ID on device
   - Sign in with Sandbox tester when prompted during purchase

---

### Android: Products Not Appearing in fetchProducts()

**Symptoms:**
- `fetchProducts()` returns 0 products
- No billing offers available

**Causes & Solutions:**

1. **Base plans not activated**
   - Solution: Go to subscription → Base plans → Click "Activate"
   - Ensure status shows "Active" (not "Draft")

2. **Product IDs don't match exactly**
   - Check: `basic_monthly_subscription` (not `basic-monthly-subscription`)
   - Check: `basic_yearly_subscription`
   - Solution: Product IDs in code MUST match Play Console exactly

3. **App not published to testing track**
   - Solution: Publish to Internal Testing track (minimum)
   - Production builds can't fetch test subscriptions

4. **Tester not added to testing program**
   - Solution: Add tester email to Internal Testing email list
   - Tester must accept opt-in link

5. **Package name mismatch**
   - Check: App package name is `com.resultmarketing.whatscard`
   - Solution: Ensure app.json matches

6. **Billing offers missing**
   - Solution: Each base plan needs at least ONE offer
   - Create default offer if missing

---

## 📊 Testing Matrix

Test all 4 subscription plans thoroughly:

| Plan | iOS Sandbox | Android License Test | iOS Production | Android Production |
|------|-------------|---------------------|----------------|-------------------|
| Basic Monthly | ✅ | ✅ | ⏳ | ⏳ |
| Basic Yearly | ✅ | ✅ | ⏳ | ⏳ |
| Premium Monthly | ✅ | ✅ | ✅ | ✅ |
| Premium Yearly | ✅ | ✅ | ✅ | ✅ |

**Legend:**
- ✅ Ready to test
- ⏳ Pending approval/activation
- ❌ Not working

---

## 🚀 Deployment Timeline

**Day 1:**
- Create subscriptions in App Store Connect and Play Console
- Submit iOS subscriptions for review
- Activate Android subscriptions
- Deploy app to Internal Testing (Android)
- Upload to TestFlight (iOS)

**Day 2-3:**
- Wait for Apple approval
- Test Android subscriptions with testers
- Monitor for issues

**Day 4:**
- iOS subscriptions approved
- Test iOS subscriptions in Sandbox
- Fix any issues found

**Day 5:**
- Final testing on both platforms
- Verify all 4 plans load and purchase
- Check receipt validation works

**Day 6:**
- Deploy to production (App Store & Play Store)
- Monitor crash reports and purchase analytics
- Provide user support for any issues

---

## 📞 Support Resources

**iOS Issues:**
- App Store Connect Help: https://developer.apple.com/support/app-store-connect/
- Sandbox Testing: https://developer.apple.com/apple-pay/sandbox-testing/
- In-App Purchase FAQ: https://developer.apple.com/in-app-purchase/

**Android Issues:**
- Play Console Help: https://support.google.com/googleplay/android-developer
- Subscription Testing: https://developer.android.com/google/play/billing/test
- Billing Library Docs: https://developer.android.com/google/play/billing

**react-native-iap Issues:**
- GitHub Repo: https://github.com/dooboolab-community/react-native-iap
- Documentation: https://react-native-iap.dooboolab.com/

---

## ✅ Final Checklist

Before launching to users:

- [ ] All 4 subscriptions created in App Store Connect
- [ ] All 4 subscriptions created in Google Play Console
- [ ] iOS subscriptions approved by Apple
- [ ] Android subscriptions activated
- [ ] Tested in Sandbox (iOS) and License Testing (Android)
- [ ] Tested on real devices (at least 1 iOS, 1 Android)
- [ ] Receipt validation working (Supabase Edge Function)
- [ ] All purchases finish transaction properly
- [ ] Restore purchases working
- [ ] App displays correct pricing ($5.95, $71.50, $9.95, $119.40)
- [ ] Feature access works (Basic vs Premium features)
- [ ] Analytics tracking purchases
- [ ] User can manage/cancel subscriptions

**When all items checked → Safe to deploy to production! 🎉**
