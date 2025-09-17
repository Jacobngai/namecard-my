import * as FileSystem from 'expo-file-system/legacy';
import { Contact } from '../types';
import { ENV } from '../config/env';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface ExtractedCardData {
  name: string;
  jobTitle: string;
  company: string;
  phones: {
    mobile1?: string;
    mobile2?: string;
    office?: string;
    fax?: string;
  };
  email: string;
  address: string;
  website?: string;
  confidence: number;
}

export class GeminiOCRService {
  private static readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  /**
   * Process business card image using Gemini 2.0 Flash
   * Combines OCR and intelligent parsing in a single API call
   */
  static async processBusinessCard(imageUri: string): Promise<Partial<Contact>> {
    try {
      console.log('🚀 Starting Gemini 2.0 Flash OCR processing...');

      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64' as any,
      });

      // Create the prompt for Gemini
      const prompt = `Analyze this business card image and extract ALL information in a structured format.

CRITICAL REQUIREMENTS:
1. Extract EVERY piece of text visible on the card
2. Identify and categorize phone numbers (mobile, office, fax)
3. Detect job titles and positions
4. Extract company names including trademark symbols (™, ®, ©)
5. Parse addresses completely
6. Identify emails and websites

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "name": "person's full name",
  "jobTitle": "job title or position",
  "company": "company name with any symbols",
  "phones": {
    "mobile1": "primary mobile number",
    "mobile2": "secondary mobile if exists",
    "office": "office/landline number",
    "fax": "fax number if exists"
  },
  "email": "email address",
  "address": "complete address",
  "website": "website URL if exists",
  "confidence": 0-100
}

IMPORTANT RULES:
- For missing fields, use empty string ""
- Keep phone numbers in their original format (with dots, dashes, etc)
- Include country codes if present (e.g., +60, +1)
- Preserve trademark symbols in company names
- For Malaysian numbers starting with 01X, keep the format
- Extract both English and non-English text
- If multiple phone numbers exist without labels, assign the first mobile-looking number to mobile1
- Job titles like CEO, Director, Manager, Co-Founder should go in jobTitle field`;

      // Prepare request body for Gemini
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1, // Low temperature for more consistent extraction
          topK: 1,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE'
          }
        ]
      };

      // Make request to Gemini API
      const response = await fetch(`${this.API_URL}?key=${ENV.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Gemini API error:', errorData);
        throw new Error(`Gemini API failed: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();

      // Extract the text response from Gemini
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('📝 Gemini raw response:', responseText);

      // Parse the JSON response
      let extractedData: ExtractedCardData;
      try {
        // Remove any markdown code blocks if present
        const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        extractedData = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini response:', parseError);
        console.log('Raw response:', responseText);

        // Fallback: Try to extract data manually if JSON parsing fails
        extractedData = this.fallbackExtraction(responseText);
      }

      console.log('✅ Extracted card data:', extractedData);

      // Validate and clean the extracted data
      const cleanedData = this.validateAndCleanData(extractedData);

      // Get primary phone for backward compatibility
      const primaryPhone = cleanedData.phones.mobile1 ||
                          cleanedData.phones.office ||
                          cleanedData.phones.mobile2 ||
                          cleanedData.phones.fax || '';

      // Return contact data in the expected format
      return {
        name: cleanedData.name,
        company: cleanedData.company,
        jobTitle: cleanedData.jobTitle,
        phone: primaryPhone, // Primary phone for backward compatibility
        phones: cleanedData.phones, // All phone numbers
        email: cleanedData.email,
        address: cleanedData.address,
        imageUrl: imageUri,
      };

    } catch (error) {
      console.error('❌ Gemini OCR processing failed:', error);

      // Return empty contact on failure (offline-first approach)
      return {
        name: '',
        company: '',
        jobTitle: '',
        phone: '',
        email: '',
        address: '',
        imageUrl: imageUri,
        phones: {}
      };
    }
  }

  /**
   * Validate and clean extracted data
   */
  private static validateAndCleanData(data: any): ExtractedCardData {
    return {
      name: (data.name || '').trim(),
      jobTitle: (data.jobTitle || '').trim(),
      company: (data.company || '').trim(),
      phones: {
        mobile1: this.cleanPhoneNumber(data.phones?.mobile1 || ''),
        mobile2: this.cleanPhoneNumber(data.phones?.mobile2 || ''),
        office: this.cleanPhoneNumber(data.phones?.office || ''),
        fax: this.cleanPhoneNumber(data.phones?.fax || ''),
      },
      email: (data.email || '').toLowerCase().trim(),
      address: (data.address || '').trim(),
      website: (data.website || '').trim(),
      confidence: typeof data.confidence === 'number' ? data.confidence : 85,
    };
  }

  /**
   * Clean phone number while preserving format
   */
  private static cleanPhoneNumber(phone: string): string {
    if (!phone) return '';

    // Remove any text labels but keep the number format
    return phone
      .replace(/^(mobile|hp|tel|phone|fax|office)[\s:]*\d?[\s:]*/i, '')
      .trim();
  }

  /**
   * Fallback extraction if JSON parsing fails
   */
  private static fallbackExtraction(text: string): ExtractedCardData {
    console.log('⚠️ Using fallback extraction method');

    const extracted: ExtractedCardData = {
      name: '',
      jobTitle: '',
      company: '',
      phones: {},
      email: '',
      address: '',
      confidence: 50,
    };

    // Try to extract key-value pairs
    const lines = text.split('\n');

    for (const line of lines) {
      const lower = line.toLowerCase();

      // Extract name
      if (lower.includes('name') && !extracted.name) {
        const match = line.match(/name[:\s]*(.+)/i);
        if (match) extracted.name = match[1].trim();
      }

      // Extract email
      if (!extracted.email) {
        const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) extracted.email = emailMatch[0];
      }

      // Extract phone numbers
      const phoneMatch = line.match(/[\+]?[\d][\d\s.\-()]{7,}/);
      if (phoneMatch) {
        const phone = phoneMatch[0];
        if (lower.includes('mobile') || lower.includes('hp')) {
          if (!extracted.phones.mobile1) {
            extracted.phones.mobile1 = phone;
          } else if (!extracted.phones.mobile2) {
            extracted.phones.mobile2 = phone;
          }
        } else if (lower.includes('office') || lower.includes('tel')) {
          extracted.phones.office = phone;
        } else if (lower.includes('fax')) {
          extracted.phones.fax = phone;
        } else if (!extracted.phones.mobile1) {
          extracted.phones.mobile1 = phone;
        }
      }

      // Extract company (look for trademark symbols)
      if ((line.includes('™') || line.includes('®') || line.includes('©')) && !extracted.company) {
        extracted.company = line.trim();
      }

      // Extract job title
      const titleKeywords = ['CEO', 'Director', 'Manager', 'Founder', 'President', 'Executive', 'Officer'];
      for (const keyword of titleKeywords) {
        if (line.includes(keyword) && !extracted.jobTitle) {
          extracted.jobTitle = line.trim();
          break;
        }
      }
    }

    return extracted;
  }

  /**
   * Validate API key by making a test request
   */
  static async validateApiKey(): Promise<boolean> {
    try {
      if (!ENV.GEMINI_API_KEY) return false;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${ENV.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'test' }]
            }]
          })
        }
      );

      return response.ok || response.status === 400; // 400 is expected for test
    } catch {
      return false;
    }
  }

  /**
   * Get service info for debugging
   */
  static getServiceInfo(): { name: string; version: string; model: string } {
    return {
      name: 'Gemini OCR Service',
      version: '2.0',
      model: 'gemini-2.0-flash-exp'
    };
  }
}