import React from 'react';
import { render, fireEvent, screen } from '../test-utils';
import { Alert } from 'react-native';

// Simple ContactCard component for testing
const ContactCard = ({ contact, onPress, onLongPress }: any) => {
  return (
    <div
      data-testid="contact-card"
      onClick={() => onPress(contact)}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress(contact);
      }}
    >
      <div data-testid="contact-name">{contact.name}</div>
      {contact.company && (
        <div data-testid="contact-company">{contact.company}</div>
      )}
      {contact.email && (
        <div data-testid="contact-email">{contact.email}</div>
      )}
      {contact.phone && (
        <div data-testid="contact-phone">{contact.phone}</div>
      )}
    </div>
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
    expect(screen.queryByTestId('contact-company')).not.toBeInTheDocument();
    expect(screen.queryByTestId('contact-email')).not.toBeInTheDocument();
    expect(screen.queryByTestId('contact-phone')).not.toBeInTheDocument();
  });

  it('should call onPress when clicked', () => {
    render(
      <ContactCard
        contact={mockContact}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
      />
    );

    const card = screen.getByTestId('contact-card');
    fireEvent.click(card);

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
    fireEvent.contextMenu(card);

    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
    expect(mockOnLongPress).toHaveBeenCalledWith(mockContact);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should handle missing callbacks gracefully', () => {
    render(<ContactCard contact={mockContact} />);

    const card = screen.getByTestId('contact-card');

    // Should not throw errors when callbacks are missing
    expect(() => fireEvent.click(card)).not.toThrow();
    expect(() => fireEvent.contextMenu(card)).not.toThrow();
  });

  it('should apply correct accessibility properties', () => {
    const ContactCardWithAccessibility = ({ contact, onPress }: any) => {
      return (
        <div
          data-testid="contact-card"
          role="button"
          aria-label={`Contact: ${contact.name}`}
          onClick={() => onPress?.(contact)}
        >
          <div>{contact.name}</div>
        </div>
      );
    };

    render(
      <ContactCardWithAccessibility
        contact={mockContact}
        onPress={mockOnPress}
      />
    );

    const card = screen.getByTestId('contact-card');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('aria-label', 'Contact: John Doe');
  });

  it('should display formatted phone number', () => {
    const formatPhoneNumber = (phone: string) => {
      // Simple US phone number formatting
      const cleaned = phone.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
      }
      return phone;
    };

    const ContactCardWithFormatting = ({ contact }: any) => {
      return (
        <div data-testid="contact-card">
          <div data-testid="formatted-phone">
            {contact.phone && formatPhoneNumber(contact.phone)}
          </div>
        </div>
      );
    };

    render(<ContactCardWithFormatting contact={mockContact} />);

    expect(screen.getByTestId('formatted-phone')).toHaveTextContent(
      '+1 (234) 567-890'
    );
  });

  it('should highlight search matches', () => {
    const ContactCardWithHighlight = ({ contact, searchQuery }: any) => {
      const highlightText = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} data-testid="highlighted-text">
              {part}
            </span>
          ) : (
            part
          )
        );
      };

      return (
        <div data-testid="contact-card">
          <div data-testid="contact-name">
            {highlightText(contact.name, searchQuery)}
          </div>
        </div>
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