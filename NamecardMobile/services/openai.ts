import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { ENV } from '../config/env';

// Type for recording
type Recording = Audio.Recording;

interface WhisperResponse {
  text: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface VoiceNote {
  id: string;
  uri: string;
  transcription: string;
  duration: number;
  created_at: string;
  parsed_intentions?: {
    follow_up_date?: string;
    reminder_note?: string;
    tags?: string[];
  };
}

export class OpenAIService {
  private static readonly WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
  private static readonly CHAT_API_URL = 'https://api.openai.com/v1/chat/completions';

  /**
   * Initialize audio permissions
   */
  static async requestAudioPermissions(): Promise<boolean> {
    try {
      const permission = await Audio.requestPermissionsAsync();
      return permission.status === 'granted';
    } catch (error) {
      console.error('❌ Audio permission request failed:', error);
      return false;
    }
  }

  /**
   * Start audio recording
   */
  static async startRecording(): Promise<Recording> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      return recording;
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      throw new Error('Failed to start recording');
    }
  }

  /**
   * Stop audio recording and return file URI
   */
  static async stopRecording(recording: Recording): Promise<string> {
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (!uri) {
        throw new Error('No recording file found');
      }

      return uri;
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      throw new Error('Failed to stop recording');
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   */
  static async transcribeAudio(audioUri: string): Promise<string> {
    try {
      if (!ENV.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // Create form data
      const formData = new FormData();
      
      // Read audio file and create blob
      const audioFile = await fetch(audioUri);
      const audioBlob = await audioFile.blob();
      
      formData.append('file', audioBlob, 'audio.m4a');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch(this.WHISPER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ENV.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Whisper API error: ${JSON.stringify(errorData)}`);
      }

      const data: WhisperResponse = await response.json();
      return data.text.trim();
    } catch (error) {
      console.error('❌ Audio transcription failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to transcribe audio');
    }
  }

  /**
   * Parse transcribed text to extract follow-up intentions using GPT
   */
  static async parseVoiceIntentions(transcription: string): Promise<{
    follow_up_date?: string;
    reminder_note?: string;
    tags?: string[];
  }> {
    try {
      if (!ENV.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = `
Analyze this voice note about a business contact and extract follow-up intentions:

"${transcription}"

Please extract and return ONLY a JSON object with these fields (use null for missing values):
{
  "follow_up_date": "relative date like '2 weeks', '1 month', '3 days' or null",
  "reminder_note": "brief summary of what to follow up about or null", 
  "tags": ["array", "of", "relevant", "tags"] or null
}

Examples of follow_up_date: "1 week", "2 weeks", "1 month", "3 months", "next week"
Only include tags that are clearly relevant to business networking.
`;

      const response = await fetch(this.CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ENV.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 200,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GPT API error: ${JSON.stringify(errorData)}`);
      }

      const data: ChatCompletionResponse = await response.json();
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        return {};
      }

      // Parse JSON response
      try {
        const parsed = JSON.parse(content);
        
        // Convert relative date to actual date
        if (parsed.follow_up_date) {
          const followUpDate = this.parseRelativeDate(parsed.follow_up_date);
          if (followUpDate) {
            parsed.follow_up_date = followUpDate.toISOString();
          } else {
            parsed.follow_up_date = null;
          }
        }

        return parsed;
      } catch (parseError) {
        console.warn('⚠️ Failed to parse GPT response:', content);
        return {};
      }
    } catch (error) {
      console.error('❌ Voice intention parsing failed:', error);
      return {};
    }
  }

  /**
   * Convert relative date string to actual Date
   */
  private static parseRelativeDate(relativeDate: string): Date | null {
    const now = new Date();
    const lowerDate = relativeDate.toLowerCase().trim();

    // Parse patterns like "2 weeks", "1 month", "3 days"
    const patterns = [
      { regex: /(\d+)\s*weeks?/, multiplier: 7 * 24 * 60 * 60 * 1000 },
      { regex: /(\d+)\s*months?/, multiplier: 30 * 24 * 60 * 60 * 1000 },
      { regex: /(\d+)\s*days?/, multiplier: 24 * 60 * 60 * 1000 },
      { regex: /next\s*week/, multiplier: 7 * 24 * 60 * 60 * 1000, value: 1 },
    ];

    for (const pattern of patterns) {
      const match = lowerDate.match(pattern.regex);
      if (match) {
        const value = pattern.value || parseInt(match[1]);
        return new Date(now.getTime() + value * pattern.multiplier);
      }
    }

    return null;
  }

  /**
   * Create and save a voice note with transcription
   */
  static async createVoiceNote(
    audioUri: string,
    contactId: string
  ): Promise<VoiceNote> {
    try {
      const voiceNoteId = `voice_${Date.now()}`;
      
      // For expo-audio, we'll estimate duration based on file size
      // or track it during recording
      const duration = 0; // Duration tracking would need to be implemented during recording

      console.log('🎤 Starting voice transcription...');
      
      // Transcribe audio
      const transcription = await this.transcribeAudio(audioUri);
      console.log('📝 Transcription:', transcription);

      // Parse intentions
      const intentions = await this.parseVoiceIntentions(transcription);
      console.log('🧠 Parsed intentions:', intentions);

      const voiceNote: VoiceNote = {
        id: voiceNoteId,
        uri: audioUri,
        transcription,
        duration: Math.round(duration / 1000), // Convert to seconds
        created_at: new Date().toISOString(),
        parsed_intentions: intentions,
      };

      return voiceNote;
    } catch (error) {
      console.error('❌ Voice note creation failed:', error);
      throw error;
    }
  }

  /**
   * Test OpenAI API connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      if (!ENV.OPENAI_API_KEY) return false;

      const response = await fetch(this.CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ENV.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
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