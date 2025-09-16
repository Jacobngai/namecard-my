import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Contact } from '../types';
import { ContactService } from '../services/contactService';

const { width } = Dimensions.get('window');

interface ContactDetailModalProps {
  contact: Contact | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (contactId: string) => void;
  onEdit: (contact: Contact) => void;
}

export function ContactDetailModal({
  contact,
  visible,
  onClose,
  onDelete,
  onEdit,
}: ContactDetailModalProps) {
  if (!contact) return null;

  const handleCall = async (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to make phone call');
    }
  };

  const handleEmail = async () => {
    if (!contact.email) return;
    const url = `mailto:${contact.email}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open email client');
    }
  };

  const handleWhatsApp = async (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/[^+\d]/g, '');
    const message = `Hi ${contact.name}! Nice connecting with you.`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      // Update last contact timestamp
      try {
        await ContactService.updateContact(contact.id, {
          lastContact: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Failed to update last contact:', error);
      }
    } else {
      Alert.alert('Error', 'WhatsApp is not installed');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ContactService.deleteContact(contact.id);
              onDelete(contact.id);
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => onEdit(contact)}
              style={styles.headerButton}
            >
              <Ionicons name="create-outline" size={24} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.headerButton, { marginLeft: 12 }]}
            >
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Business Card Image */}
          {contact.imageUrl && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: contact.imageUrl }}
                style={styles.cardImage}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Contact Info */}
          <View style={styles.infoSection}>
            <Text style={styles.name}>{contact.name || 'No Name'}</Text>
            {contact.jobTitle && (
              <Text style={styles.jobTitle}>{contact.jobTitle}</Text>
            )}
            {contact.company && (
              <Text style={styles.company}>{contact.company}</Text>
            )}
          </View>

          {/* Phone Numbers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phone Numbers</Text>

            {/* Primary Phone */}
            {contact.phone && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => handleCall(contact.phone)}
              >
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{contact.phone}</Text>
                <TouchableOpacity
                  onPress={() => handleWhatsApp(contact.phone)}
                  style={styles.actionButton}
                >
                  <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}

            {/* Mobile 1 */}
            {contact.phones?.mobile1 && contact.phones.mobile1 !== contact.phone && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => handleCall(contact.phones.mobile1!)}
              >
                <Ionicons name="phone-portrait-outline" size={20} color="#6B7280" />
                <View style={styles.phoneInfo}>
                  <Text style={styles.infoText}>{contact.phones.mobile1}</Text>
                  <Text style={styles.phoneLabel}>Mobile 1</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleWhatsApp(contact.phones.mobile1!)}
                  style={styles.actionButton}
                >
                  <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}

            {/* Mobile 2 */}
            {contact.phones?.mobile2 && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => handleCall(contact.phones.mobile2)}
              >
                <Ionicons name="phone-portrait-outline" size={20} color="#6B7280" />
                <View style={styles.phoneInfo}>
                  <Text style={styles.infoText}>{contact.phones.mobile2}</Text>
                  <Text style={styles.phoneLabel}>Mobile 2</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleWhatsApp(contact.phones.mobile2)}
                  style={styles.actionButton}
                >
                  <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}

            {/* Office */}
            {contact.phones?.office && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => handleCall(contact.phones.office)}
              >
                <Ionicons name="business-outline" size={20} color="#6B7280" />
                <View style={styles.phoneInfo}>
                  <Text style={styles.infoText}>{contact.phones.office}</Text>
                  <Text style={styles.phoneLabel}>Office</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Fax */}
            {contact.phones?.fax && (
              <View style={styles.infoRow}>
                <Ionicons name="print-outline" size={20} color="#6B7280" />
                <View style={styles.phoneInfo}>
                  <Text style={styles.infoText}>{contact.phones.fax}</Text>
                  <Text style={styles.phoneLabel}>Fax</Text>
                </View>
              </View>
            )}

            {/* No phone numbers */}
            {!contact.phone && !contact.phones?.mobile1 && !contact.phones?.mobile2 &&
             !contact.phones?.office && !contact.phones?.fax && (
              <Text style={styles.noInfo}>No phone numbers available</Text>
            )}
          </View>

          {/* Email */}
          {contact.email && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Email</Text>
              <TouchableOpacity style={styles.infoRow} onPress={handleEmail}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{contact.email}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Address */}
          {contact.address && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address</Text>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#6B7280" />
                <Text style={[styles.infoText, { flex: 1 }]}>{contact.address}</Text>
              </View>
            </View>
          )}

          {/* Metadata */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Added:</Text>
              <Text style={styles.metaValue}>{contact.addedDate}</Text>
            </View>
            {contact.lastContact && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Last Contact:</Text>
                <Text style={styles.metaValue}>
                  {new Date(contact.lastContact).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: width - 32,
    height: (width - 32) * 0.6,
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 2,
  },
  company: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  phoneInfo: {
    flex: 1,
    marginLeft: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  phoneLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  actionButton: {
    padding: 8,
  },
  noInfo: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  metaValue: {
    fontSize: 14,
    color: '#111827',
  },
});