# WhatsCard AI Chatbot Guide

## 📖 Overview

The WhatsCard AI Chatbot is your intelligent assistant for managing client interactions, recording meetings, tracking follow-ups, and getting AI-powered insights.

## 🎯 Key Features

### 1. **Voice-Enabled Interaction Recording**
- 🎤 Record interactions using voice
- 📝 Automatic transcription with OpenAI Whisper
- 🧠 AI extraction of structured data (topic, sentiment, interest level)
- 💾 Automatic database storage

### 2. **Smart Data Extraction**
The chatbot uses GPT-4 to automatically extract:
- **Contact name** - Who you met with
- **Date & time** - When the interaction happened
- **Topic** - What you discussed (loans, insurance, etc.)
- **Summary** - Brief description of the conversation
- **Keywords** - Relevant tags
- **Interest level** - High, medium, or low
- **Sentiment** - Positive, neutral, or negative
- **Follow-up** - Whether follow-up is needed and when

### 3. **AI-Powered Insights**
- 📊 Get contact suggestions based on topic
- 📅 View upcoming follow-ups
- ⚠️ Track overdue follow-ups
- 📈 Analyze interaction statistics

## 🚀 How to Use

### Recording an Interaction (Voice)

1. **Tap the microphone button** 🎤
2. **Speak naturally**:
   ```
   "I met John Tan today at 2pm. We discussed car loans for about 30 minutes. He's very interested in a 5-year term loan and wants to apply next month. Follow up with him in 2 weeks to send the loan calculator."
   ```
3. **Tap Stop** when done
4. **Wait for AI processing**

**What happens:**
- Voice is transcribed to text
- AI extracts: Contact (John Tan), Topic (car loans), Interest (high), Follow-up (2 weeks)
- Data is saved to database
- You get a confirmation message

### Recording an Interaction (Text)

1. **Type in the text box**:
   ```
   Met Sarah Lee at 1pm, talked about home insurance. She's considering upgrading her policy. Follow up in 1 week.
   ```
2. **Tap Send** ➤
3. **AI processes and saves the interaction**

### Getting Suggestions

Ask the chatbot:
```
"Who should I follow up with about loans?"
"Show me contacts interested in insurance"
"Who are my high-value clients?"
```

**Response:**
```
📊 Based on your interactions, here are 3 contacts highly interested in loans:

**Recommended contacts:**
1. John Tan (ABC Sdn Bhd)
2. Sarah Lee (XYZ Holdings)
3. Ahmad Ibrahim (Tech Solutions)

**Next steps:**
1. Contact John Tan - follow-up overdue by 2 days
2. Send Sarah Lee the loan calculator
3. Schedule meeting with Ahmad Ibrahim
```

### Viewing Follow-ups

**Upcoming follow-ups:**
```
"Show my upcoming follow-ups"
"What follow-ups do I have this week?"
```

**Overdue follow-ups:**
```
"Show my overdue follow-ups"
"Who am I late to contact?"
```

**Response:**
```
📅 You have 3 follow-ups in the next 7 days:

**John Tan** - ABC Sdn Bhd
  📞 60123456789
  📝 Topic: car loans
  ⏰ Due: Dec 30, 2025 (2 days)
  📌 Notes: Send loan calculator

**Sarah Lee** - XYZ Holdings
  📞 60187654321
  📝 Topic: home insurance
  ⏰ Due: Jan 2, 2026 (5 days)
  📌 Notes: Follow up on policy upgrade
```

### Viewing Statistics

Ask:
```
"Show my statistics"
"What are my interaction stats?"
"Give me analytics"
```

**Response:**
```
📊 **Your Interaction Statistics:**

Total interactions: 45

**By Topic:**
  • loans: 18
  • insurance: 12
  • investments: 8
  • others: 7

**By Interest Level:**
  🔥 high: 15
  👍 medium: 22
  😐 low: 8

**Follow-ups:**
  ✅ Completed: 32
  ⏳ Pending: 13
```

## 💡 Example Use Cases

### Use Case 1: After a Client Meeting

**You (voice):**
```
"Just finished meeting with John Tan at his office.
We spent an hour discussing car loan options.
He's very interested in a 5-year term with RM200k amount.
He'll decide by next month. I need to follow up in 2 weeks
to send him the updated interest rates and loan calculator."
```

**Chatbot Response:**
```
✅ **Interaction Recorded!**

I've saved your interaction with **John Tan** about **car loans**.

🔥 Great! They seem highly interested.

📅 I've set a follow-up reminder for **January 11, 2026**.
📝 Note: Send updated interest rates and loan calculator
```

**What got saved in database:**
- Contact: John Tan
- Date: Dec 28, 2025, 2:00 PM
- Topic: car loans
- Interest level: High
- Sentiment: Positive
- Follow-up: Jan 11, 2026
- Keywords: [car, loan, 5-year, RM200k]

### Use Case 2: Quick Note After Phone Call

**You (text):**
```
Called Sarah Lee about home insurance.
She's thinking about it. Follow up next week.
```

**Chatbot Response:**
```
✅ **Interaction Recorded!**

I've saved your interaction with **Sarah Lee** about **home insurance**.

👍 They seem moderately interested.

📅 I've set a follow-up reminder for **January 4, 2026**.
```

### Use Case 3: Finding Hot Leads

**You:**
```
Who should I prioritize for car loans?
```

**Chatbot:**
```
📊 Based on your interactions, I found 3 highly interested contacts for car loans:

**Recommended contacts:**
1. John Tan (ABC Sdn Bhd) - Met Dec 28, very interested
2. Ahmad Ibrahim (Tech Solutions) - Met Dec 20, asked for quotes
3. Priya Sharma (Finance Group) - Met Dec 15, ready to apply

**Next steps:**
1. Follow up with John Tan (due in 2 days)
2. Send Ahmad the loan comparison sheet
3. Schedule application walkthrough with Priya
```

## 🔍 Chatbot Intelligence

### How It Understands Your Input

The chatbot uses GPT-4 with specialized prompts to:

1. **Identify the contact** from your saved contacts
2. **Extract the date/time** (supports "today", "yesterday", "2pm", etc.)
3. **Determine the topic** from keywords (loans, insurance, etc.)
4. **Assess interest level** from language cues:
   - "very interested", "ready to buy" → High
   - "thinking about it", "maybe" → Medium
   - "not sure", "need time" → Low
5. **Detect sentiment** from tone:
   - Positive language → Positive
   - Neutral language → Neutral
   - Hesitant/negative language → Negative
6. **Infer follow-up needs** from phrases like:
   - "follow up in 2 weeks" → Sets reminder
   - "call back next month" → Sets reminder
   - "send information" → Creates follow-up note

### Supported Date Formats

The chatbot understands natural language dates:
- "today" → Current date
- "yesterday" → Previous day
- "at 2pm" → Today at 2:00 PM
- "tomorrow at 10am" → Tomorrow at 10:00 AM
- "next Monday" → Upcoming Monday
- "in 2 weeks" → 14 days from now
- "next month" → Same day next month

## 📊 Database Schema

All interactions are stored in the `client_interactions` table:

```sql
{
  id: "uuid",
  user_id: "uuid",
  contact_id: "uuid",
  interaction_date: "2025-12-28T14:00:00Z",
  interaction_type: "meeting" | "call" | "email" | "whatsapp",
  topic: "car loans",
  summary: "Discussed 5-year term loan options",
  transcription: "Full voice transcription...",
  keywords: ["car", "loan", "5-year"],
  interest_level: "high" | "medium" | "low",
  sentiment: "positive" | "neutral" | "negative",
  follow_up_required: true,
  follow_up_date: "2026-01-11T00:00:00Z",
  follow_up_notes: "Send loan calculator",
  voice_recording_url: "storage/recordings/...",
  created_at: "2025-12-28T14:05:00Z"
}
```

## 🎙️ Voice Recording Tips

### For Best Results:

1. **Speak clearly** and at a normal pace
2. **Minimize background noise**
3. **Mention the contact name** explicitly
4. **Include the date/time** if not today
5. **Be specific** about topics and next steps

### Good Example:
```
"Met John Tan at Starbucks today at 2pm. We talked about
car loans for 30 minutes. He's interested in a 5-year
RM200k loan. Very positive meeting. Follow up in 2 weeks
to send the calculator."
```

### Bad Example:
```
"Uh... so I met him... we talked about stuff...
yeah he might be interested... I guess follow up sometime."
```

## 🔐 Privacy & Security

- ✅ All voice recordings are stored securely
- ✅ Transcriptions are encrypted
- ✅ Only you can access your interaction data (RLS policies)
- ✅ No data is shared with third parties
- ✅ You can delete any interaction anytime

## ⚙️ Quick Actions

Use the quick action buttons for common tasks:

- **📅 Follow-ups** - Show upcoming follow-ups
- **⚠️ Overdue** - Show overdue follow-ups
- **📊 Stats** - View interaction statistics
- **🔍 Suggestions** - Get AI-powered contact suggestions

## 🛠️ Troubleshooting

### "I couldn't find a contact named..."

**Problem**: Contact doesn't exist in your database

**Solution**: Add the contact first in your Contacts screen, then record the interaction

### Voice recording not working

**Problem**: Microphone permission not granted

**Solution**:
1. Go to Settings → Apps → WhatsCard
2. Enable Microphone permission
3. Restart the app

### AI extracted wrong information

**Problem**: Speech was unclear or ambiguous

**Solution**:
- Speak more clearly
- Use text input instead
- Manually edit the interaction after saving

### Follow-up reminder not showing

**Problem**: Follow-up date is too far in the future

**Solution**: Check the "Upcoming follow-ups" with a longer timeframe (e.g., 30 days)

## 💰 Costs

The chatbot uses OpenAI APIs:

- **Whisper transcription**: ~$0.006 per minute
- **GPT-4 analysis**: ~$0.02 per interaction

**Estimated cost**: $0.03 per voice interaction

For 100 interactions/month: ~$3/month

## 📈 Future Enhancements

Coming soon:
- [ ] Multi-language support
- [ ] Export interactions to PDF
- [ ] Integration with calendar apps
- [ ] WhatsApp message automation
- [ ] Sentiment trend analysis
- [ ] Predictive lead scoring

---

**Last Updated**: December 28, 2025
**Version**: 1.0.0
