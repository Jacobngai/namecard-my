/**
 * WhatsCard API Usage Examples
 *
 * This file demonstrates how to use the WhatsCard API with Personal Access Tokens (PAT)
 */

import { WhatsCardAPIClient } from '../services/apiClient';

/**
 * Example 1: Basic API Usage
 */
async function example1_basicUsage() {
  console.log('=== Example 1: Basic API Usage ===\n');

  // Initialize the API client with your token
  const apiToken = 'wc_abc123...'; // Replace with your actual token
  const client = new WhatsCardAPIClient(apiToken);

  // Authenticate (required before any API calls)
  const isAuthenticated = await client.authenticate();
  if (!isAuthenticated) {
    console.error('❌ Authentication failed');
    return;
  }

  console.log('✅ Authenticated successfully');
  console.log('Client info:', client.getClientInfo());

  // List all contacts
  const contacts = await client.contacts.list();
  console.log(`\n📋 Found ${contacts.length} contacts`);
  contacts.forEach((contact, index) => {
    console.log(`${index + 1}. ${contact.name} (${contact.company || 'No company'})`);
  });
}

/**
 * Example 2: Create and Manage Contacts
 */
async function example2_contactManagement() {
  console.log('\n=== Example 2: Contact Management ===\n');

  const apiToken = 'wc_abc123...';
  const client = new WhatsCardAPIClient(apiToken);
  await client.authenticate();

  // Create a new contact
  const newContact = await client.contacts.create({
    name: 'John Tan Wei Ming',
    company: 'ABC Sdn Bhd',
    job_title: 'CEO',
    phone: '60123456789',
    phones: {
      mobile1: '60123456789',
      office: '60312345678',
    },
    email: 'john.tan@abc.com',
    address: 'Kuala Lumpur, Malaysia',
    tags: ['client', 'loans', 'high-value'],
  });

  console.log('✅ Created contact:', newContact.name);
  console.log('Contact ID:', newContact.id);

  // Update the contact
  await client.contacts.update(newContact.id, {
    job_title: 'Managing Director',
  });

  console.log('✅ Updated contact job title');

  // Get the updated contact
  const updatedContact = await client.contacts.get(newContact.id);
  console.log('Updated contact:', updatedContact);

  // Delete the contact (optional)
  // await client.contacts.delete(newContact.id);
  // console.log('✅ Deleted contact');
}

/**
 * Example 3: Record Client Interactions
 */
async function example3_recordInteractions() {
  console.log('\n=== Example 3: Record Interactions ===\n');

  const apiToken = 'wc_abc123...';
  const client = new WhatsCardAPIClient(apiToken);
  await client.authenticate();

  // Get a contact
  const contacts = await client.contacts.list();
  if (contacts.length === 0) {
    console.log('No contacts found. Create one first!');
    return;
  }

  const contact = contacts[0];
  console.log(`Recording interaction with: ${contact.name}`);

  // Record a meeting
  const interaction = await client.interactions.create({
    contact_id: contact.id,
    interaction_date: new Date().toISOString(),
    interaction_type: 'meeting',
    topic: 'car loans',
    summary: 'Discussed car loan options. Client is very interested in a 5-year term loan.',
    interest_level: 'high',
    sentiment: 'positive',
    follow_up_required: true,
    follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    follow_up_notes: 'Send loan calculator and product brochure',
  });

  console.log('✅ Interaction recorded:', interaction.id);
  console.log('Summary:', interaction.summary);
}

/**
 * Example 4: Search and Filter Contacts
 */
async function example4_searchContacts() {
  console.log('\n=== Example 4: Search Contacts ===\n');

  const apiToken = 'wc_abc123...';
  const client = new WhatsCardAPIClient(apiToken);
  await client.authenticate();

  // Search contacts by keyword
  const searchResults = await client.contacts.list({
    search: 'John',
  });

  console.log(`📋 Found ${searchResults.length} contacts matching "John"`);

  // Filter contacts by tags
  const loanContacts = await client.contacts.list({
    tags: ['loans'],
  });

  console.log(`📋 Found ${loanContacts.length} contacts tagged with "loans"`);
}

/**
 * Example 5: Get Interaction History
 */
async function example5_interactionHistory() {
  console.log('\n=== Example 5: Interaction History ===\n');

  const apiToken = 'wc_abc123...';
  const client = new WhatsCardAPIClient(apiToken);
  await client.authenticate();

  // Get all interactions
  const allInteractions = await client.interactions.list();
  console.log(`📋 Total interactions: ${allInteractions.length}`);

  // Get interactions by topic
  const loanInteractions = await client.interactions.list({
    topic: 'car loans',
  });

  console.log(`📋 Car loan interactions: ${loanInteractions.length}`);

  // Get interactions for a specific contact
  if (allInteractions.length > 0) {
    const contactId = allInteractions[0].contact_id;
    const contactInteractions = await client.interactions.list({
      contact_id: contactId,
    });

    console.log(`📋 Interactions for contact ${contactId}: ${contactInteractions.length}`);
    contactInteractions.forEach((interaction, index) => {
      console.log(`${index + 1}. ${interaction.topic} - ${new Date(interaction.interaction_date).toLocaleDateString()}`);
      console.log(`   ${interaction.summary}`);
    });
  }
}

/**
 * Example 6: Automation Script
 * Daily follow-up reminder automation
 */
async function example6_dailyFollowupReminder() {
  console.log('\n=== Example 6: Daily Follow-up Reminder ===\n');

  const apiToken = 'wc_abc123...';
  const client = new WhatsCardAPIClient(apiToken);
  await client.authenticate();

  // Get all interactions that require follow-up
  const interactions = await client.interactions.list();

  const today = new Date();
  const upcomingFollowups = interactions.filter(interaction => {
    if (!interaction.follow_up_required || !interaction.follow_up_date) {
      return false;
    }

    const followUpDate = new Date(interaction.follow_up_date);
    const daysDiff = Math.floor((followUpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Follow-ups due in the next 3 days
    return daysDiff >= 0 && daysDiff <= 3;
  });

  console.log(`📅 Upcoming follow-ups (next 3 days): ${upcomingFollowups.length}`);

  for (const interaction of upcomingFollowups) {
    // Get contact details
    const contact = await client.contacts.get(interaction.contact_id);

    console.log(`\n⏰ Follow-up due: ${new Date(interaction.follow_up_date!).toLocaleDateString()}`);
    console.log(`   Contact: ${contact.name} (${contact.company || 'No company'})`);
    console.log(`   Topic: ${interaction.topic}`);
    console.log(`   Notes: ${interaction.follow_up_notes || 'No notes'}`);
    console.log(`   Phone: ${contact.phone}`);

    // You could send a WhatsApp message or email here
    console.log(`   📱 WhatsApp: https://wa.me/${contact.phone}`);
  }
}

/**
 * Example 7: Error Handling
 */
async function example7_errorHandling() {
  console.log('\n=== Example 7: Error Handling ===\n');

  const apiToken = 'wc_invalid_token_123';
  const client = new WhatsCardAPIClient(apiToken);

  try {
    const isAuthenticated = await client.authenticate();
    if (!isAuthenticated) {
      console.error('❌ Authentication failed - Invalid token');
      return;
    }

    // This won't execute if authentication fails
    await client.contacts.list();
  } catch (error) {
    console.error('❌ API Error:', error);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    await example1_basicUsage();
    await example2_contactManagement();
    await example3_recordInteractions();
    await example4_searchContacts();
    await example5_interactionHistory();
    await example6_dailyFollowupReminder();
    await example7_errorHandling();
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export examples for use in documentation
export {
  example1_basicUsage,
  example2_contactManagement,
  example3_recordInteractions,
  example4_searchContacts,
  example5_interactionHistory,
  example6_dailyFollowupReminder,
  example7_errorHandling,
  runAllExamples,
};

/**
 * Python Example (for external automation)
 *
 * ```python
 * import requests
 *
 * API_TOKEN = "wc_abc123..."
 * BASE_URL = "https://your-api-endpoint.com/v1"
 *
 * # List contacts
 * response = requests.get(
 *     f"{BASE_URL}/contacts",
 *     headers={"Authorization": f"Bearer {API_TOKEN}"}
 * )
 * contacts = response.json()
 * print(f"Found {len(contacts)} contacts")
 *
 * # Create interaction
 * requests.post(
 *     f"{BASE_URL}/interactions",
 *     headers={"Authorization": f"Bearer {API_TOKEN}"},
 *     json={
 *         "contact_id": "contact-id-here",
 *         "interaction_date": "2025-12-28T14:00:00Z",
 *         "topic": "loans",
 *         "summary": "Discussed loan options"
 *     }
 * )
 * ```
 */
