import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { useAuth } from '../../hooks/useAuth';
import { ChatbotService } from '../../services/chatbotService';
import { OpenAIService } from '../../services/openai';
import { ContactService } from '../../services/contactService';
import { Contact } from '../../types';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export function ChatbotScreen() {
  const { user } = useAuth();

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);

  useEffect(() => {
    requestAudioPermissions();
    addWelcomeMessage();
    loadContacts();
  }, []);

  async function loadContacts() {
    try {
      const contactsData = await ContactService.getContacts();
      setContacts(contactsData);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  }

  // Update recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  async function requestAudioPermissions() {
    try {
      const granted = await OpenAIService.requestAudioPermissions();
      setHasAudioPermission(granted);

      if (!granted) {
        Alert.alert(
          'Microphone Permission Required',
          'Please enable microphone access to use voice input.'
        );
      }
    } catch (error) {
      console.error('Failed to request audio permissions:', error);
    }
  }

  function addWelcomeMessage() {
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: `👋 Hi! I'm your AI assistant.\n\n**I can help you:**\n• Record interactions with clients\n• Get follow-up reminders\n• Find contacts by topic\n• Analyze your interaction stats\n\n**Try saying:**\n"I met John Tan today at 2pm, we talked about car loans. He's very interested."\n\nor\n\n"Who should I follow up with about loans?"`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }

  async function handleStartRecording() {
    if (!hasAudioPermission) {
      await requestAudioPermissions();
      return;
    }

    try {
      console.log('🎤 Starting recording...');
      const recordingInstance = await OpenAIService.startRecording();
      setRecording(recordingInstance);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  }

  async function handleStopRecording() {
    if (!recording) return;

    try {
      console.log('🛑 Stopping recording...');
      setIsRecording(false);

      const audioUri = await OpenAIService.stopRecording(recording);
      setRecording(null);

      // Add user message
      const userMsg: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: '🎤 Voice message...',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);

      // Process voice input
      await processVoiceInput(audioUri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to process voice recording.');
    }
  }

  async function processVoiceInput(audioUri: string) {
    if (!user) return;

    setIsProcessing(true);

    try {
      const response = await ChatbotService.processVoiceInput(audioUri, user.id, contacts);

      const botMsg: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Voice processing error:', error);
      Alert.alert('Error', 'Failed to process voice input.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSendText() {
    if (!inputText.trim() || !user) return;

    const userMessage = inputText.trim();
    setInputText('');

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setIsProcessing(true);

    try {
      const lowerInput = userMessage.toLowerCase();
      const wordCount = userMessage.trim().split(/\s+/).length;
      const isShortMessage = wordCount <= 5; // Heuristic: short = likely simple query

      // SANITY CHECK: Multi-signal gibberish detection to avoid wasting AI calls
      const lettersOnly = lowerInput.replace(/[^a-z]/g, '');
      const avgWordLength = userMessage.replace(/\s/g, '').length / wordCount;

      // Signal 1: Repeated character patterns (e.g., "aaaaa", "bbbbb")
      const hasRepeatedChars = /(.)\1{4,}/.test(userMessage);

      // Signal 2: Vowel ratio check - gibberish usually has low vowel ratio
      const vowelCount = (lettersOnly.match(/[aeiou]/g) || []).length;
      const vowelRatio = vowelCount / Math.max(lettersOnly.length, 1);
      const veryLowVowelRatio = (vowelRatio < 0.15 && lettersOnly.length > 10) || (vowelRatio === 0 && lettersOnly.length > 5);

      // Signal 3: Random character sequences (many short words with low vowel density)
      const hasRandomSequence = wordCount > 5 && avgWordLength < 8 && vowelRatio < 0.25;

      // Signal 4: Consonant clusters (3+ consonants in a row across multiple words)
      const consonantClusters = (lettersOnly.match(/[^aeiou]{3,}/g) || []).length;
      const hasExcessiveConsonants = consonantClusters >= 2 && lettersOnly.length > 10;

      // Multi-signal scoring (require ANY 2 signals to reject)
      const gibberishSignals = [
        hasRepeatedChars,          // Signal 1: Repeated character patterns
        veryLowVowelRatio,         // Signal 2: Very low vowel ratio (< 20%)
        hasRandomSequence,         // Signal 3: Many short words with low vowels
        hasExcessiveConsonants,    // Signal 4: Many consonant clusters
      ];

      const gibberishScore = gibberishSignals.filter(Boolean).length;
      const isLikelyGibberish = gibberishScore >= 2;

      let response;

      if (isLikelyGibberish) {
        // Gibberish detected - don't waste AI call
        console.log(`🚫 Gibberish detected (score: ${gibberishScore}/3), rejecting`);
        response = {
          success: false,
          message: "I didn't quite catch that. Could you rephrase? 🤔\n\nTry:\n• \"Hello\"\n• \"Show my contacts\"\n• \"I met John about loans\"",
        };
      } else if (isShortMessage && lowerInput.match(/^(hello|hi|hey|test|testing|yo|sup|wassup|what's up)$/i)) {
        // Simple greeting - no need for AI
        console.log('⚡ Fast path: greeting');
        response = {
          success: true,
          message: `Hey! 👋 I'm your AI assistant for client interactions.\n\n**I can help you:**\n• Record meetings: "I met John about loans"\n• Check follow-ups: "Show upcoming reminders"\n• Get suggestions: "Who should I contact?"\n• View stats: "Show my analytics"\n\n**What would you like to do?**`,
        };
      } else if (isShortMessage && lowerInput.match(/^(how many|show|list).*(contact|client)/i)) {
        // Contact count query - no need for AI
        console.log('⚡ Fast path: contact count');
        response = {
          success: true,
          message: `📊 You have **${contacts.length} contact${contacts.length !== 1 ? 's' : ''}** saved.\n\n${contacts.length > 0 ? 'Want to see who to follow up with?' : 'Start recording your first client interaction!'}`,
        };
      } else if (isShortMessage && (lowerInput.includes('follow-up') || lowerInput.includes('followup') || lowerInput.includes('reminder'))) {
        // Follow-up query
        console.log('⚡ Fast path: follow-ups');
        if (lowerInput.includes('overdue')) {
          response = await ChatbotService.getOverdueFollowUps(user.id, contacts);
        } else {
          response = await ChatbotService.getUpcomingFollowUps(user.id, contacts);
        }
      } else if (isShortMessage && (lowerInput.includes('who should') || lowerInput.includes('suggest') || lowerInput.includes('recommend'))) {
        // Suggestion query
        console.log('⚡ Fast path: suggestions');
        response = await ChatbotService.getSuggestions(userMessage, user.id, contacts);
      } else if (isShortMessage && (lowerInput.includes('stat') || lowerInput.includes('analytic') || lowerInput.includes('report'))) {
        // Stats query
        console.log('⚡ Fast path: stats');
        response = await ChatbotService.getStats(user.id);
      } else {
        // SLOW PATH: Complex/ambiguous message - use AI as judge
        console.log('🤖 Slow path: AI processing (message too complex for fast path)');
        const aiResponse = await ChatbotService.processWithAI(userMessage, user.id, contacts);

        // If AI says to save interaction, do it
        if (aiResponse.extractedData?.shouldSave) {
          response = await ChatbotService.processTextInput(userMessage, user.id, contacts);
        } else {
          response = aiResponse;
        }
      }

      const botMsg: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Text processing error:', error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: '❌ Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        {/* Header */}
        <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant 🤖</Text>
        <Text style={styles.headerSubtitle}>
          Record interactions & get insights
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        ref={ref => ref?.scrollToEnd({ animated: true })}
      >
        {messages.map(message => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.type === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.type === 'user' ? styles.userMessageText : styles.botMessageText,
              ]}
            >
              {message.content}
            </Text>
            <Text style={styles.messageTime}>
              {message.timestamp.toLocaleTimeString('en-MY', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}

        {isProcessing && (
          <View style={[styles.messageBubble, styles.botMessage]}>
            <ActivityIndicator color="#007AFF" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        {isRecording ? (
          // Recording UI
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Recording... {formatTime(recordingDuration)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopRecording}
            >
              <Text style={styles.stopButtonText}>⏹️ Stop</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Text input UI
          <>
            <TouchableOpacity
              style={styles.micButton}
              onPress={handleStartRecording}
              disabled={isProcessing}
            >
              <Text style={styles.micButtonText}>🎤</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Type your message or use voice..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isProcessing}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isProcessing) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendText}
              disabled={!inputText.trim() || isProcessing}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      </KeyboardAvoidingView>

      {/* Quick Actions - Moved outside KeyboardAvoidingView */}
      <ScrollView
        horizontal
        style={styles.quickActions}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setInputText('Show my upcoming follow-ups')}
        >
          <Text style={styles.quickActionText}>📅 Follow-ups</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setInputText('Show my overdue follow-ups')}
        >
          <Text style={styles.quickActionText}>⚠️ Overdue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setInputText('Show my statistics')}
        >
          <Text style={styles.quickActionText}>📊 Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => setInputText('Who should I follow up with about loans?')}
        >
          <Text style={styles.quickActionText}>🔍 Suggestions</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 5,
  },
  processingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  micButtonText: {
    fontSize: 24,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff3b30',
    marginRight: 10,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff3b30',
  },
  stopButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ff3b30',
    borderRadius: 20,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    maxHeight: 50,
  },
  quickActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});
