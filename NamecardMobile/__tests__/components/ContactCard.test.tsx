import React from 'react';
import { render, fireEvent, screen } from '../testUtils';
import { View, Text, TouchableOpacity } from 'react-native';

// Simple ContactCard component for testing (React Native)
const ContactCard = ({ contact, onPress, onLongPress }: any) => {
  return (
    <TouchableOpacity
      testID="contact-card"
      onPress={() => onPress?.(contact)}
      onLongPress={() => onLongPress?.(contact)}
    >
      <Text testID="contact-name">{contact.name}</Text>
      {contact.company && (
        <Text testID="contact-company">{contact.company}</Text>
      )}
      {contact.email && (
        <Text testID="contact-email">{contact.email}</Text>
      )}
      {contact.phone && (
        <Text testID="contact-phone">{contact.phone}</Text>
      )}
    </TouchableOpacity>
  );
};

describe('ContactCard Component', () => {
  const mockContact = {
    id: 'contact_1',
    name: 'John Doe',
    company: 'Tech Corp',
    email: 'john@techcorp.com',
    phone: '+1234567890',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockOnPress = jest.fn();
  const mockOnLongPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render contact information correctly', () => {
    render(
      <ContactCard
        contact={mockContact}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />
    );

    expect(screen.getByTestId('contact-name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('contact-company')).toHaveTextContent('Tech Corp');
    expect(screen.getByTestId('contact-email')).toHaveTextContent('john@techcorp.com');
    expect(screen.getByTestId('contact-phone')).toHaveTextContent('+1234567890');
  });

  it('should handle optional fields gracefully', () => {
    const minimalContact = {
      id: 'contact_2',
      name: 'Jane Smith',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <ContactCard
        contact={minimalContact}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />
    );

    expect(screen.getByTestId('contact-name')).toHaveTextContent('Jane Smith');
    expect(screen.queryByTestId('contact-company')).toBeFalsy();
    expect(screen.queryByTestId('contact-email')).toBeFalsy();
    expect(screen.queryByTestId('contact-phone')).toBeFalsy();
  });

  it('should call onPress when pressed', () => {
    render(
      <ContactCard
        contact={mockContact}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />
    );

    const card = screen.getByTestId('contact-card');
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(mockOnPress).toHaveBeenCalledWith(mockContact);
    expect(mockOnLongPress).not.toHaveBeenCalled();
  });

  it('should call onLongPress when long pressed', () => {
    render(
      <ContactCard
        contact={mockContact}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />
    );

    const card = screen.getByTestId('contact-card');
    fireEvent(card, 'onLongPress');

    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
    expect(mockOnLongPress).toHaveBeenCalledWith(mockContact);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should handle missing callbacks gracefully', () => {
    render(<ContactCard contact={mockContact} />);

    const card = screen.getByTestId('contact-card');

    // Should not throw errors when callbacks are missing
    expect(() => fireEvent.press(card)).not.toThrow();
    expect(() => fireEvent(card, 'onLongPress')).not.toThrow();
  });

  it('should apply correct accessibility properties', () => {
    const ContactCardWithAccessibility = ({ contact, onPress }: any) => {
      return (
        <TouchableOpacity
          testID="contact-card"
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Contact: ${contact.name}`}
          onPress={() => onPress?.(contact)}
        >
          <Text>{contact.name}</Text>
        </TouchableOpacity>
      );
    };

    render(
      <ContactCardWithAccessibility
        contact={mockContact}
        onPress={mockOnPress}
      />
    );

    const card = screen.getByTestId('contact-card');
    expect(card.props.accessible).toBe(true);
    expect(card.props.accessibilityRole).toBe('button');
    expect(card.props.accessibilityLabel).toBe('Contact: John Doe');
  });

  it('should display formatted phone number', () => {
    const formatPhoneNumber = (phone: string) => {
      // Simple US phone number formatting
      const cleaned = phone.replace(/\D/g, '');

      // Check if it starts with country code 1 (US/Canada)
      if (cleaned.startsWith('1') && cleaned.length === 11) {
        // Format: +1 (234) 567-8900
        const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
        if (match) {
          return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
        }
      } else if (cleaned.length === 10) {
        // Format: (234) 567-8900 for 10-digit numbers
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
          return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
      }

      return phone;
    };

    const ContactCardWithFormatting = ({ contact }: any) => {
      return (
        <View testID="contact-card">
          <Text testID="formatted-phone">
            {contact.phone && formatPhoneNumber(contact.phone)}
          </Text>
        </View>
      );
    };

    render(<ContactCardWithFormatting contact={mockContact} />);

    // mockContact.phone is '+1234567890' which has 11 digits after removing non-digits
    expect(screen.getByTestId('formatted-phone')).toHaveTextContent(
      '+1 (234) 567-8900'
    );
  });

  it('should highlight search matches', () => {
    const ContactCardWithHighlight = ({ contact, searchQuery }: any) => {
      const highlightText = (text: string, query: string) => {
        if (!query) return <Text>{text}</Text>;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
          <>
            {parts.map((part, i) =>
              part.toLowerCase() === query.toLowerCase() ? (
                <Text key={i} testID="highlighted-text">
                  {part}
                </Text>
              ) : (
                <Text key={i}>{part}</Text>
              )
            )}
          </>
        );
      };

      return (
        <View testID="contact-card">
          <View testID="contact-name">
            {highlightText(contact.name, searchQuery)}
          </View>
        </View>
      );
    };

    const { rerender } = render(
      <ContactCardWithHighlight contact={mockContact} searchQuery="John" />
    );

    expect(screen.getByTestId('highlighted-text')).toHaveTextContent('John');

    // Test re-render with different search query
    rerender(
      <ContactCardWithHighlight contact={mockContact} searchQuery="Doe" />
    );

    expect(screen.getByTestId('highlighted-text')).toHaveTextContent('Doe');
  });
});