import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Alert, ActivityIndicator, View, Text, StyleSheet, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraScreen } from './components/CameraScreen';
import { ContactForm } from './components/ContactForm';
import { ContactList } from './components/ContactList';
import { ProfileScreen } from './components/ProfileScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { Contact } from './types';
import { ContactService } from './services/contactService';
import { SupabaseService } from './services/supabase';
import { AuthManager } from './services/authManager';
import { ENV, validateEnv } from './config/env';
import { AuthScreen } from './components/AuthScreen';
import { SplashScreen } from './components/SplashScreen';
import { ContactDetailModal } from './components/ContactDetailModal';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [scannedCardData, setScannedCardData] = useState<Partial<Contact> | null>(null);
  const [pendingImageUri, setPendingImageUri] = useState<string | undefined>(undefined);
  const [shouldProcessOCR, setShouldProcessOCR] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactDetail, setShowContactDetail] = useState(false);

  // Initialize app and validate environment
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Validate environment variables (optional for offline mode)
      const { isValid, missingKeys } = validateEnv();
      if (!isValid) {
        console.warn('⚠️ Missing API keys:', missingKeys);
        console.warn('📱 Running in offline mode');
      }

      // Initialize contact service (works offline)
      await ContactService.init();

      // Load contacts from local storage first
      await loadContacts();

      // Try to verify session (non-blocking)
      try {
        const { user, error } = await AuthManager.verifySession();
        if (user && !error) {
          setIsAuthenticated(true);
          setCurrentUser(user);
          console.log('✅ User authenticated, sync enabled');
        } else {
          console.log('📱 Running in guest mode');
        }
      } catch (authError) {
        console.log('📱 Auth check failed, continuing in offline mode');
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('⚠️ App initialization warning:', error);
      // Continue without crashing
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const contactsData = await ContactService.getContacts();
      setContacts(contactsData);
      console.log('✅ Loaded contacts:', contactsData.length);
    } catch (error) {
      console.error('⚠️ Failed to load contacts:', error);
      // Always fallback to empty array
      setContacts([]);
    }
  };

  const setupRealtimeSync = () => {
    // Realtime sync is optional - only if authenticated
    if (isAuthenticated) {
      try {
        const subscription = SupabaseService.subscribeToContacts(
          // On insert
          (newContact) => {
            setContacts(prev => [newContact, ...prev]);
            console.log('🔄 New contact synced:', newContact.name);
          },
          // On update
          (updatedContact) => {
            setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
            console.log('🔄 Contact updated:', updatedContact.name);
          },
          // On delete
          (deletedId) => {
            setContacts(prev => prev.filter(c => c.id !== deletedId));
            console.log('🔄 Contact deleted:', deletedId);
          }
        );

        // Cleanup subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.log('⚠️ Realtime sync not available:', error);
      }
    }
  };

  const handleScanCard = (cardData: Partial<Contact>) => {
    setScannedCardData(cardData);
  };

  const handleNavigateToForm = (imageUri: string, processOCR: boolean) => {
    setPendingImageUri(imageUri);
    setShouldProcessOCR(processOCR);
    setScannedCardData(null); // Clear any previous scanned data
  };

  const handleSaveContact = async (contactData: Partial<Contact>) => {
    try {
      console.log('💾 Saving contact:', contactData);

      // Save using ContactService (offline-first)
      const newContact = await ContactService.createContact(contactData);

      console.log('✅ Contact saved successfully:', newContact);

      // Update local state
      setContacts(prev => [newContact, ...prev]);

      // Clear scanned data and pending image
      setScannedCardData(null);
      setPendingImageUri(undefined);
      setShouldProcessOCR(false);

      // Show non-blocking success message
      setTimeout(() => {
        Alert.alert('Success', `Contact "${newContact.name}" saved!`,
          [{ text: 'OK', style: 'default' }],
          { cancelable: true }
        );
      }, 500);

    } catch (error) {
      console.error('Failed to save contact:', error);

      // This should rarely happen with offline-first approach
      const errorMessage = error instanceof Error ? error.message : 'Failed to save contact';
      Alert.alert(
        'Save Failed',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactDetail(true);
  };

  const handleContactDelete = async (contactId: string) => {
    try {
      // Remove from local state
      setContacts(prevContacts => prevContacts.filter(c => c.id !== contactId));
      console.log('✅ Contact deleted:', contactId);
    } catch (error) {
      console.error('Failed to delete contact:', error);
      Alert.alert('Error', 'Failed to delete contact');
    }
  };

  const handleBulkContactDelete = async (contactIds: string[]) => {
    try {
      // Delete multiple contacts
      for (const contactId of contactIds) {
        await ContactService.deleteContact(contactId);
      }

      // Remove from local state
      setContacts(prevContacts => prevContacts.filter(c => !contactIds.includes(c.id)));
      console.log(`✅ ${contactIds.length} contacts deleted`);

      Alert.alert('Success', `${contactIds.length} contact${contactIds.length > 1 ? 's' : ''} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete contacts:', error);
      Alert.alert('Error', 'Failed to delete contacts');
    }
  };

  const handleContactEdit = (contact: Contact) => {
    // Close modal and navigate to edit form
    setShowContactDetail(false);
    setScannedCardData(contact);
    setPendingImageUri(contact.imageUrl);
    setShouldProcessOCR(false);
    // The navigation will happen automatically when scannedCardData is set
  };

  const handleAutoProcess = async (imageUri: string) => {
    try {
      console.log('🚀 Auto-processing card...');

      // Import services
      const { GeminiOCRService } = require('./services/geminiOCR');

      // Show processing notification
      Alert.alert(
        'Processing Card',
        'Extracting information and saving contact...',
        [],
        { cancelable: false }
      );

      // Process OCR using Gemini 2.0 Flash
      const ocrData = await GeminiOCRService.processBusinessCard(imageUri);

      if (!ocrData.name) {
        Alert.alert('No Name Detected', 'Could not extract name from the card. Please try again.');
        return;
      }

      // Save contact (offline-first)
      const newContact = await ContactService.createContact({
        ...ocrData,
        imageUrl: imageUri,
      });

      console.log('✅ Contact auto-saved:', newContact.name);

      // Check if auto WhatsApp is enabled
      const settings = await AsyncStorage.getItem('appSettings');
      const parsed = settings ? JSON.parse(settings) : {};

      if (parsed.autoWhatsApp) {
        // Format phone for WhatsApp
        const whatsappPhone = ocrData.phones?.mobile1 ||
                             ocrData.phones?.mobile2 ||
                             ocrData.phones?.office ||
                             ocrData.phone;

        if (whatsappPhone) {
          // Format phone number with country code
          let cleanPhone = whatsappPhone.replace(/[^+\d]/g, '');

          if (cleanPhone.startsWith('01')) {
            cleanPhone = '60' + cleanPhone.substring(1);
          } else if (cleanPhone.startsWith('0')) {
            cleanPhone = '60' + cleanPhone.substring(1);
          } else if (!cleanPhone.startsWith('60') && !cleanPhone.startsWith('+')) {
            cleanPhone = '60' + cleanPhone;
          } else if (cleanPhone.startsWith('+')) {
            cleanPhone = cleanPhone.substring(1);
          }

          const introMessage = `Hi ${ocrData.name}! Nice meeting you. Let's stay connected!`;
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(introMessage)}`;

          // Show quick success before opening WhatsApp
          setTimeout(() => {
            Alert.alert(
              'Contact Saved!',
              `${newContact.name} has been added to your contacts.`,
              [{ text: 'OK' }],
              { cancelable: true }
            );
          }, 100);

          // Open WhatsApp
          setTimeout(async () => {
            try {
              const canOpen = await Linking.canOpenURL(whatsappUrl);
              if (canOpen) {
                await Linking.openURL(whatsappUrl);
              }
            } catch (error) {
              console.error('Failed to open WhatsApp:', error);
            }
          }, 500);
        } else {
          Alert.alert('Success', `Contact "${newContact.name}" saved! No phone number found for WhatsApp.`);
        }
      } else {
        // Just show success if not auto-WhatsApp
        Alert.alert('Success', `Contact "${newContact.name}" saved successfully!`);
      }

      // Update local state
      setContacts(prev => [newContact, ...prev]);

    } catch (error) {
      console.error('❌ Auto-process failed:', error);
      Alert.alert(
        'Processing Failed',
        'Failed to process the business card. Please try manual mode.',
        [{ text: 'OK' }]
      );
    }
  };

  // Camera Stack Navigator
  function CameraStack() {
    const CameraStackNavigator = createStackNavigator();

    return (
      <CameraStackNavigator.Navigator screenOptions={{ headerShown: false }}>
        <CameraStackNavigator.Screen name="CameraMain">
          {({ navigation }) => (
            <CameraScreen
              onScanCard={handleScanCard}
              onNavigateToForm={async (imageUri, processOCR) => {
                // Check if auto mode is enabled
                const settings = await AsyncStorage.getItem('appSettings');
                const parsed = settings ? JSON.parse(settings) : {};

                if (parsed.autoWhatsApp || parsed.skipReview) {
                  // Auto mode: process in background
                  handleAutoProcess(imageUri);
                } else {
                  // Normal mode: navigate to form
                  handleNavigateToForm(imageUri, processOCR);
                  navigation.navigate('ContactForm');
                }
              }}
              onNavigateToSettings={() => navigation.navigate('Settings')}
            />
          )}
        </CameraStackNavigator.Screen>
        <CameraStackNavigator.Screen name="ContactForm">
          {({ navigation }) => (
            <ContactForm
              scannedData={scannedCardData}
              imageUri={pendingImageUri}
              processOCR={shouldProcessOCR}
              onSave={async (contactData) => {
                await handleSaveContact(contactData);
                // Navigate back to camera after saving
                navigation.navigate('CameraMain');
              }}
              onBack={() => {
                setPendingImageUri(undefined);
                setShouldProcessOCR(false);
                navigation.goBack();
              }}
            />
          )}
        </CameraStackNavigator.Screen>
        <CameraStackNavigator.Screen name="Settings">
          {({ navigation }) => (
            <SettingsScreen
              onBack={() => navigation.goBack()}
            />
          )}
        </CameraStackNavigator.Screen>
      </CameraStackNavigator.Navigator>
    );
  }

  // Contacts Stack Navigator
  function ContactsStack() {
    const ContactsNavigator = createStackNavigator();

    return (
      <ContactsNavigator.Navigator screenOptions={{ headerShown: false }}>
        <ContactsNavigator.Screen name="ContactList">
          {() => (
            <ContactList
              contacts={contacts}
              onContactSelect={handleContactSelect}
              onAddContact={() => {
                // Navigate to Camera tab
                // Note: This requires access to navigation prop from parent
                console.log('Navigate to Add Contact');
              }}
              onDeleteContacts={handleBulkContactDelete}
            />
          )}
        </ContactsNavigator.Screen>
      </ContactsNavigator.Navigator>
    );
  }

  // Profile Stack Navigator
  function ProfileStack() {
    return (
      <ProfileScreen
        user={currentUser}
        onLogout={async () => {
          await SupabaseService.signOut();
          setIsAuthenticated(false);
          setCurrentUser(null);
          setContacts([]);
        }}
      />
    );
  }

  // Handle successful authentication
  const handleAuthSuccess = async (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);

    // Initialize app after authentication
    await SupabaseService.initializeStorage();
    await loadContacts();
    setupRealtimeSync();
  };

  // Show splash screen
  if (showSplash) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  // Show loading screen during initialization
  if (isLoading) {
    return (
      <View style={loadingStyles.container}>
        <StatusBar style="auto" />
        <View style={loadingStyles.content}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={loadingStyles.title}>NAMECARD.MY</Text>
          <Text style={loadingStyles.subtitle}>Initializing...</Text>
        </View>
      </View>
    );
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style="auto" />
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route, navigation }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Camera') {
              iconName = focused ? 'camera' : 'camera-outline';
            } else if (route.name === 'Contacts') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: 4,
            paddingTop: 4,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerShown: false,
          tabBarHideOnKeyboard: true,
        })}
        screenListeners={({ navigation, route }) => ({
          tabPress: (e) => {
            // Handle camera navigation with scanned data
            if (route.name === 'Camera' && scannedCardData) {
              e.preventDefault();
              navigation.navigate('Camera', { 
                screen: 'ContactForm',
              });
            }
          },
        })}
      >
        <Tab.Screen 
          name="Camera" 
          component={CameraStack}
          options={{ title: 'Scan' }}
        />
        <Tab.Screen 
          name="Contacts" 
          component={ContactsStack}
          options={{ 
            title: 'Contacts',
            tabBarBadge: contacts.length > 0 ? contacts.length : undefined,
            tabBarBadgeStyle: {
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: 10,
            }
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileStack}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>

      {/* Contact Detail Modal */}
      <ContactDetailModal
        contact={selectedContact}
        visible={showContactDetail}
        onClose={() => {
          setShowContactDetail(false);
          setSelectedContact(null);
        }}
        onDelete={handleContactDelete}
        onEdit={handleContactEdit}
      />
    </NavigationContainer>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
