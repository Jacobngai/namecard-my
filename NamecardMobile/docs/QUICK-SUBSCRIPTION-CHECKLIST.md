# App Store Subscription Setup - Quick Checklist

**CRITICAL:** Subscriptions MUST be created BEFORE build upload!

---

## ⚡ Quick Answer

**ORDER OF OPERATIONS:**
1. Create subscriptions in App Store Connect
2. Configure free trials
3. Get to "Ready to Submit" status
4. Upload build with EAS
5. Test in TestFlight
6. Submit for review

---

## ✅ Pre-Flight Checklist

Before starting:
- [ ] Apple Developer Account active ($99/year paid)
- [ ] App created in App Store Connect
- [ ] Bundle ID matches (App Store Connect = app.json)
- [ ] Developer agreements signed
- [ ] Tax and banking info submitted

---

## 📝 Subscription Creation Steps

### 1. Create Subscription Group (5 minutes)
- Navigate: App Store Connect → Your App → Monetization → Subscriptions
- Click "+" under Subscription Groups
- Name: "WhatsCard Premium"
- Save

### 2. Create Monthly Subscription (10 minutes)
- Click "+" under group
- **Reference Name:** WhatsCard Pro Monthly
- **Product ID:** `com.whatscard.pro.monthly`
- **Duration:** 1 month
- **Availability:** All countries (or select specific)
- **Price:** RM 199 (or equivalent)
- **Localization:** Add English display name & description
- **Free Trial:** Click "+", select "Free", duration "3 days"
- **Screenshot:** Upload paywall image
- Save

### 3. Create Yearly Subscription (10 minutes)
- Repeat step 2 with:
  - **Product ID:** `com.whatscard.pro.yearly`
  - **Duration:** 1 year
  - **Price:** RM 199/year
  - **Free Trial:** 3 days

### 4. Verify Status
- [ ] Both subscriptions show "Ready to Submit"
- [ ] NOT "Missing Metadata"
- [ ] Free trials configured
- [ ] Screenshot uploaded

---

## 🚀 Build & Upload

```bash
cd NamecardMobile

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store Connect
eas submit --platform ios --latest
```

**Wait:** 10-15 minutes for processing

---

## 🧪 TestFlight Testing

1. Add sandbox tester in App Store Connect
2. Install TestFlight on device
3. Download build
4. Sign in with sandbox Apple ID
5. Test subscription purchase
6. Verify 3-day free trial starts

**Note:** TestFlight subscriptions renew every 24 hours (2024 update)

---

## 🎯 First-Time Submission Rule

**If this is your FIRST in-app purchase for this app:**
- Must submit subscription WITH new app version
- Submit all subscriptions together
- Cannot submit subscription alone

**After first approval:**
- Can add new subscriptions without app updates

---

## 🔍 Common Issues & Fixes

### "Missing Metadata" Status
**Fix:**
- [ ] Add at least one localization
- [ ] Set pricing for at least one territory
- [ ] Verify developer agreements signed
- [ ] Add review screenshot

### Subscription Not Showing in TestFlight
**Fix:**
- [ ] Verify subscription is "Ready to Submit"
- [ ] Wait 10-15 minutes after status change
- [ ] Re-download TestFlight build

### Free Trial Not Working
**Fix:**
- [ ] Verify introductory offer is "Free" type (not pay as you go)
- [ ] Check duration is set to 3 days
- [ ] Ensure territories match subscription availability
- [ ] Confirm user hasn't used trial before (lifetime limit)

---

## 📱 Code Implementation Checklist

After App Store Connect setup:
- [ ] Add Product IDs to app config
- [ ] Implement StoreKit 2 product fetching
- [ ] Check free trial eligibility
- [ ] Handle purchase flow
- [ ] Verify subscription status
- [ ] Test with StoreKit Configuration File
- [ ] Test in TestFlight

---

## ⏱️ Timeline Estimate

- App Store Connect setup: **1-2 hours**
- Build time: **20-30 minutes**
- Upload & processing: **10-15 minutes**
- TestFlight testing: **1-2 days**
- App Review: **1-3 days**

**Total:** 3-5 days from start to App Store launch

---

## 🔗 Quick Links

- [App Store Connect](https://appstoreconnect.apple.com)
- [Create Sandbox Testers](https://appstoreconnect.apple.com/access/testers)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [StoreKit 2 Docs](https://developer.apple.com/documentation/storekit)

---

## 🎉 Success Criteria

You're ready to submit when:
- ✅ Both subscriptions in "Ready to Submit" state
- ✅ Free trials configured (3 days)
- ✅ Localization complete
- ✅ Paywall screenshot uploaded
- ✅ Build uploaded to TestFlight
- ✅ TestFlight testing successful
- ✅ No console errors in app

**Now submit for App Review!** 🚀
