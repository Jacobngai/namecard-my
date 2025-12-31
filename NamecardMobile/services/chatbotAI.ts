import Config from '../config/environment';
import { Contact } from '../types';

/**
 * ChatbotAI Service
 * Uses OpenAI GPT to extract structured data from user voice/text input
 * Provides intelligent analysis and suggestions
 */

interface ExtractedInteractionData {
  contactName: string;
  contactId?: string; // Found in database
  date: string;
  time?: string;
  topic: string;
  summary: string;
  keywords: string[];
  interestLevel: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'neutral' | 'negative';
  followUpRequired: boolean;
  followUpDate?: string;
  followUpNotes?: string;
}

interface SuggestionResult {
  contacts: Contact[];
  reasoning: string;
  nextSteps: string[];
}

export class ChatbotAI {
  private static readonly GPT_API_URL = 'https://api.openai.com/v1/chat/completions';
  private static readonly GPT_MODEL = 'gpt-4o-mini'; // Fast and cost-effective

  /**
   * Extract structured interaction data from user input
   *
   * Example input: "I met John Tan today at 2pm, we talked about car loans. He's very interested and wants to apply next month."
   *
   * Output: {
   *   contactName: "John Tan",
   *   date: "2025-12-28T14:00:00Z",
   *   topic: "car loans",
   *   summary: "Discussed car loan options. Client is very interested.",
   *   keywords: ["car", "loans", "interested"],
   *   interestLevel: "high",
   *   sentiment: "positive",
   *   followUpRequired: true,
   *   followUpDate: "2026-01-28T00:00:00Z",
   *   followUpNotes: "Send loan application and follow up"
   * }
   */
  static async extractInteractionData(
    input: string,
    userId: string,
    userContacts: Contact[]
  ): Promise<ExtractedInteractionData> {
    try {
      if (!Config.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const contactNames = userContacts.map(c => c.name).join(', ');
      const currentDate = new Date().toISOString();

      const prompt = `You are an AI assistant that extracts structured data from user descriptions of business interactions.

Current date and time: ${currentDate}

User's contacts: ${contactNames}

User input: "${input}"

Extract and return ONLY a JSON object with this exact structure:

{
  "contactName": "exact name mentioned (must match one from user's contacts)",
  "date": "ISO 8601 datetime of the interaction",
  "time": "time mentioned if any (HH:MM format)",
  "topic": "main topic discussed (e.g., loans, insurance, investments)",
  "summary": "brief summary of the interaction (1-2 sentences)",
  "keywords": ["array", "of", "relevant", "keywords"],
  "interestLevel": "high|medium|low based on language used",
  "sentiment": "positive|neutral|negative based on tone",
  "followUpRequired": true|false,
  "followUpDate": "ISO 8601 datetime when to follow up (or null)",
  "followUpNotes": "what to do in follow-up (or null)"
}

Rules:
1. contactName MUST match one of the user's contacts exactly
2. If date is "today", use current date
3. If time is mentioned, include it in the date field
4. Infer interest level from words like "very interested", "maybe", "not sure"
5. Infer sentiment from positive/negative language
6. Infer follow-up from phrases like "next month", "call back", "send information"
7. Convert relative dates ("next month", "in 2 weeks") to actual dates
8. Keywords should be business-relevant (avoid filler words)

Return ONLY valid JSON, no markdown, no explanations.`;

      const response = await fetch(this.GPT_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.GPT_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a precise data extraction AI. Return only valid JSON.'
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.1, // Low temperature for consistent extraction
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GPT API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('No content in GPT response');
      }

      // Parse JSON response
      try {
        const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const extracted: ExtractedInteractionData = JSON.parse(cleanJson);

        // Find matching contact
        const matchingContact = userContacts.find(
          c => c.name.toLowerCase() === extracted.contactName.toLowerCase()
        );

        if (matchingContact) {
          extracted.contactId = matchingContact.id;
        }

        console.log('✅ Extracted interaction data:', extracted);
        return extracted;
      } catch (parseError) {
        console.error('⚠️ Failed to parse GPT response:', content);
        throw new Error('Failed to parse extracted data');
      }
    } catch (error) {
      console.error('❌ Extract interaction data failed:', error);
      throw error;
    }
  }

  /**
   * Generate AI suggestions based on user query and database
   *
   * Example: "Who should I follow up with about loans?"
   *
   * Returns contacts that match the criteria with reasoning
   */
  static async generateSuggestions(
    userId: string,
    query: string,
    contacts: Contact[],
    interactions: any[]
  ): Promise<SuggestionResult> {
    try {
      if (!Config.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const contactsData = JSON.stringify(
        contacts.map(c => ({
          id: c.id,
          name: c.name,
          company: c.company,
          phone: c.phone,
          groupIds: c.groupIds,
        })),
        null,
        2
      );

      const interactionsData = JSON.stringify(
        interactions.map(i => ({
          contact_id: i.contact_id,
          topic: i.topic,
          interest_level: i.interest_level,
          sentiment: i.sentiment,
          follow_up_required: i.follow_up_required,
          follow_up_date: i.follow_up_date,
          interaction_date: i.interaction_date,
        })),
        null,
        2
      );

      const prompt = `You are an AI business assistant analyzing user data to provide recommendations.

User query: "${query}"

Contacts:
${contactsData}

Interactions:
${interactionsData}

Analyze the data and return ONLY a JSON object with this structure:

{
  "contactIds": ["array", "of", "contact", "ids", "that", "match"],
  "reasoning": "brief explanation of why these contacts were selected",
  "nextSteps": ["array", "of", "recommended", "actions"]
}

Rules:
1. Match contacts based on interaction history, interest level, and sentiment
2. Prioritize high interest level and positive sentiment
3. Consider follow-up dates (overdue or upcoming)
4. Return up to 5 most relevant contacts
5. Provide actionable next steps

Return ONLY valid JSON, no markdown, no explanations.`;

      const response = await fetch(this.GPT_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.GPT_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a business intelligence AI. Return only valid JSON.'
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 800,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GPT API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('No content in GPT response');
      }

      try {
        const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const suggestion = JSON.parse(cleanJson);

        // Map contact IDs to actual contacts
        const suggestedContacts = contacts.filter(c =>
          suggestion.contactIds.includes(c.id)
        );

        const result: SuggestionResult = {
          contacts: suggestedContacts,
          reasoning: suggestion.reasoning,
          nextSteps: suggestion.nextSteps,
        };

        console.log('✅ Generated suggestions:', result);
        return result;
      } catch (parseError) {
        console.error('⚠️ Failed to parse GPT response:', content);
        throw new Error('Failed to parse suggestions');
      }
    } catch (error) {
      console.error('❌ Generate suggestions failed:', error);
      throw error;
    }
  }

  /**
   * Analyze sentiment and interest level from text
   */
  static async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    interestLevel: 'high' | 'medium' | 'low';
    confidence: number;
  }> {
    try {
      if (!Config.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = `Analyze the sentiment and interest level of this text:

"${text}"

Return ONLY a JSON object:

{
  "sentiment": "positive|neutral|negative",
  "interestLevel": "high|medium|low",
  "confidence": 0-100
}`;

      const response = await fetch(this.GPT_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.GPT_MODEL,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 100,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error('GPT API failed');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('No content in GPT response');
      }

      const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(cleanJson);

      return analysis;
    } catch (error) {
      console.error('❌ Analyze sentiment failed:', error);
      // Return default values on error
      return {
        sentiment: 'neutral',
        interestLevel: 'medium',
        confidence: 50,
      };
    }
  }

  /**
   * Test OpenAI API connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      if (!Config.OPENAI_API_KEY) return false;

      const response = await fetch(this.GPT_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.GPT_MODEL,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}
