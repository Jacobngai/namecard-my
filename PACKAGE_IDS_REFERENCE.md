# 📦 WHATSCARD - PACKAGE IDS REFERENCE

**🔒 THESE ARE PERMANENTLY LOCKED - NEVER CHANGE! 🔒**

---

## 🍎 **iOS / APP STORE**

```
Bundle ID:        com.alittlebetter.better
App ID:           6754809694
Apple ID:         ngsanzen@gmail.com
Team ID:          3WHF9353VV
Subscription Group: Premium Access (21821977)
```

**App Store Connect:**
https://appstoreconnect.apple.com/apps/6754809694

**Subscription Products:**
- `monthly_premium_subscription` (Apple ID: 6754809579)
- `yearly_premium_subscription` (Apple ID: 6754809873)

---

## 🤖 **ANDROID / GOOGLE PLAY**

```
Package Name:     com.whatscard.app
Developer Account: Drinking Monster (6055773806895794556)
Service Fee:      15% (reduced)
```

**Google Play Console:**
https://play.google.com/console → WHATSCARD

**Subscription Products:**
- `monthly_premium_subscription`
- `yearly_premium_subscription`

**Keystore (CRITICAL):**
```
SHA-1: BD:10:12:2C:87:05:7A:45:3F:6E:F1:2F:51:EB:FB:84:28:0B:77:5F
Alias: c90c9e3fc4759b4ccac8f5f02db96e87
```

**Keystore Location:**
- Stored in: Expo Dashboard → com.whatscard.app ✅ CORRECT PACKAGE
- Set as default in Expo dashboard
- Always use remote credentials (EAS will use correct keystore automatically)

**Keystore Backup:**
```
C:\Users\walte\Documents\WhatsCard\Keystores\whatscard-production.jks
```

---

## 🌐 **WEBSITE / URLS**

```
Domain:           whatscard.app
Privacy Policy:   https://whatscard.app/privacy-policy
Terms:            https://whatscard.app/terms
Delete Account:   https://whatscard.app/delete-account
Support Email:    support@whatscard.app
```

**Temporary Vercel URLs (until DNS configured):**
```
https://whatscard-website-jp8abmosm-ngsanzen-gmailcoms-projects.vercel.app/privacy-policy
https://whatscard-website-jp8abmosm-ngsanzen-gmailcoms-projects.vercel.app/terms
https://whatscard-website-jp8abmosm-ngsanzen-gmailcoms-projects.vercel.app/delete-account
```

---

## ⚠️ **WHAT WENT WRONG (History)**

### **The Confusion:**

1. **Created app as:** `com.whatscard.app`
   - Keystore created for this package
   - Uploaded to Google Play

2. **Temporarily had wrong package in code:** `com.resultmarketing.whatscard`
   - This was a mistake
   - EAS couldn't find keystore → created wrong one

3. **Fixed back to:** `com.whatscard.app` ✅
   - Code now matches Google Play
   - Keystore matches
   - Everything aligned

### **The Fix:**

✅ Changed app.json back to: com.whatscard.app
✅ Keystore is in correct Expo package: com.whatscard.app
✅ Google Play expects: com.whatscard.app
✅ Everything matches now!

---

## 🎯 **CORRECT CONFIGURATION (FINAL)**

### **app.json (Current - CORRECT):**
```json
{
  "ios": {
    "bundleIdentifier": "com.alittlebetter.better"  ✅ CORRECT for App Store
  },
  "android": {
    "package": "com.resultmarketing.whatscard"      ✅ CORRECT for Google Play
  }
}
```

### **What to Remember:**

**iOS:**
- Always use: `com.alittlebetter.better`
- Never change it
- This is in App Store Connect as: "Better" app

**Android:**
- Always use: `com.resultmarketing.whatscard`
- Never change it
- This is in Google Play as: "WHATSCARD" app
- Keystore: Download from Expo (com.whatscard.app) and use locally

---

## 🛠️ **HOW TO BUILD (Going Forward)**

### **Android (Google Play):**
```bash
cd NamecardMobile

# Build with remote credentials (EAS manages keystore):
npx eas-cli build --platform android --profile production --non-interactive --no-wait

# Keystore SHA-1 BD:10:12... will be used automatically
# Package com.whatscard.app matches Google Play ✅
```

### **iOS (App Store):**
```bash
cd NamecardMobile

# Build (will use remote credentials automatically):
npx eas-cli build --platform ios --profile production

# Apple ID login when prompted:
# Email: ngsanzen@gmail.com
# Password: [Your Apple password]
```

---

## 📋 **PRE-BUILD CHECKLIST**

**BEFORE every build, verify:**

### **Check app.json:**
```bash
# iOS should show:
grep "bundleIdentifier" app.json
# Output: "bundleIdentifier": "com.alittlebetter.better"

# Android should show:
grep "package" app.json
# Output: "package": "com.whatscard.app"
```

### **Check Keystore:**
```bash
# Verify file exists:
ls C:\Users\walte\Desktop\whatscard.jks
# Should show file (not error)
```

### **Check Expo Dashboard:**
- Go to: https://expo.dev/accounts/jacobai/projects/namecard-my/credentials
- iOS: Should show com.alittlebetter.better
- Android: Keystore in com.whatscard.app (use locally)

---

## 🔑 **NEVER LOSE THESE**

**Android Keystore:**
- Primary: `C:\Users\walte\Desktop\whatscard.jks`
- Backup: `C:\Users\walte\Documents\WhatsCard\Keystores\whatscard-production.jks`
- Cloud backup: Upload to Google Drive (encrypted folder)

**Passwords:**
- Save in password manager (1Password, LastPass, Bitwarden)
- Never commit to git
- Never share publicly

**If lost:** You CANNOT update your app on Google Play EVER again!

---

**🔒 TREAT YOUR KEYSTORE LIKE YOUR BANK PASSWORD! 🔒**
