import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INTRO_MESSAGE_KEY = '@namecard/intro_message';
const DEFAULT_INTRO_MESSAGE = "Hi! Nice meeting you. Let's stay connected!";

/**
 * Custom hook to manage user's WhatsApp introduction message
 * Persists the message in AsyncStorage
 */
export function useIntroMessage() {
  const [introMessage, setIntroMessageState] = useState<string>(DEFAULT_INTRO_MESSAGE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load introduction message from AsyncStorage on mount
  useEffect(() => {
    loadIntroMessage();
  }, []);

  const loadIntroMessage = async () => {
    try {
      const storedMessage = await AsyncStorage.getItem(INTRO_MESSAGE_KEY);
      if (storedMessage !== null) {
        setIntroMessageState(storedMessage);
      }
    } catch (error) {
      console.error('Failed to load introduction message:', error);
      // Keep default message on error
    } finally {
      setIsLoading(false);
    }
  };

  const setIntroMessage = async (message: string) => {
    try {
      // Update state immediately for UI responsiveness
      setIntroMessageState(message);

      // Save to AsyncStorage
      await AsyncStorage.setItem(INTRO_MESSAGE_KEY, message);
      console.log('✅ Introduction message saved');
    } catch (error) {
      console.error('Failed to save introduction message:', error);
      throw new Error('Failed to save introduction message');
    }
  };

  const resetIntroMessage = async () => {
    try {
      setIntroMessageState(DEFAULT_INTRO_MESSAGE);
      await AsyncStorage.setItem(INTRO_MESSAGE_KEY, DEFAULT_INTRO_MESSAGE);
      console.log('✅ Introduction message reset to default');
    } catch (error) {
      console.error('Failed to reset introduction message:', error);
      throw new Error('Failed to reset introduction message');
    }
  };

  /**
   * Get formatted introduction message for a specific contact
   * @param contactName - Name of the contact to personalize the message
   * @returns Personalized introduction message
   */
  const getFormattedMessage = (contactName: string): string => {
    // If the message contains {name} placeholder, replace it
    if (introMessage.includes('{name}')) {
      return introMessage.replace(/{name}/g, contactName);
    }

    // If the message starts with "Hi" or "Hello", insert name after greeting
    if (introMessage.match(/^(Hi|Hello)[!,.\s]/i)) {
      return introMessage.replace(/^(Hi|Hello)\s*/i, `$1 ${contactName}! `);
    }

    // Otherwise, prepend "Hi [name]! " to the message
    return `Hi ${contactName}! ${introMessage}`;
  };

  return {
    introMessage,
    setIntroMessage,
    resetIntroMessage,
    getFormattedMessage,
    reloadIntroMessage: loadIntroMessage, // Expose reload function for manual refresh
    isLoading,
  };
}
