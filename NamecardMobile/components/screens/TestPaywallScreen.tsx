/**
 * TestPaywallScreen for WhatsCard
 *
 * Testing interface for subscription paywall
 *
 * Features:
 * - Open paywall modal
 * - Simulate active subscription
 * - Clear subscription (logout)
 * - Toggle mock mode
 * - View current subscription status
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaywallScreen } from './PaywallScreen';
import { useSubscription } from '../../hooks/useSubscription';
import { IAP_CONFIG } from '../../config/iap-config';
import { iapService } from '../../services/iapService';
import {
  formatExpiryDate,
  getDaysUntilExpiry,
  getSubscriptionRenewalMessage,
} from '../../utils/subscription-utils';

export const TestPaywallScreen: React.FC = () => {
  const { subscription, isActive, refreshSubscription, clearSubscription } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [mockMode, setMockMode] = useState(IAP_CONFIG.MOCK_MODE);

  /**
   * Simulate active monthly subscription
   */
  const handleSimulateMonthly = async () => {
    if (!IAP_CONFIG.MOCK_MODE) {
      Alert.alert('⚠️ Not in Mock Mode', 'Enable mock mode to simulate subscriptions');
      return;
    }

    await iapService.setMockSubscription('monthly');
    await refreshSubscription();
    Alert.alert('✅ Success', 'Simulated monthly subscription activated!');
  };

  /**
   * Simulate active yearly subscription
   */
  const handleSimulateYearly = async () => {
    if (!IAP_CONFIG.MOCK_MODE) {
      Alert.alert('⚠️ Not in Mock Mode', 'Enable mock mode to simulate subscriptions');
      return;
    }

    await iapService.setMockSubscription('yearly');
    await refreshSubscription();
    Alert.alert('✅ Success', 'Simulated yearly subscription activated!');
  };

  /**
   * Clear subscription
   */
  const handleClearSubscription = async () => {
    Alert.alert(
      'Clear Subscription?',
      'This will remove the current subscription (for testing)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearSubscription();
            Alert.alert('✅ Cleared', 'Subscription has been cleared');
          },
        },
      ]
    );
  };

  /**
   * Toggle mock mode (requires app restart in reality)
   */
  const handleToggleMockMode = () => {
    Alert.alert(
      'Toggle Mock Mode',
      `Mock mode is currently ${mockMode ? 'ENABLED' : 'DISABLED'}.\n\nTo change this, update MOCK_MODE in config/iap-config.ts and restart the app.`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Handle paywall success
   */
  const handlePaywallSuccess = async () => {
    setShowPaywall(false);
    await refreshSubscription();
    Alert.alert('🎉 Welcome to Premium!', 'Your subscription is now active.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="flask" size={32} color="#4A7A5C" />
          <Text style={styles.headerTitle}>Paywall Test Screen</Text>
        </View>

        {/* Mock Mode Indicator */}
        <View style={[styles.card, mockMode ? styles.cardSuccess : styles.cardWarning]}>
          <View style={styles.cardHeader}>
            <Ionicons
              name={mockMode ? 'checkmark-circle' : 'alert-circle'}
              size={24}
              color={mockMode ? '#10B981' : '#F59E0B'}
            />
            <Text style={styles.cardTitle}>
              Mock Mode: {mockMode ? 'ENABLED' : 'DISABLED'}
            </Text>
          </View>
          <Text style={styles.cardDescription}>
            {mockMode
              ? 'Using mock IAP data - perfect for testing UI and flow'
              : 'Using real IAP - requires production build and real purchases'}
          </Text>
          <TouchableOpacity style={styles.cardButton} onPress={handleToggleMockMode}>
            <Text style={styles.cardButtonText}>Change Mock Mode</Text>
          </TouchableOpacity>
        </View>

        {/* Current Subscription Status */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current Subscription Status</Text>

          {subscription ? (
            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Plan:</Text>
                <Text style={styles.statusValue}>
                  {subscription.plan === 'monthly' ? 'Monthly' : 'Yearly'} Premium
                </Text>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                <View style={[styles.statusBadge, isActive ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
                  <Text style={styles.statusBadgeText}>
                    {isActive ? '✅ ACTIVE' : '❌ INACTIVE'}
                  </Text>
                </View>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Purchased:</Text>
                <Text style={styles.statusValue}>
                  {formatExpiryDate(subscription.purchaseDate)}
                </Text>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Expires:</Text>
                <Text style={styles.statusValue}>
                  {formatExpiryDate(subscription.expiryDate)}
                </Text>
              </View>

              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Days Left:</Text>
                <Text style={styles.statusValue}>
                  {getDaysUntilExpiry(subscription)} days
                </Text>
              </View>

              {subscription.isPromo && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Promo Code:</Text>
                  <Text style={[styles.statusValue, styles.promoCode]}>
                    {subscription.promoCode}
                  </Text>
                </View>
              )}

              <View style={styles.renewalMessage}>
                <Text style={styles.renewalText}>
                  {getSubscriptionRenewalMessage(subscription)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noSubscription}>
              <Ionicons name="information-circle" size={48} color="#9CA3AF" />
              <Text style={styles.noSubscriptionText}>No active subscription</Text>
              <Text style={styles.noSubscriptionSubtext}>
                Test the paywall by clicking "Open Paywall" below
              </Text>
            </View>
          )}
        </View>

        {/* Test Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Test Actions</Text>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => setShowPaywall(true)}
          >
            <Ionicons name="diamond" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Open Paywall</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleSimulateMonthly}
            disabled={!mockMode}
          >
            <Ionicons name="calendar" size={20} color={mockMode ? '#4A7A5C' : '#9CA3AF'} />
            <Text style={[styles.actionButtonTextSecondary, !mockMode && styles.actionButtonDisabled]}>
              Simulate Monthly Subscription
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleSimulateYearly}
            disabled={!mockMode}
          >
            <Ionicons name="calendar" size={20} color={mockMode ? '#4A7A5C' : '#9CA3AF'} />
            <Text style={[styles.actionButtonTextSecondary, !mockMode && styles.actionButtonDisabled]}>
              Simulate Yearly Subscription
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleClearSubscription}
            disabled={!subscription}
          >
            <Ionicons name="trash" size={20} color={subscription ? '#EF4444' : '#9CA3AF'} />
            <Text style={[styles.actionButtonTextDanger, !subscription && styles.actionButtonDisabled]}>
              Clear Subscription (Logout)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Testing Instructions</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>
              Click "Open Paywall" to test the subscription UI
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>
              Try selecting different plans (monthly/yearly)
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>
              Enter promo code "WHATSBNI" for 70% off yearly
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4.</Text>
            <Text style={styles.instructionText}>
              Complete mock purchase - it will simulate subscription
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>5.</Text>
            <Text style={styles.instructionText}>
              Use "Simulate" buttons to test different subscription states
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Paywall Modal */}
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <PaywallScreen
          onClose={() => setShowPaywall(false)}
          onSuccess={handlePaywallSuccess}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statusContainer: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  promoCode: {
    color: '#10B981',
    fontWeight: '700',
  },
  renewalMessage: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  renewalText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
    textAlign: 'center',
  },
  noSubscription: {
    alignItems: 'center',
    padding: 32,
  },
  noSubscriptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  noSubscriptionSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonPrimary: {
    backgroundColor: '#4A7A5C',
  },
  actionButtonSecondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  actionButtonDanger: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A7A5C',
    marginLeft: 8,
  },
  actionButtonTextDanger: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 8,
  },
  actionButtonDisabled: {
    color: '#9CA3AF',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A7A5C',
    marginRight: 12,
    width: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});

console.log('[TestPaywallScreen] ✅ Test screen component defined');
