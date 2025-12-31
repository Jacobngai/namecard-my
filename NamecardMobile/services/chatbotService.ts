import { OpenAIService } from './openai';
import { ChatbotAI } from './chatbotAI';
import { InteractionService, CreateInteractionInput } from './interactionService';
import { Contact } from '../types';

/**
 * ChatbotService
 * Main service that orchestrates the chatbot functionality
 * Handles voice/text input, AI processing, and database operations
 */

export interface ChatbotResponse {
  success: boolean;
  message: string;
  interactionId?: string;
  extractedData?: any;
  suggestions?: any;
}

export type UserIntent =
  | 'greeting'
  | 'record_interaction'
  | 'query_contacts'
  | 'query_followups'
  | 'query_suggestions'
  | 'query_stats'
  | 'unknown';

export class ChatbotService {
  /**
   * Process any user message with full AI intelligence
   * AI decides intent AND generates appropriate response
   * Cost: ~$0.0002 per message
   */
  static async processWithAI(
    userInput: string,
    userId: string,
    contacts: Contact[]
  ): Promise<ChatbotResponse> {
    try {
      const Config = require('../config/environment').default;

      if (!Config.OPENAI_API_KEY) {
        return {
          success: false,
          message: 'AI processing unavailable. Please configure OpenAI API key.',
        };
      }

      const prompt = `You are an AI assistant for a business contact management app.

User said: "${userInput}"

Context:
- User has ${contacts.length} contacts saved
- Available actions: record_interaction, query_contacts, query_followups, query_suggestions, query_stats, greeting

Analyze the user's message and return ONLY a JSON object:

{
  "intent": "greeting|record_interaction|query_contacts|query_followups|query_suggestions|query_stats",
  "shouldSaveInteraction": true/false,
  "response": "your natural conversational response to the user"
}

Guidelines:
- If greeting (hello, hi, test): Welcome them and explain what you can do
- If query_contacts: Tell them they have ${contacts.length} contacts
- If query_followups/suggestions/stats: Explain you'll fetch that data
- If record_interaction: Confirm you'll save the interaction
- Be conversational and natural, not robotic
- Use emojis sparingly (max 1-2)

Return ONLY valid JSON, no markdown.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful, conversational AI assistant. Return only valid JSON.'
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.warn('⚠️ AI processing failed');
        throw new Error('AI processing unavailable');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('No AI response');
      }

      const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const aiResult = JSON.parse(cleanJson);

      console.log('🧠 AI Intent:', aiResult.intent);
      console.log('💬 AI Response:', aiResult.response);

      return {
        success: true,
        message: aiResult.response,
        extractedData: { intent: aiResult.intent, shouldSave: aiResult.shouldSaveInteraction },
      };
    } catch (error) {
      console.error('❌ AI processing failed:', error);
      // Fallback to basic response
      return {
        success: false,
        message: "I'm having trouble understanding. Could you rephrase that?",
      };
    }
  }

  /**
   * Detect user intent using GPT-4o-mini
   * This allows natural language understanding instead of keyword matching
   * Cost: ~$0.0001 per message
   */
  static async detectIntent(userInput: string, contactCount: number): Promise<{
    intent: UserIntent;
    confidence: number;
    reasoning: string;
  }> {
    try {
      const Config = require('../config/environment').default;

      if (!Config.OPENAI_API_KEY) {
        // Fallback to keyword matching if no API key
        return this.fallbackIntentDetection(userInput);
      }

      const prompt = `You are an AI assistant that detects user intent for a business contact management chatbot.

The user said: "${userInput}"

Context: User has ${contactCount} contacts saved.

Analyze the intent and return ONLY a JSON object:

{
  "intent": "greeting|record_interaction|query_contacts|query_followups|query_suggestions|query_stats|unknown",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}

Intent definitions:
- greeting: User is saying hello, testing, or casual conversation
- record_interaction: User is describing a meeting/call with a client (e.g., "I met John about loans")
- query_contacts: User asking about their contacts (e.g., "how many contacts", "show my contacts")
- query_followups: User asking about follow-ups or reminders
- query_suggestions: User asking for recommendations (e.g., "who should I contact")
- query_stats: User asking for statistics or analytics
- unknown: Cannot determine intent

Return ONLY valid JSON, no markdown.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a precise intent detection AI. Return only valid JSON.'
            },
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
        console.warn('⚠️ Intent detection API failed, using fallback');
        return this.fallbackIntentDetection(userInput);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        return this.fallbackIntentDetection(userInput);
      }

      const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(cleanJson);

      console.log('🧠 Intent detected:', result.intent, `(${result.confidence}% confidence)`);
      console.log('💭 Reasoning:', result.reasoning);

      return result;
    } catch (error) {
      console.error('❌ Intent detection failed:', error);
      return this.fallbackIntentDetection(userInput);
    }
  }

  /**
   * Fallback intent detection using keyword matching
   * Used when GPT API is unavailable
   */
  private static fallbackIntentDetection(userInput: string): {
    intent: UserIntent;
    confidence: number;
    reasoning: string;
  } {
    const lower = userInput.toLowerCase();

    if (lower.match(/^(hello|hi|hey|test|testing)/i)) {
      return { intent: 'greeting', confidence: 90, reasoning: 'Greeting keyword detected' };
    }
    if (lower.includes('how many contact') || lower.includes('contact count')) {
      return { intent: 'query_contacts', confidence: 85, reasoning: 'Contact query keywords' };
    }
    if (lower.includes('follow-up') || lower.includes('reminder')) {
      return { intent: 'query_followups', confidence: 85, reasoning: 'Follow-up keywords' };
    }
    if (lower.includes('who should') || lower.includes('suggest') || lower.includes('recommend')) {
      return { intent: 'query_suggestions', confidence: 85, reasoning: 'Suggestion keywords' };
    }
    if (lower.includes('stats') || lower.includes('statistics')) {
      return { intent: 'query_stats', confidence: 85, reasoning: 'Statistics keywords' };
    }

    // Default to interaction recording
    return { intent: 'record_interaction', confidence: 50, reasoning: 'No query keywords found' };
  }

  /**
   * Process voice input from user
   * 1. Transcribe audio using Whisper
   * 2. Extract structured data using GPT
   * 3. Save interaction to database
   * 4. Return response
   */
  static async processVoiceInput(
    audioUri: string,
    userId: string,
    userContacts: Contact[]
  ): Promise<ChatbotResponse> {
    try {
      console.log('🎤 Processing voice input...');

      // Step 1: Transcribe audio using Whisper
      console.log('📝 Transcribing audio...');
      const transcription = await OpenAIService.transcribeAudio(audioUri);

      if (!transcription) {
        return {
          success: false,
          message: 'Failed to transcribe audio. Please try again.',
        };
      }

      console.log('✅ Transcription:', transcription);

      // Step 2: Process the transcription as text
      return await this.processTextInput(transcription, userId, userContacts, audioUri);
    } catch (error) {
      console.error('❌ Process voice input failed:', error);
      return {
        success: false,
        message: `Voice processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Process text input from user
   * 1. Extract structured data using GPT
   * 2. Validate and find contact in database
   * 3. Save interaction to database
   * 4. Return response
   */
  static async processTextInput(
    text: string,
    userId: string,
    userContacts: Contact[],
    voiceRecordingUri?: string
  ): Promise<ChatbotResponse> {
    try {
      console.log('💬 Processing text input:', text);

      // Step 1: Extract structured data using AI
      console.log('🧠 Extracting interaction data...');
      const extractedData = await ChatbotAI.extractInteractionData(text, userId, userContacts);

      // Step 2: Validate if this is actually a business interaction
      if (!extractedData.topic || extractedData.topic.trim() === '') {
        return {
          success: false,
          message: `👋 Hi! I'm here to help you record interactions with clients. Try saying something like:\n\n"I met John Tan today at 2pm, we talked about car loans. He's very interested."\n\nor\n\n"Called Sarah Lee about insurance. She wants a quote."`,
          extractedData,
        };
      }

      // Step 3: Validate contact
      if (!extractedData.contactId) {
        return {
          success: false,
          message: `I couldn't find a contact named "${extractedData.contactName}" in your contacts. Please create this contact first.`,
          extractedData,
        };
      }

      // Step 4: Prepare interaction data
      const interactionData: CreateInteractionInput = {
        contact_id: extractedData.contactId,
        interaction_date: extractedData.date,
        topic: extractedData.topic,
        summary: extractedData.summary,
        transcription: text,
        keywords: extractedData.keywords,
        interest_level: extractedData.interestLevel,
        sentiment: extractedData.sentiment,
        follow_up_required: extractedData.followUpRequired,
        follow_up_date: extractedData.followUpDate || undefined,
        follow_up_notes: extractedData.followUpNotes || undefined,
        voice_recording_url: voiceRecordingUri,
      };

      // Step 5: Save to database
      console.log('💾 Saving interaction to database...');
      const savedInteraction = await InteractionService.createInteraction(userId, interactionData);

      // Step 6: Generate response message
      const responseMessage = this.generateResponseMessage(extractedData);

      return {
        success: true,
        message: responseMessage,
        interactionId: savedInteraction.id,
        extractedData,
      };
    } catch (error) {
      console.error('❌ Process text input failed:', error);
      return {
        success: false,
        message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get AI-powered suggestions based on user query
   *
   * Example: "Who should I follow up with about loans?"
   */
  static async getSuggestions(
    query: string,
    userId: string,
    userContacts: Contact[]
  ): Promise<ChatbotResponse> {
    try {
      console.log('🔍 Getting suggestions for:', query);

      // Get all user interactions
      const interactions = await InteractionService.getUserInteractions(userId);

      // Use AI to analyze and provide suggestions
      const suggestions = await ChatbotAI.generateSuggestions(
        userId,
        query,
        userContacts,
        interactions
      );

      if (suggestions.contacts.length === 0) {
        return {
          success: true,
          message: "I couldn't find any contacts matching your criteria.",
          suggestions,
        };
      }

      // Generate response message
      let message = `📊 ${suggestions.reasoning}\n\n`;
      message += `**Recommended contacts:**\n`;

      suggestions.contacts.forEach((contact, index) => {
        message += `${index + 1}. ${contact.name}`;
        if (contact.company) message += ` (${contact.company})`;
        message += `\n`;
      });

      message += `\n**Next steps:**\n`;
      suggestions.nextSteps.forEach((step, index) => {
        message += `${index + 1}. ${step}\n`;
      });

      return {
        success: true,
        message,
        suggestions,
      };
    } catch (error) {
      console.error('❌ Get suggestions failed:', error);
      return {
        success: false,
        message: `Failed to get suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get upcoming follow-ups
   */
  static async getUpcomingFollowUps(
    userId: string,
    userContacts: Contact[],
    days: number = 7
  ): Promise<ChatbotResponse> {
    try {
      console.log(`📅 Getting follow-ups for next ${days} days...`);

      const followUps = await InteractionService.getUpcomingFollowUps(userId, days);

      if (followUps.length === 0) {
        return {
          success: true,
          message: `You have no follow-ups scheduled in the next ${days} days. Great job staying on top of things! 👏`,
        };
      }

      let message = `📅 You have ${followUps.length} follow-up${followUps.length > 1 ? 's' : ''} in the next ${days} days:\n\n`;

      for (const followUp of followUps) {
        const contact = userContacts.find(c => c.id === followUp.contact_id);
        const dueDate = new Date(followUp.follow_up_date!);
        const daysUntil = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        message += `**${contact?.name || 'Unknown'}** - ${contact?.company || ''}\n`;
        message += `  📞 ${contact?.phone || 'No phone'}\n`;
        message += `  📝 Topic: ${followUp.topic}\n`;
        message += `  ⏰ Due: ${dueDate.toLocaleDateString()} (${daysUntil} days)\n`;
        if (followUp.follow_up_notes) {
          message += `  📌 Notes: ${followUp.follow_up_notes}\n`;
        }
        message += `\n`;
      }

      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error('❌ Get upcoming follow-ups failed:', error);
      return {
        success: false,
        message: `Failed to get follow-ups: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get overdue follow-ups
   */
  static async getOverdueFollowUps(
    userId: string,
    userContacts: Contact[]
  ): Promise<ChatbotResponse> {
    try {
      console.log('⚠️ Getting overdue follow-ups...');

      const overdue = await InteractionService.getOverdueFollowUps(userId);

      if (overdue.length === 0) {
        return {
          success: true,
          message: 'Great! You have no overdue follow-ups. 🎉',
        };
      }

      let message = `⚠️ You have ${overdue.length} overdue follow-up${overdue.length > 1 ? 's' : ''}:\n\n`;

      for (const followUp of overdue) {
        const contact = userContacts.find(c => c.id === followUp.contact_id);
        const dueDate = new Date(followUp.follow_up_date!);
        const daysOverdue = Math.ceil((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        message += `**${contact?.name || 'Unknown'}** - ${contact?.company || ''}\n`;
        message += `  📞 ${contact?.phone || 'No phone'}\n`;
        message += `  📝 Topic: ${followUp.topic}\n`;
        message += `  ⏰ Was due: ${dueDate.toLocaleDateString()} (${daysOverdue} days overdue)\n`;
        if (followUp.follow_up_notes) {
          message += `  📌 Notes: ${followUp.follow_up_notes}\n`;
        }
        message += `\n`;
      }

      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error('❌ Get overdue follow-ups failed:', error);
      return {
        success: false,
        message: `Failed to get overdue follow-ups: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get interaction statistics
   */
  static async getStats(userId: string): Promise<ChatbotResponse> {
    try {
      console.log('📊 Getting interaction statistics...');

      const stats = await InteractionService.getInteractionStats(userId);

      let message = `📊 **Your Interaction Statistics:**\n\n`;
      message += `Total interactions: ${stats.total}\n\n`;

      if (Object.keys(stats.by_topic).length > 0) {
        message += `**By Topic:**\n`;
        Object.entries(stats.by_topic)
          .sort(([, a], [, b]) => b - a)
          .forEach(([topic, count]) => {
            message += `  • ${topic}: ${count}\n`;
          });
        message += `\n`;
      }

      if (Object.keys(stats.by_interest_level).length > 0) {
        message += `**By Interest Level:**\n`;
        Object.entries(stats.by_interest_level).forEach(([level, count]) => {
          const emoji = level === 'high' ? '🔥' : level === 'medium' ? '👍' : '😐';
          message += `  ${emoji} ${level}: ${count}\n`;
        });
        message += `\n`;
      }

      message += `**Follow-ups:**\n`;
      message += `  ✅ Completed: ${stats.completed_follow_ups}\n`;
      message += `  ⏳ Pending: ${stats.pending_follow_ups}\n`;

      return {
        success: true,
        message,
      };
    } catch (error) {
      console.error('❌ Get stats failed:', error);
      return {
        success: false,
        message: `Failed to get statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generate a friendly response message
   */
  private static generateResponseMessage(extractedData: any): string {
    const contact = extractedData.contactName;
    const topic = extractedData.topic;
    const interestLevel = extractedData.interestLevel;

    let message = `✅ **Interaction Recorded!**\n\n`;
    message += `I've saved your interaction with **${contact}** about **${topic}**.\n\n`;

    if (interestLevel === 'high') {
      message += `🔥 Great! They seem highly interested.\n`;
    } else if (interestLevel === 'medium') {
      message += `👍 They seem moderately interested.\n`;
    }

    if (extractedData.followUpRequired) {
      const followUpDate = new Date(extractedData.followUpDate);
      message += `\n📅 I've set a follow-up reminder for **${followUpDate.toLocaleDateString()}**.\n`;

      if (extractedData.followUpNotes) {
        message += `📝 Note: ${extractedData.followUpNotes}\n`;
      }
    }

    return message;
  }
}
