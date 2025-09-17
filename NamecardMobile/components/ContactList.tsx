import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Contact } from '../types';
import { ContactService } from '../services/contactService';
import { FloatingActionButton } from './FloatingActionButton';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ContactListProps {
  contacts: Contact[];
  onContactSelect: (contact: Contact) => void;
  onAddContact: () => void;
  onDeleteContacts?: (contactIds: string[]) => void;
}

export function ContactList({ contacts, onContactSelect, onAddContact, onDeleteContacts }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactPress = (contact: Contact) => {
    if (isSelectMode) {
      if (selectedContacts.includes(contact.id)) {
        setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
      } else {
        setSelectedContacts([...selectedContacts, contact.id]);
      }
    } else {
      onContactSelect(contact);
    }
  };

  const handleLongPress = (contact: Contact) => {
    setIsSelectMode(true);
    setSelectedContacts([contact.id]);
  };

  const handleWhatsApp = async (contact: Contact) => {
    try {
      const cleanPhone = contact.phone.replace(/[^+\d]/g, '');
      const introMessage = `Hi ${contact.name}! Nice meeting you. Let's stay connected!`;
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(introMessage)}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        // Open WhatsApp
        await Linking.openURL(whatsappUrl);
        
        // Update last contact timestamp (offline-first)
        try {
          await ContactService.updateContact(contact.id, {
            lastContact: new Date().toISOString()
          });
          console.log('✅ Last contact timestamp updated for:', contact.name);
        } catch (updateError) {
          console.warn('⚠️ Failed to update last contact timestamp:', updateError);
          // Don't show error to user as WhatsApp opened successfully
        }
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device');
      }
    } catch (error) {
      console.error('❌ WhatsApp integration failed:', error);
      Alert.alert('Error', 'Failed to open WhatsApp');
    }
  };

  const handleExportExcel = async () => {
    try {
      const selectedContactsData = contacts.filter(c => selectedContacts.includes(c.id));

      // Create CSV content
      const csvHeader = 'Name,Job Title,Company,Email,Phone,Mobile 2,Address,Website,Notes\n';
      const csvRows = selectedContactsData.map(contact => {
        const row = [
          contact.name || '',
          contact.jobTitle || '',
          contact.company || '',
          contact.email || '',
          contact.phones?.mobile1 || contact.phone || '',
          contact.phones?.mobile2 || '',
          contact.address || '',
          contact.website || '',
          contact.notes || ''
        ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');
        return row;
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      // Save to file
      const filename = `contacts_export_${new Date().getTime()}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Contacts',
        });
      } else {
        Alert.alert('Success', `Exported ${selectedContacts.length} contacts to ${filename}`);
      }

      setIsSelectMode(false);
      setSelectedContacts([]);
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Error', 'Failed to export contacts');
    }
  };

  const handleDeleteContacts = () => {
    Alert.alert(
      'Delete Contacts',
      `Are you sure you want to delete ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDeleteContacts) {
              onDeleteContacts(selectedContacts);
            }
            setIsSelectMode(false);
            setSelectedContacts([]);
          },
        },
      ]
    );
  };

  const handleAddToGroup = () => {
    Alert.alert('Add to Group', `Adding ${selectedContacts.length} contacts to group...`);
    // TODO: Implement group functionality
    setIsSelectMode(false);
    setSelectedContacts([]);
  };

  const handleShareMyCard = () => {
    Alert.alert('Share My Card', 'Sharing your business card...');
    // TODO: Implement share functionality
  };

  const handleAddManually = () => {
    onAddContact();
  };

  const handleScanCard = () => {
    onAddContact();
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedContacts([]);
  };

  const renderContact = ({ item: contact }: { item: Contact }) => (
    <TouchableOpacity
      style={[
        styles.contactCard,
        selectedContacts.includes(contact.id) && styles.selectedCard
      ]}
      onPress={() => handleContactPress(contact)}
      onLongPress={() => handleLongPress(contact)}
      activeOpacity={0.7}
    >
      {/* Selection checkbox */}
      {isSelectMode && (
        <View style={styles.checkbox}>
          <View style={[
            styles.checkboxInner,
            selectedContacts.includes(contact.id) && styles.checkboxSelected
          ]}>
            {selectedContacts.includes(contact.id) && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </View>
        </View>
      )}

      {/* Business card thumbnail */}
      <View style={styles.cardThumbnail}>
        <Image
          source={{ uri: contact.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      </View>

      {/* Contact info */}
      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>
          {contact.name}
        </Text>
        {contact.jobTitle && (
          <Text style={styles.contactJobTitle} numberOfLines={1}>
            {contact.jobTitle}
          </Text>
        )}
        <Text style={styles.contactCompany} numberOfLines={1}>
          {contact.company}
        </Text>
        <Text style={styles.contactPhone} numberOfLines={1}>
          {contact.phones?.mobile1 || contact.phone}
        </Text>
        {contact.phones?.mobile2 && (
          <Text style={styles.contactPhone2} numberOfLines={1}>
            {contact.phones.mobile2}
          </Text>
        )}
      </View>

      {/* WhatsApp button */}
      {!isSelectMode && (
        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={() => handleWhatsApp(contact)}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="people-outline" size={48} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No contacts yet</Text>
      <Text style={styles.emptyText}>
        Scan your first business card to get started
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {isSelectMode ? (
          <>
            <TouchableOpacity onPress={exitSelectMode}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {selectedContacts.length} selected
            </Text>
            <TouchableOpacity onPress={handleSelectAll}>
              <Text style={styles.selectAllText}>
                {selectedContacts.length === filteredContacts.length ? 'Unselect all' : 'Select all'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity>
              <Ionicons name="menu" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Contacts</Text>
            <TouchableOpacity
              onPress={() => {
                setIsSelectMode(true);
              }}
            >
              <Text style={styles.selectText}>Select</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Search bar and filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search cards"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Filter pills */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterPill}>
          <Ionicons name="filter" size={16} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterPill}>
          <Text style={styles.filterText}>Sort by</Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterPill}>
          <Ionicons name="add" size={16} color="#6B7280" />
          <Text style={styles.filterText}>New Group</Text>
        </TouchableOpacity>
      </View>

      {/* Contact count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>{filteredContacts.length} cards</Text>
        {isSelectMode && selectedContacts.length === 0 && (
          <TouchableOpacity onPress={handleSelectAll}>
            <Text style={styles.selectAllLink}>Select all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contact list */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={filteredContacts.length === 0 ? styles.emptyContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        isSelectMode={isSelectMode}
        selectedCount={selectedContacts.length}
        onExport={handleExportExcel}
        onDelete={handleDeleteContacts}
        onAddToGroup={handleAddToGroup}
        onShareMyCard={handleShareMyCard}
        onAddManually={handleAddManually}
        onScanCard={handleScanCard}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  cancelText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  selectText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  selectAllLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  countText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardThumbnail: {
    marginRight: 12,
  },
  cardImage: {
    width: 56,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  contactJobTitle: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  contactCompany: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  contactPhone2: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  whatsappButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
  },
});