import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Group } from '../../types';

interface GroupSelectionModalProps {
  visible: boolean;
  groups: Group[];
  selectedContactCount: number;
  onClose: () => void;
  onSelectGroups: (groupIds: string[]) => void;
  onCreateGroup: (groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'contactCount'>) => Promise<string | void> | void; // Can return created group ID
}

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

const PRESET_ICONS = [
  'people',
  'briefcase',
  'star',
  'heart',
  'home',
  'business',
  'school',
  'medkit',
];

export function GroupSelectionModal({
  visible,
  groups,
  selectedContactCount,
  onClose,
  onSelectGroups,
  onCreateGroup,
}: GroupSelectionModalProps) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(PRESET_COLORS[0]);
  const [newGroupIcon, setNewGroupIcon] = useState(PRESET_ICONS[0]);

  // Debug logging and auto-show create form if no groups
  useEffect(() => {
    if (visible) {
      console.log('📋 GroupSelectionModal opened');
      console.log('📋 Groups available:', groups.length);
      console.log('📋 Selected contacts:', selectedContactCount);

      // Auto-show create form if there are no groups
      if (groups.length === 0) {
        console.log('📋 No groups available, showing create form');
        setShowCreateForm(true);
      }
    }
  }, [visible, groups, selectedContactCount]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedGroupIds([]);
      setShowCreateForm(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupColor(PRESET_COLORS[0]);
      setNewGroupIcon(PRESET_ICONS[0]);
    }
  }, [visible]);

  const handleToggleGroup = (groupId: string) => {
    if (selectedGroupIds.includes(groupId)) {
      setSelectedGroupIds(selectedGroupIds.filter(id => id !== groupId));
    } else {
      setSelectedGroupIds([...selectedGroupIds, groupId]);
    }
  };

  const handleSubmit = () => {
    if (selectedGroupIds.length === 0) {
      Alert.alert('No Groups Selected', 'Please select at least one group.');
      return;
    }

    onSelectGroups(selectedGroupIds);
    setSelectedGroupIds([]);
    onClose();
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a group name.');
      return;
    }

    // Check for duplicate group names (case-insensitive)
    const trimmedName = newGroupName.trim();
    const duplicateGroup = groups.find(g =>
      g.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicateGroup) {
      Alert.alert(
        'Group Already Exists',
        `A group named "${duplicateGroup.name}" already exists. Please choose a different name.`,
        [
          {
            text: 'OK',
            onPress: () => console.log('📋 Duplicate group name prevented:', trimmedName)
          }
        ]
      );
      return;
    }

    console.log('📋 Creating new group:', trimmedName);

    const groupData = {
      name: trimmedName,
      description: newGroupDescription.trim() || undefined,
      color: newGroupColor,
      icon: newGroupIcon,
    };

    // Call onCreateGroup and wait for the new group ID
    const createdGroupId = await Promise.resolve(onCreateGroup(groupData));

    // Reset form
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupColor(PRESET_COLORS[0]);
    setNewGroupIcon(PRESET_ICONS[0]);
    setShowCreateForm(false);

    // If contacts are selected AND we got a group ID back, automatically add contacts to the new group
    if (selectedContactCount > 0 && createdGroupId) {
      console.log('📋 Auto-adding selected contacts to newly created group:', createdGroupId);

      // Show success message
      Alert.alert(
        'Success',
        `"${trimmedName}" has been created and ${selectedContactCount} contact${selectedContactCount > 1 ? 's have' : ' has'} been added!`,
        [{
          text: 'OK',
          onPress: () => {
            console.log('📋 Auto-submitting contacts to new group');
            // Automatically submit the selection with the new group
            onSelectGroups([createdGroupId]);
            // Close the modal
            onClose();
          }
        }]
      );
    } else {
      // Show regular success message
      Alert.alert(
        'Group Created',
        `"${trimmedName}" has been created successfully!`,
        [{ text: 'OK', onPress: () => console.log('📋 Group created successfully') }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Add to Groups ({selectedContactCount})
            </Text>
            <TouchableOpacity onPress={handleSubmit} disabled={selectedGroupIds.length === 0}>
              <Text
                style={[
                  styles.doneButton,
                  selectedGroupIds.length === 0 && styles.doneButtonDisabled
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {!showCreateForm ? (
            <>
              {/* Add to New Group Button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateForm(true)}
              >
                <View style={styles.createButtonIcon}>
                  <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
                </View>
                <Text style={styles.createButtonText}>
                  {selectedContactCount > 0 ? 'Add to New Group' : 'Create New Group'}
                </Text>
              </TouchableOpacity>

              {/* Groups List */}
              <ScrollView
                style={styles.groupsList}
                contentContainerStyle={styles.groupsListContent}
              >
                {groups.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="folder-open-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No groups yet</Text>
                    <Text style={styles.emptySubtext}>
                      Create your first group to organize contacts
                    </Text>
                  </View>
                ) : (
                  groups.map(group => (
                    <TouchableOpacity
                      key={group.id}
                      style={[
                        styles.groupItem,
                        selectedGroupIds.includes(group.id) && styles.groupItemSelected
                      ]}
                      onPress={() => handleToggleGroup(group.id)}
                    >
                      <View
                        style={[styles.groupIcon, { backgroundColor: group.color + '20' }]}
                      >
                        <Ionicons
                          name={group.icon as any || 'people'}
                          size={20}
                          color={group.color}
                        />
                      </View>
                      <View style={styles.groupInfo}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        {group.description && (
                          <Text style={styles.groupDescription} numberOfLines={1}>
                            {group.description}
                          </Text>
                        )}
                        <Text style={styles.groupCount}>
                          {group.contactCount} contact{group.contactCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={styles.checkbox}>
                        <View
                          style={[
                            styles.checkboxInner,
                            selectedGroupIds.includes(group.id) && styles.checkboxSelected
                          ]}
                        >
                          {selectedGroupIds.includes(group.id) && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </>
          ) : (
            // Create Group Form
            <ScrollView style={styles.createForm}>
              <Text style={styles.formLabel}>Group Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Work Contacts"
                value={newGroupName}
                onChangeText={setNewGroupName}
                maxLength={50}
              />

              <Text style={styles.formLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Add a description..."
                value={newGroupDescription}
                onChangeText={setNewGroupDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
              />

              <Text style={styles.formLabel}>Color</Text>
              <View style={styles.colorPicker}>
                {PRESET_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newGroupColor === color && styles.colorOptionSelected
                    ]}
                    onPress={() => setNewGroupColor(color)}
                  >
                    {newGroupColor === color && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Icon</Text>
              <View style={styles.iconPicker}>
                {PRESET_ICONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      newGroupIcon === icon && styles.iconOptionSelected
                    ]}
                    onPress={() => setNewGroupIcon(icon)}
                  >
                    <Ionicons
                      name={icon as any}
                      size={24}
                      color={newGroupIcon === icon ? '#2563EB' : '#6B7280'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Form Actions */}
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowCreateForm(false);
                    setNewGroupName('');
                    setNewGroupDescription('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreateGroup}
                >
                  <Text style={styles.submitButtonText}>
                    {selectedContactCount > 0 ? 'Create & Add Contacts' : 'Create Group'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  doneButtonDisabled: {
    color: '#9CA3AF',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  createButtonIcon: {
    marginRight: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2563EB',
  },
  groupsList: {
    flex: 1,
  },
  groupsListContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  groupItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  groupDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  groupCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  checkbox: {
    marginLeft: 12,
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
  createForm: {
    padding: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  iconPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
