import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [autoWhatsApp, setAutoWhatsApp] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [skipReview, setSkipReview] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('appSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setAutoWhatsApp(parsed.autoWhatsApp || false);
        setAutoSave(parsed.autoSave !== false); // Default true
        setSkipReview(parsed.skipReview || false);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      const settings = await AsyncStorage.getItem('appSettings');
      const parsed = settings ? JSON.parse(settings) : {};
      parsed[key] = value;
      await AsyncStorage.setItem('appSettings', JSON.stringify(parsed));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleAutoWhatsAppToggle = (value: boolean) => {
    setAutoWhatsApp(value);
    saveSetting('autoWhatsApp', value);

    // If enabling auto WhatsApp, also enable auto save and skip review
    if (value) {
      setAutoSave(true);
      setSkipReview(true);
      saveSetting('autoSave', true);
      saveSetting('skipReview', true);
    }
  };

  const handleAutoSaveToggle = (value: boolean) => {
    setAutoSave(value);
    saveSetting('autoSave', value);

    // If disabling auto save, also disable auto WhatsApp
    if (!value && autoWhatsApp) {
      setAutoWhatsApp(false);
      saveSetting('autoWhatsApp', false);
    }
  };

  const handleSkipReviewToggle = (value: boolean) => {
    setSkipReview(value);
    saveSetting('skipReview', value);

    // If disabling skip review, also disable auto WhatsApp
    if (!value && autoWhatsApp) {
      setAutoWhatsApp(false);
      saveSetting('autoWhatsApp', false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Scanning Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scanning Settings</Text>

          {/* Auto WhatsApp */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Automatic WhatsApp</Text>
              <Text style={styles.settingDescription}>
                Automatically send WhatsApp intro after scanning
              </Text>
              {autoWhatsApp && (
                <View style={styles.badge}>
                  <Ionicons name="flash" size={12} color="#FFFFFF" />
                  <Text style={styles.badgeText}>Fast Mode</Text>
                </View>
              )}
            </View>
            <Switch
              value={autoWhatsApp}
              onValueChange={handleAutoWhatsAppToggle}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Auto Save */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto Save Contacts</Text>
              <Text style={styles.settingDescription}>
                Save contacts automatically after scanning
              </Text>
            </View>
            <Switch
              value={autoSave}
              onValueChange={handleAutoSaveToggle}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Skip Review */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Skip Review Screen</Text>
              <Text style={styles.settingDescription}>
                Process cards without showing the review form
              </Text>
            </View>
            <Switch
              value={skipReview}
              onValueChange={handleSkipReviewToggle}
              trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Workflow Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Current Workflow:</Text>
          {autoWhatsApp ? (
            <View style={styles.workflow}>
              <View style={styles.workflowStep}>
                <Ionicons name="camera" size={20} color="#2563EB" />
                <Text style={styles.workflowText}>Scan Card</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
              <View style={styles.workflowStep}>
                <Ionicons name="document-text" size={20} color="#2563EB" />
                <Text style={styles.workflowText}>OCR Process</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
              <View style={styles.workflowStep}>
                <Ionicons name="save" size={20} color="#2563EB" />
                <Text style={styles.workflowText}>Auto Save</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
              <View style={styles.workflowStep}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={styles.workflowText}>WhatsApp</Text>
              </View>
            </View>
          ) : skipReview ? (
            <View style={styles.workflow}>
              <View style={styles.workflowStep}>
                <Ionicons name="camera" size={20} color="#2563EB" />
                <Text style={styles.workflowText}>Scan Card</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
              <View style={styles.workflowStep}>
                <Ionicons name="document-text" size={20} color="#2563EB" />
                <Text style={styles.workflowText}>OCR Process</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
              <View style={styles.workflowStep}>
                <Ionicons name="save" size={20} color="#2563EB" />
                <Text style={styles.workflowText}>Auto Save</Text>
              </View>
            </View>
          ) : (
            <View style={styles.workflow}>
              <View style={styles.workflowStep}>
                <Ionicons name="camera" size={20} color="#2563EB" />
                <Text style={styles.workflowText}>Scan Card</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
              <View style={styles.workflowStep}>
                <Ionicons name="create" size={20} color="#2563EB" />
                <Text style={styles.workflowText}>Review Form</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
              <View style={styles.workflowStep}>
                <Ionicons name="save" size={20} color="#2563EB" />
                <Text style={styles.workflowText}>Manual Save</Text>
              </View>
            </View>
          )}
        </View>

        {/* Tips */}
        {autoWhatsApp && (
          <View style={styles.tipSection}>
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <Text style={styles.tipText}>
              Fast Mode enabled! Cards will be processed automatically and WhatsApp will open immediately after scanning.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  workflow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  workflowStep: {
    alignItems: 'center',
    marginVertical: 8,
  },
  workflowText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  tipSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    marginLeft: 8,
    lineHeight: 18,
  },
});