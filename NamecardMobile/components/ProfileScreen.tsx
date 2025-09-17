import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { APITestScreen } from './APITestScreen';
import { Logo } from './Logo';

interface ProfileScreenProps {
  user?: any;
  onLogout?: () => void;
}

export function ProfileScreen({ user, onLogout }: ProfileScreenProps) {
  const [introMessage, setIntroMessage] = useState(
    "Hi! Nice meeting you. Let's stay connected!"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showAPITest, setShowAPITest] = useState(false);

  const handleSaveIntro = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Introduction message updated');
  };

  const handleUpgrade = () => {
    Alert.alert('Upgrade', 'Premium subscription coming soon!');
  };

  // Show API test screen if requested
  if (showAPITest) {
    return <APITestScreen onBack={() => setShowAPITest(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#2563EB" />
            </View>
            <Text style={styles.userName}>{user?.user_metadata?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Not logged in'}</Text>
            
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Ionicons name="diamond" size={16} color="#FFFFFF" />
              <Text style={styles.upgradeText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WhatsApp Introduction Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WhatsApp Introduction</Text>
          <Text style={styles.sectionDescription}>
            This message will be sent when you introduce yourself to new contacts
          </Text>
          
          <View style={styles.introCard}>
            {isEditing ? (
              <View>
                <Input
                  value={introMessage}
                  onChangeText={setIntroMessage}
                  placeholder="Enter your introduction message"
                  style={styles.introInput}
                />
                <View style={styles.introActions}>
                  <Button
                    title="Cancel"
                    onPress={() => setIsEditing(false)}
                    variant="outline"
                    style={styles.cancelButton}
                  />
                  <Button
                    title="Save"
                    onPress={handleSaveIntro}
                    style={styles.saveButton}
                  />
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.introMessage}>{introMessage}</Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="pencil" size={16} color="#2563EB" />
                  <Text style={styles.editText}>Edit Message</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color="#374151" />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#374151" />
                <Text style={styles.settingText}>Privacy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="document-text-outline" size={20} color="#374151" />
                <Text style={styles.settingText}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem} onPress={() => setShowAPITest(true)}>
              <View style={styles.settingLeft}>
                <Ionicons name="cog-outline" size={20} color="#2563EB" />
                <Text style={[styles.settingText, { color: '#2563EB' }]}>API Integration Tests</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#2563EB" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="help-circle-outline" size={20} color="#374151" />
                <Text style={styles.settingText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {onLogout && (
              <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]} onPress={onLogout}>
                <View style={styles.settingLeft}>
                  <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                  <Text style={[styles.settingText, { color: '#DC2626' }]}>Sign Out</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Logo width={60} height={60} style={{ marginBottom: 8 }} />
            <Text style={styles.appName}>NAMECARD.MY</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  introMessage: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  introInput: {
    marginBottom: 12,
  },
  introActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  editText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});