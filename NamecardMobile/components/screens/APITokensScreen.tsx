import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Clipboard,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { APITokenService, APIToken } from '../../services/apiTokenService';

export function APITokensScreen() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<APIToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenResult, setNewTokenResult] = useState<{
    token: string;
    tokenPrefix: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadTokens();
    }
  }, [user]);

  async function loadTokens() {
    try {
      setLoading(true);
      if (user) {
        const data = await APITokenService.listTokens(user.id);
        setTokens(data);
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
      Alert.alert('Error', 'Failed to load API tokens');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadTokens();
  }

  async function handleCreateToken() {
    if (!newTokenName.trim()) {
      Alert.alert('Error', 'Please enter a token name');
      return;
    }

    try {
      setLoading(true);
      if (user) {
        const result = await APITokenService.generateToken(
          user.id,
          newTokenName.trim(),
          ['read:contacts', 'write:contacts', 'read:interactions', 'write:interactions']
        );

        setNewTokenResult(result);
        setNewTokenName('');
        setShowCreateModal(false);
        await loadTokens();
      }
    } catch (error) {
      console.error('Failed to create token:', error);
      Alert.alert('Error', 'Failed to create API token');
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeToken(tokenId: string, tokenName: string) {
    Alert.alert(
      'Revoke Token?',
      `Are you sure you want to revoke "${tokenName}"? Apps using this token will stop working immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user) {
                await APITokenService.revokeToken(user.id, tokenId);
                await loadTokens();
                Alert.alert('Success', 'Token revoked successfully');
              }
            } catch (error) {
              console.error('Failed to revoke token:', error);
              Alert.alert('Error', 'Failed to revoke token');
            }
          },
        },
      ]
    );
  }

  async function handleDeleteToken(tokenId: string, tokenName: string) {
    Alert.alert(
      'Delete Token?',
      `Are you sure you want to permanently delete "${tokenName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user) {
                await APITokenService.deleteToken(user.id, tokenId);
                await loadTokens();
                Alert.alert('Success', 'Token deleted successfully');
              }
            } catch (error) {
              console.error('Failed to delete token:', error);
              Alert.alert('Error', 'Failed to delete token');
            }
          },
        },
      ]
    );
  }

  function copyToClipboard(text: string) {
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Token copied to clipboard');
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading API tokens...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>API Tokens</Text>
        <Text style={styles.subtitle}>
          Generate tokens for programmatic access to your WhatsCard data
        </Text>
      </View>

      {/* Create Token Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.createButtonText}>+ Create New Token</Text>
      </TouchableOpacity>

      {/* Token List */}
      <ScrollView
        style={styles.tokenList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {tokens.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No API tokens yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create a token to start using the WhatsCard API
            </Text>
          </View>
        ) : (
          tokens.map((token) => (
            <View
              key={token.id}
              style={[
                styles.tokenCard,
                !token.is_active && styles.tokenCardInactive,
              ]}
            >
              <View style={styles.tokenHeader}>
                <Text style={styles.tokenName}>{token.token_name}</Text>
                {!token.is_active && (
                  <View style={styles.inactiveBadge}>
                    <Text style={styles.inactiveBadgeText}>Inactive</Text>
                  </View>
                )}
              </View>

              <View style={styles.tokenPrefixRow}>
                <Text style={styles.tokenPrefix}>
                  {token.token_prefix}••••••••••••••••
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(token.token_prefix)}
                >
                  <Text style={styles.copyButton}>Copy Prefix</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tokenMeta}>
                <Text style={styles.tokenMetaText}>
                  Created: {formatDate(token.created_at)}
                </Text>
                {token.last_used_at && (
                  <Text style={styles.tokenMetaText}>
                    Last used: {formatDate(token.last_used_at)}
                  </Text>
                )}
                <Text style={styles.tokenMetaText}>
                  Usage: {token.usage_count} times
                </Text>
              </View>

              <View style={styles.tokenScopes}>
                {token.scopes.map((scope) => (
                  <View key={scope} style={styles.scopeBadge}>
                    <Text style={styles.scopeBadgeText}>{scope}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.tokenActions}>
                {token.is_active ? (
                  <TouchableOpacity
                    style={styles.revokeButton}
                    onPress={() => handleRevokeToken(token.id, token.token_name)}
                  >
                    <Text style={styles.revokeButtonText}>Revoke</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteToken(token.id, token.token_name)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Token Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create API Token</Text>
            <Text style={styles.modalSubtitle}>
              Give your token a descriptive name
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g., My Automation Script"
              value={newTokenName}
              onChangeText={setNewTokenName}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleCreateToken}
              >
                <Text style={styles.confirmButtonText}>Create Token</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Token Result Modal */}
      <Modal
        visible={newTokenResult !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNewTokenResult(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Save Your Token</Text>
            <Text style={styles.warningText}>
              This is the ONLY time you'll see this token. Copy it now!
            </Text>

            <View style={styles.tokenDisplay}>
              <Text style={styles.tokenText} selectable>
                {newTokenResult?.token}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.copyFullButton}
              onPress={() => copyToClipboard(newTokenResult?.token || '')}
            >
              <Text style={styles.copyFullButtonText}>📋 Copy Token</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setNewTokenResult(null)}
            >
              <Text style={styles.closeButtonText}>I've Copied It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  createButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tokenList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
  tokenCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tokenCardInactive: {
    opacity: 0.6,
    backgroundColor: '#f9f9f9',
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tokenName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  inactiveBadge: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tokenPrefixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tokenPrefix: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#666',
  },
  copyButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tokenMeta: {
    marginBottom: 10,
  },
  tokenMetaText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  tokenScopes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  scopeBadge: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 5,
    marginBottom: 5,
  },
  scopeBadgeText: {
    color: '#007AFF',
    fontSize: 11,
    fontWeight: '500',
  },
  tokenActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  revokeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
  },
  revokeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#666',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  warningText: {
    fontSize: 14,
    color: '#ff3b30',
    marginBottom: 15,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  tokenDisplay: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  tokenText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  copyFullButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#34C759',
    alignItems: 'center',
    marginBottom: 10,
  },
  copyFullButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
