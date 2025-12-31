# Chatbot Testing Guide

## 🚀 **Ready to Test!**

Your AI Chatbot is now integrated and ready to test! Here's how to get started.

---

## ✅ **Pre-Test Checklist**

1. **Supabase Database** ✅
   - `client_interactions` table created
   - RLS policies enabled
   - All migrations applied

2. **Services** ✅
   - `interactionService.ts` - Database operations
   - `chatbotAI.ts` - AI intelligence
   - `chatbotService.ts` - Main orchestration
   - `apiTokenService.ts` - API token management

3. **UI** ✅
   - `ChatbotScreen.tsx` - Chat interface
   - Integrated into App.tsx navigation
   - New "AI Assistant" tab

4. **TypeScript** ✅
   - All type errors fixed
   - `expo-crypto` installed
   - Type check passes

---

## 🧪 **Testing Steps**

### Step 1: Start the App

```bash
cd NamecardMobile
npm run start:clear
```

**When Expo dev server starts:**
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Or scan QR code with Expo Go app

---

### Step 2: Test Voice Recording

1. **Navigate to AI Assistant tab** (bottom navigation)
2. **Tap the microphone button** 🎤
3. **Grant microphone permission** (if prompted)
4. **Speak clearly:**
   ```
   "I met John Tan today at 2pm. We talked about car loans for 30 minutes.
   He's very interested in a 5-year term loan and wants to apply next month.
   I should follow up with him in 2 weeks to send the loan calculator."
   ```
5. **Tap Stop** ⏹️
6. **Wait for processing** (10-15 seconds)
7. **Check the response**:
   - Should confirm interaction was saved
   - Should show contact name, topic, interest level
   - Should show follow-up reminder date

**✅ Success Indicators:**
- Transcription appears correctly
- Contact "John Tan" is found in database
- Topic extracted as "car loans"
- Interest level is "high"
- Follow-up reminder set for 2 weeks from now

**❌ Possible Issues:**
- "I couldn't find a contact named..." → Create the contact first
- "Failed to transcribe audio" → Check OPENAI_API_KEY in `.env`
- "Voice processing failed" → Check microphone permissions

---

### Step 3: Test Text Input

1. **Type in the text box:**
   ```
   Met Sarah Lee at Starbucks, discussed home insurance.
   She's considering upgrading her policy. Follow up next week.
   ```
2. **Tap Send** ➤
3. **Wait for processing**
4. **Check the response**:
   - Should save interaction
   - Should identify contact "Sarah Lee"
   - Should set follow-up for next week

---

### Step 4: Test Suggestions

1. **Type:** `Who should I follow up with about loans?`
2. **Tap Send**
3. **Wait for AI processing**
4. **Expected response:**
   ```
   📊 Based on your interactions, here are 3 contacts highly interested in loans:

   **Recommended contacts:**
   1. John Tan (ABC Sdn Bhd)
   2. Ahmad Ibrahim (XYZ Corp)
   3. Sarah Lee (Tech Solutions)

   **Next steps:**
   1. Follow up with John Tan (due in 2 days)
   2. Send Ahmad the loan comparison sheet
   3. Schedule meeting with Sarah
   ```

---

### Step 5: Test Follow-ups

**Upcoming Follow-ups:**
1. **Tap quick action:** `📅 Follow-ups`
2. **Or type:** `Show my upcoming follow-ups`
3. **Expected response:**
   ```
   📅 You have 2 follow-ups in the next 7 days:

   **John Tan** - ABC Sdn Bhd
     📞 60123456789
     📝 Topic: car loans
     ⏰ Due: Jan 11, 2026 (14 days)
     📌 Notes: Send loan calculator
   ```

**Overdue Follow-ups:**
1. **Tap quick action:** `⚠️ Overdue`
2. **Or type:** `Show my overdue follow-ups`

---

### Step 6: Test Statistics

1. **Tap quick action:** `📊 Stats`
2. **Or type:** `Show my statistics`
3. **Expected response:**
   ```
   📊 **Your Interaction Statistics:**

   Total interactions: 2

   **By Topic:**
     • car loans: 1
     • home insurance: 1

   **By Interest Level:**
     🔥 high: 1
     👍 medium: 1

   **Follow-ups:**
     ✅ Completed: 0
     ⏳ Pending: 2
   ```

---

## 🐛 **Troubleshooting**

### Issue: "I couldn't find a contact named X"

**Cause:** Contact doesn't exist in your database

**Solution:**
1. Go to **Scan** tab
2. Add the contact manually or scan their business card
3. Go back to **AI Assistant** tab
4. Try recording the interaction again

---

### Issue: Voice transcription not working

**Cause:** OpenAI API key missing or invalid

**Check:**
```bash
# In NamecardMobile/.env
OPENAI_API_KEY=sk-proj-...
```

**Solution:**
1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env` file
3. Restart app with `npm run start:clear`

---

### Issue: "Failed to save interaction"

**Cause:** Database connection issue

**Check:**
1. Supabase URL and keys in `.env`
2. User is logged in (check Profile tab)
3. Check console for errors: `adb logcat | grep -i error`

**Solution:**
1. Verify Supabase credentials
2. Check RLS policies are enabled
3. Ensure `client_interactions` table exists

---

### Issue: AI suggestions not working

**Cause:** No interactions recorded yet

**Solution:**
1. Record at least 2-3 interactions first
2. Try suggestion query again

---

## 📊 **Database Verification**

Check if interactions are being saved:

**Using Supabase Dashboard:**
1. Open https://supabase.com
2. Go to your project
3. Navigate to **Table Editor**
4. Select `client_interactions` table
5. You should see your interactions listed

**Using MCP (via Claude Code):**
```sql
SELECT * FROM client_interactions ORDER BY created_at DESC LIMIT 10;
```

---

## 🎯 **Test Scenarios**

### Scenario 1: Loan Officer

```
Voice Input 1:
"Met John Tan today at 2pm. Discussed car loan options.
He wants RM200k for 5 years. Very interested. Follow up in 2 weeks."

Voice Input 2:
"Called Sarah Lee about home loan. She's thinking about it.
Call back next week."

Voice Input 3:
"Met Ahmad at coffee shop. Talked about personal loan.
Not interested right now."

Then ask:
"Who should I prioritize for loans?"

Expected: John Tan (high interest), Sarah Lee (medium), not Ahmad (low)
```

### Scenario 2: Insurance Agent

```
Voice Input 1:
"Met Priya Sharma at her office. Discussed life insurance.
She's ready to buy. Follow up tomorrow with quotes."

Voice Input 2:
"Met David Chen. Talked about car insurance. Maybe interested.
Follow up in 1 month."

Then ask:
"Show my follow-ups"

Expected: Priya (tomorrow), David (1 month from now)
```

---

## ✅ **Success Criteria**

You've successfully tested the chatbot if:

- ✅ Voice recording works and transcribes correctly
- ✅ Text input saves interactions to database
- ✅ AI correctly identifies contacts from your database
- ✅ Topics, interest levels, and sentiments are extracted
- ✅ Follow-up reminders are set correctly
- ✅ Suggestions query returns relevant contacts
- ✅ Follow-ups query shows upcoming and overdue items
- ✅ Statistics show interaction breakdown

---

## 📝 **Next Steps After Testing**

If everything works:
1. ✅ Test with real contacts from your database
2. ✅ Record 10+ interactions to see meaningful analytics
3. ✅ Test the API Token system (optional)
4. ✅ Share feedback on what works/doesn't work

If there are issues:
1. Check console logs: `npm run start:clear` and watch for errors
2. Verify environment variables in `.env`
3. Check Supabase database tables and RLS policies
4. Report specific error messages for debugging

---

## 🚀 **You're Ready!**

Start the app and test the chatbot:

```bash
cd NamecardMobile
npm run start:clear

# Press 'a' for Android or 'i' for iOS
# Navigate to "AI Assistant" tab
# Start testing!
```

**Happy testing! 🎉**
