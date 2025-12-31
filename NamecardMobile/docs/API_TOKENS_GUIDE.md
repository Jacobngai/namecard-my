# WhatsCard API Tokens Guide

## 📖 Overview

WhatsCard API Tokens (Personal Access Tokens / PAT) allow you to programmatically access and manage your WhatsCard data. This enables automation, integrations with other tools, and custom workflows.

## 🔑 What are API Tokens?

API tokens are secure credentials that grant programmatic access to your WhatsCard account without requiring a username and password. They work similarly to:
- GitHub Personal Access Tokens
- OpenAI API Keys
- Stripe API Keys

## 🎯 Use Cases

### 1. **Automation Scripts**
- Daily follow-up reminders
- Auto-sync contacts to external CRM
- Batch contact updates
- Automated reporting

### 2. **Integrations**
- Zapier workflows
- Make.com (Integromat) scenarios
- Custom webhooks
- Third-party apps

### 3. **Analytics**
- Export data for analysis
- Generate custom reports
- Track interaction metrics
- Monitor follow-up completion rates

### 4. **Backup & Migration**
- Automated daily backups
- Data export to other systems
- Cross-platform synchronization

## 🚀 Getting Started

### Step 1: Create an API Token

1. Open WhatsCard app
2. Go to **Settings** → **API Tokens**
3. Tap **"Create New Token"**
4. Enter a descriptive name (e.g., "My Automation Script")
5. Copy the generated token immediately

⚠️ **Important**: The token is only shown ONCE. Save it securely!

### Step 2: Use the Token

```typescript
import { WhatsCardAPIClient } from './services/apiClient';

// Initialize the client with your token
const client = new WhatsCardAPIClient('wc_abc123...');

// Authenticate
await client.authenticate();

// Use the API
const contacts = await client.contacts.list();
console.log(contacts);
```

## 📚 API Reference

### Authentication

```typescript
const client = new WhatsCardAPIClient('YOUR_TOKEN_HERE');
const isAuth = await client.authenticate();

if (!isAuth) {
  console.error('Authentication failed');
}
```

### Contacts API

#### List Contacts
```typescript
// Get all contacts
const contacts = await client.contacts.list();

// Search by keyword
const results = await client.contacts.list({
  search: 'John'
});

// Filter by tags
const loanContacts = await client.contacts.list({
  tags: ['loans', 'high-value']
});
```

#### Get a Contact
```typescript
const contact = await client.contacts.get('contact-id');
console.log(contact.name, contact.phone);
```

#### Create a Contact
```typescript
const newContact = await client.contacts.create({
  name: 'John Tan',
  company: 'ABC Sdn Bhd',
  job_title: 'CEO',
  phone: '60123456789',
  phones: {
    mobile1: '60123456789',
    office: '60312345678'
  },
  email: 'john@abc.com',
  address: 'Kuala Lumpur, Malaysia',
  tags: ['client', 'loans']
});
```

#### Update a Contact
```typescript
await client.contacts.update('contact-id', {
  job_title: 'Managing Director',
  tags: ['client', 'loans', 'vip']
});
```

#### Delete a Contact
```typescript
await client.contacts.delete('contact-id');
```

### Interactions API

#### List Interactions
```typescript
// Get all interactions
const interactions = await client.interactions.list();

// Get interactions for a contact
const contactInteractions = await client.interactions.list({
  contact_id: 'contact-id'
});

// Get interactions by topic
const loanInteractions = await client.interactions.list({
  topic: 'loans'
});
```

#### Create an Interaction
```typescript
await client.interactions.create({
  contact_id: 'contact-id',
  interaction_date: new Date().toISOString(),
  interaction_type: 'meeting',
  topic: 'car loans',
  summary: 'Discussed 5-year term loan options',
  interest_level: 'high',
  sentiment: 'positive',
  follow_up_required: true,
  follow_up_date: '2026-01-05T10:00:00Z',
  follow_up_notes: 'Send loan calculator'
});
```

## 🔐 Security Best Practices

### 1. **Keep Tokens Secret**
- Never commit tokens to Git repositories
- Don't share tokens in screenshots or logs
- Store tokens in environment variables

```bash
# .env file
WHATSCARD_API_TOKEN=wc_abc123...
```

### 2. **Use Specific Scopes**
Each token has limited permissions (scopes):
- `read:contacts` - Read contact data
- `write:contacts` - Create/update/delete contacts
- `read:interactions` - Read interaction history
- `write:interactions` - Create/update/delete interactions

### 3. **Rotate Tokens Regularly**
- Create new tokens periodically
- Revoke old/unused tokens
- Never reuse revoked tokens

### 4. **Monitor Usage**
Check token usage in the app:
- **Last Used**: When the token was last active
- **Usage Count**: Number of API calls made
- **Status**: Active/Inactive

### 5. **Revoke Compromised Tokens**
If a token is leaked:
1. Immediately revoke it in the app
2. Create a new token
3. Update your scripts with the new token

## 📝 Practical Examples

### Example 1: Daily Follow-up Reminder

```typescript
// daily-reminders.ts
import { WhatsCardAPIClient } from './services/apiClient';

async function sendDailyReminders() {
  const client = new WhatsCardAPIClient(process.env.WHATSCARD_API_TOKEN!);
  await client.authenticate();

  const interactions = await client.interactions.list();
  const today = new Date();

  // Find follow-ups due today
  const dueToday = interactions.filter(i => {
    if (!i.follow_up_required || !i.follow_up_date) return false;
    const dueDate = new Date(i.follow_up_date);
    return dueDate.toDateString() === today.toDateString();
  });

  console.log(`📅 ${dueToday.length} follow-ups due today:`);

  for (const interaction of dueToday) {
    const contact = await client.contacts.get(interaction.contact_id);
    console.log(`- ${contact.name}: ${interaction.follow_up_notes}`);

    // Send notification (email, SMS, etc.)
    // sendNotification(contact, interaction);
  }
}

// Run daily via cron job
sendDailyReminders();
```

### Example 2: Export Contacts to CSV

```typescript
// export-contacts.ts
import { WhatsCardAPIClient } from './services/apiClient';
import * as fs from 'fs';

async function exportToCSV() {
  const client = new WhatsCardAPIClient(process.env.WHATSCARD_API_TOKEN!);
  await client.authenticate();

  const contacts = await client.contacts.list();

  const csv = [
    'Name,Company,Phone,Email,Job Title',
    ...contacts.map(c =>
      `"${c.name}","${c.company || ''}","${c.phone}","${c.email || ''}","${c.job_title || ''}"`
    )
  ].join('\n');

  fs.writeFileSync('contacts.csv', csv);
  console.log(`✅ Exported ${contacts.length} contacts to contacts.csv`);
}

exportToCSV();
```

### Example 3: Sync to External CRM

```typescript
// sync-to-crm.ts
import { WhatsCardAPIClient } from './services/apiClient';
import axios from 'axios';

async function syncToCRM() {
  const client = new WhatsCardAPIClient(process.env.WHATSCARD_API_TOKEN!);
  await client.authenticate();

  const contacts = await client.contacts.list();

  for (const contact of contacts) {
    // Push to external CRM
    await axios.post('https://your-crm.com/api/contacts', {
      name: contact.name,
      company: contact.company,
      phone: contact.phone,
      email: contact.email,
      source: 'WhatsCard'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.CRM_API_KEY}`
      }
    });

    console.log(`✅ Synced: ${contact.name}`);
  }
}

syncToCRM();
```

### Example 4: Python Integration

```python
# whatscard_automation.py
import requests
import os
from datetime import datetime, timedelta

API_TOKEN = os.getenv('WHATSCARD_API_TOKEN')
BASE_URL = 'https://your-api-endpoint.com/v1'

headers = {'Authorization': f'Bearer {API_TOKEN}'}

# List contacts
response = requests.get(f'{BASE_URL}/contacts', headers=headers)
contacts = response.json()
print(f'Found {len(contacts)} contacts')

# Create interaction
interaction = {
    'contact_id': contacts[0]['id'],
    'interaction_date': datetime.now().isoformat(),
    'topic': 'loans',
    'summary': 'Follow-up call completed',
    'interest_level': 'high'
}

response = requests.post(
    f'{BASE_URL}/interactions',
    headers=headers,
    json=interaction
)

print('✅ Interaction recorded')
```

## 🛠️ Token Management

### View Token Details
- **Token Name**: Descriptive name you gave it
- **Token Prefix**: First 11 characters (e.g., `wc_abc12345`)
- **Created**: When the token was generated
- **Last Used**: Most recent API call
- **Usage Count**: Total number of API requests
- **Scopes**: Permissions granted to the token
- **Status**: Active or Inactive

### Revoke a Token
1. Go to **Settings** → **API Tokens**
2. Find the token to revoke
3. Tap **"Revoke"**
4. Confirm the action

⚠️ **Warning**: Revoking a token immediately stops all apps using it.

### Delete a Token
Inactive tokens can be permanently deleted:
1. Revoke the token first
2. Tap **"Delete"**
3. Confirm deletion

## ❓ FAQ

### Q: How many tokens can I create?
A: Unlimited. Create separate tokens for each automation or integration.

### Q: Can I see my token after creation?
A: No. Tokens are only shown once at creation. If you lose it, revoke and create a new one.

### Q: What happens if my token is leaked?
A: Immediately revoke it in the app and create a new token.

### Q: Do tokens expire?
A: By default, no. You can optionally set an expiration date when creating a token.

### Q: Can I limit token permissions?
A: Yes, through scopes. Currently supports:
- `read:contacts`, `write:contacts`
- `read:interactions`, `write:interactions`

### Q: How is my data protected?
A:
- Tokens are hashed (SHA-256) before storage
- Row Level Security (RLS) ensures you only access your data
- Tokens can be revoked instantly
- All API calls are logged with usage tracking

## 🔧 Troubleshooting

### "Authentication failed"
- Check that your token is correct
- Ensure the token hasn't been revoked
- Verify the token hasn't expired

### "Missing required scope"
- Your token doesn't have permission for that action
- Create a new token with the required scopes

### "Failed to create contact"
- Check that required fields are provided
- Ensure data format is correct (e.g., valid email)

### Rate Limiting
- Current limit: None
- Future: May implement rate limits for fair usage

## 📞 Support

Need help with API tokens?
- Check examples in `examples/api-usage-example.ts`
- Review the API client code in `services/apiClient.ts`
- Contact support: support@whatscard.com

## 🗺️ Roadmap

Future enhancements:
- [ ] Webhook support
- [ ] GraphQL API
- [ ] Bulk operations API
- [ ] Real-time subscriptions
- [ ] API usage analytics dashboard
- [ ] OAuth 2.0 support for third-party apps

---

**Last Updated**: December 28, 2025
**Version**: 1.0.0
