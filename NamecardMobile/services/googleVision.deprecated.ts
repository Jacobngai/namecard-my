import * as FileSystem from 'expo-file-system/legacy';
import { ENV } from '../config/env';
import { Contact } from '../types';
import { EnhancedOCRParser } from './enhancedOCRParser';

interface GoogleVisionResponse {
  responses: Array<{
    textAnnotations: Array<{
      description: string;
      boundingPoly: {
        vertices: Array<{ x: number; y: number }>;
      };
    }>;
    fullTextAnnotation?: {
      text: string;
    };
  }>;
}

interface ParsedBusinessCard {
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  confidence: number;
}

export class GoogleVisionService {
  private static readonly API_URL = 'https://vision.googleapis.com/v1/images:annotate';

  /**
   * Extract text from business card image using Google Vision API
   */
  static async extractTextFromImage(imageUri: string): Promise<string> {
    try {
      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64' as any,
      });

      // Prepare request body
      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      };

      // Make API call
      const response = await fetch(
        `${this.API_URL}?key=${ENV.GOOGLE_VISION_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Vision API error: ${JSON.stringify(errorData)}`);
      }

      const data: GoogleVisionResponse = await response.json();
      
      // Extract full text
      const fullText = data.responses[0]?.fullTextAnnotation?.text || 
                       data.responses[0]?.textAnnotations?.[0]?.description || '';

      if (!fullText) {
        throw new Error('No text detected in image');
      }

      return fullText;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to extract text from image');
    }
  }

  /**
   * Parse extracted text into structured contact data using enhanced parser
   */
  static parseBusinessCardText(text: string): ParsedBusinessCard {
    // Use the enhanced parser with multi-strategy approach
    const enhancedResult = EnhancedOCRParser.parseBusinessCard(text);

    // Convert enhanced result to legacy format for compatibility
    // Use mobile1 as primary phone for backward compatibility
    const primaryPhone = enhancedResult.phones.mobile1 ||
                        enhancedResult.phones.office ||
                        enhancedResult.phones.mobile2 ||
                        enhancedResult.phones.fax || '';

    return {
      name: enhancedResult.name,
      company: enhancedResult.company,
      phone: primaryPhone,
      email: enhancedResult.email,
      address: enhancedResult.address,
      confidence: Math.round(enhancedResult.confidence.overall * 100)
    };
  }

  /**
   * Complete OCR processing: extract text and parse into contact
   */
  static async processBusinessCard(imageUri: string): Promise<Partial<Contact>> {
    try {
      console.log('🔍 Starting OCR processing...');

      // Extract text using Google Vision API
      const extractedText = await this.extractTextFromImage(imageUri);
      console.log('📝 Extracted text:', extractedText);

      // Parse text into structured data using enhanced parser
      const enhancedResult = EnhancedOCRParser.parseBusinessCard(extractedText);
      console.log('📊 Enhanced parsed data:', {
        fields: {
          name: enhancedResult.name,
          jobTitle: enhancedResult.jobTitle,
          company: enhancedResult.company,
          phones: enhancedResult.phones,
          email: enhancedResult.email,
          address: enhancedResult.address
        },
        confidence: enhancedResult.confidence
      });

      // Get primary phone for backward compatibility
      const primaryPhone = enhancedResult.phones.mobile1 ||
                          enhancedResult.phones.office ||
                          enhancedResult.phones.mobile2 ||
                          enhancedResult.phones.fax || '';

      // Return contact data with job title and multiple phones included
      return {
        name: enhancedResult.name,
        company: enhancedResult.company,
        jobTitle: enhancedResult.jobTitle,
        phone: primaryPhone, // Primary phone for backward compatibility
        phones: enhancedResult.phones, // All phone numbers
        email: enhancedResult.email,
        address: enhancedResult.address,
        imageUrl: imageUri,
      };
    } catch (error) {
      console.error('❌ Business card processing failed:', error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate API key by making a test request
   */
  static async validateApiKey(): Promise<boolean> {
    try {
      if (!ENV.GOOGLE_VISION_API_KEY) return false;

      // Create a simple test image (1x1 white pixel)
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      const response = await fetch(
        `${this.API_URL}?key=${ENV.GOOGLE_VISION_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { content: testImageBase64 },
              features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
            }]
          })
        }
      );

      return response.ok;
    } catch {
      return false;
    }
  }
}