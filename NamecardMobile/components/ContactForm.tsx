import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Contact } from '../types';
import { TopLoader } from './TopLoader';
import { GoogleVisionService } from '../services/googleVision';

interface ContactFormProps {
  scannedData: Partial<Contact> | null;
  imageUri?: string;
  processOCR?: boolean;
  onSave: (contactData: Partial<Contact>) => void;
  onBack: () => void;
}

export function ContactForm({ scannedData, imageUri, processOCR, onSave, onBack }: ContactFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: scannedData?.name || '',
    jobTitle: scannedData?.jobTitle || '',
    company: scannedData?.company || '',
    phone: scannedData?.phone || '',
    phones: {
      mobile1: scannedData?.phones?.mobile1 || '',
      mobile2: scannedData?.phones?.mobile2 || '',
      office: scannedData?.phones?.office || '',
      fax: scannedData?.phones?.fax || '',
    },
    email: scannedData?.email || '',
    address: scannedData?.address || '',
  });
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [currentImageUri, setCurrentImageUri] = useState(imageUri || scannedData?.imageUrl || '');

  useEffect(() => {
    if (imageUri && processOCR) {
      performOCR();
    }
  }, [imageUri, processOCR]);

  const performOCR = async () => {
    if (!imageUri) return;

    setIsProcessingOCR(true);
    setOcrProgress(0.2);

    try {
      console.log('🔍 Starting background OCR processing...');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setOcrProgress(prev => Math.min(prev + 0.1, 0.8));
      }, 200);

      // Process OCR
      const ocrData = await GoogleVisionService.processBusinessCard(imageUri);

      clearInterval(progressInterval);
      setOcrProgress(0.9);

      // Animate field updates
      if (ocrData.name) {
        setFormData(prev => ({ ...prev, name: ocrData.name || '' }));
      }
      await new Promise(resolve => setTimeout(resolve, 100));

      if (ocrData.jobTitle) {
        setFormData(prev => ({ ...prev, jobTitle: ocrData.jobTitle || '' }));
      }
      await new Promise(resolve => setTimeout(resolve, 100));

      if (ocrData.company) {
        setFormData(prev => ({ ...prev, company: ocrData.company || '' }));
      }
      await new Promise(resolve => setTimeout(resolve, 100));

      // Handle multiple phone numbers
      if (ocrData.phones) {
        setFormData(prev => ({
          ...prev,
          phone: ocrData.phone || '',
          phones: {
            mobile1: ocrData.phones?.mobile1 || '',
            mobile2: ocrData.phones?.mobile2 || '',
            office: ocrData.phones?.office || '',
            fax: ocrData.phones?.fax || '',
          }
        }));
      } else if (ocrData.phone) {
        setFormData(prev => ({ ...prev, phone: ocrData.phone || '' }));
      }
      await new Promise(resolve => setTimeout(resolve, 100));

      if (ocrData.email) {
        setFormData(prev => ({ ...prev, email: ocrData.email || '' }));
      }
      await new Promise(resolve => setTimeout(resolve, 100));

      if (ocrData.address) {
        setFormData(prev => ({ ...prev, address: ocrData.address || '' }));
      }

      setOcrProgress(1);
      console.log('✅ OCR processing completed:', ocrData);

      // Hide loader after a brief moment
      setTimeout(() => {
        setIsProcessingOCR(false);
      }, 500);

    } catch (error) {
      console.error('❌ OCR processing failed:', error);
      setOcrProgress(1);
      setTimeout(() => {
        setIsProcessingOCR(false);
      }, 500);

      // Don't show error alert - user can still manually enter data
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (phoneType: 'mobile1' | 'mobile2' | 'office' | 'fax', value: string) => {
    setFormData(prev => ({
      ...prev,
      phones: {
        ...prev.phones,
        [phoneType]: value,
      },
      // Update primary phone if it's the first mobile number
      ...(phoneType === 'mobile1' ? { phone: value } : {})
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    setIsSaving(true);
    try {
      await onSave({ ...formData, imageUrl: currentImageUri, phones: formData.phones });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsAppIntro = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    // Get the primary phone number (prioritize mobile1, then mobile2, then office, then phone)
    const whatsappPhone = formData.phones.mobile1 ||
                          formData.phones.mobile2 ||
                          formData.phones.office ||
                          formData.phone;

    if (!whatsappPhone?.trim()) {
      Alert.alert('Error', 'Please enter a phone number for WhatsApp');
      return;
    }

    try {
      // Clean phone number (remove spaces, dashes, etc.)
      let cleanPhone = whatsappPhone.replace(/[^+\d]/g, '');

      // Add Malaysian country code if not present
      if (cleanPhone.startsWith('01')) {
        // Malaysian mobile number starting with 01, replace 0 with 60
        cleanPhone = '60' + cleanPhone.substring(1);
      } else if (cleanPhone.startsWith('0')) {
        // Other Malaysian numbers starting with 0, replace 0 with 60
        cleanPhone = '60' + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith('60') && !cleanPhone.startsWith('+')) {
        // Number without country code, assume Malaysian
        cleanPhone = '60' + cleanPhone;
      } else if (cleanPhone.startsWith('+')) {
        // Remove + sign for WhatsApp URL
        cleanPhone = cleanPhone.substring(1);
      }

      // Default introduction message
      const introMessage = `Hi ${formData.name}! Nice meeting you. Let's stay connected!`;

      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(introMessage)}`;

      // Check if WhatsApp can be opened
      const canOpen = await Linking.canOpenURL(whatsappUrl);

      if (canOpen) {
        // Save the contact first
        await handleSave();
        // Then open WhatsApp
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open WhatsApp');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Loader Bar */}
      <TopLoader isLoading={isProcessingOCR} progress={ocrProgress} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Business card image */}
        {currentImageUri && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: currentImageUri }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            {isProcessingOCR && (
              <View style={styles.ocrOverlay}>
                <Text style={styles.ocrText}>Extracting information...</Text>
              </View>
            )}
          </View>
        )}

        {/* Form fields */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Input
              label="Name *"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder={isProcessingOCR ? "Extracting..." : "Enter name"}
            />
            {isProcessingOCR && !formData.name && (
              <ActivityIndicator size="small" color="#2563EB" style={styles.fieldLoader} />
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Input
              label="Job Title"
              value={formData.jobTitle}
              onChangeText={(text) => handleInputChange('jobTitle', text)}
              placeholder={isProcessingOCR ? "Extracting..." : "Enter job title"}
            />
            {isProcessingOCR && !formData.jobTitle && (
              <ActivityIndicator size="small" color="#2563EB" style={styles.fieldLoader} />
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Input
              label="Company"
              value={formData.company}
              onChangeText={(text) => handleInputChange('company', text)}
              placeholder={isProcessingOCR ? "Extracting..." : "Enter company"}
            />
            {isProcessingOCR && !formData.company && (
              <ActivityIndicator size="small" color="#2563EB" style={styles.fieldLoader} />
            )}
          </View>

          {/* Show multiple phone fields if any are detected */}
          {(formData.phones.mobile1 || formData.phones.mobile2 || formData.phones.office || formData.phones.fax) ? (
            <>
              {formData.phones.mobile1 && (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Mobile 1"
                    value={formData.phones.mobile1}
                    onChangeText={(text) => handlePhoneChange('mobile1', text)}
                    placeholder="Enter mobile number"
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              {formData.phones.mobile2 && (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Mobile 2"
                    value={formData.phones.mobile2}
                    onChangeText={(text) => handlePhoneChange('mobile2', text)}
                    placeholder="Enter second mobile number"
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              {formData.phones.office && (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Office"
                    value={formData.phones.office}
                    onChangeText={(text) => handlePhoneChange('office', text)}
                    placeholder="Enter office number"
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              {formData.phones.fax && (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Fax"
                    value={formData.phones.fax}
                    onChangeText={(text) => handlePhoneChange('fax', text)}
                    placeholder="Enter fax number"
                    keyboardType="phone-pad"
                  />
                </View>
              )}
            </>
          ) : (
            <View style={styles.inputWrapper}>
              <Input
                label="Phone"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                placeholder={isProcessingOCR ? "Extracting..." : "Enter phone number"}
                keyboardType="phone-pad"
              />
              {isProcessingOCR && !formData.phone && (
                <ActivityIndicator size="small" color="#2563EB" style={styles.fieldLoader} />
              )}
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Input
              label="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder={isProcessingOCR ? "Extracting..." : "Enter email"}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {isProcessingOCR && !formData.email && (
              <ActivityIndicator size="small" color="#2563EB" style={styles.fieldLoader} />
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Input
              label="Address"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              placeholder={isProcessingOCR ? "Extracting..." : "Enter address"}
            />
            {isProcessingOCR && !formData.address && (
              <ActivityIndicator size="small" color="#2563EB" style={styles.fieldLoader} />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.actions}>
        <Button
          title={isSaving ? "Sending..." : "Send WhatsApp Intro"}
          onPress={handleWhatsAppIntro}
          disabled={!formData.name.trim() || isSaving}
          style={styles.primaryButton}
        />

        <Button
          title={isSaving ? "Saving..." : "Save Contact"}
          onPress={handleSave}
          variant="outline"
          disabled={!formData.name.trim() || isSaving}
          style={styles.secondaryButton}
        />
        
        <Text style={styles.saveNote}>
          Contact will be saved automatically
        </Text>
      </View>
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
    width: 32, // Same width as back button for centering
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardImage: {
    width: 280,
    height: 176,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  form: {
    paddingBottom: 20,
  },
  actions: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    marginBottom: 8,
  },
  saveNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputWrapper: {
    position: 'relative',
  },
  fieldLoader: {
    position: 'absolute',
    right: 16,
    top: 36,
  },
  ocrOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  ocrText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});