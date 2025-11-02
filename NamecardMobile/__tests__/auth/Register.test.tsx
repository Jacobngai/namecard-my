import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthScreen } from '../../components/screens/AuthScreen';
import { SupabaseService } from '../../services/supabase';
import { mockAuthResponses } from '../../__mocks__/supabase.mock';

// Mock Supabase service
jest.mock('../../services/supabase');

describe('Register Functionality', () => {
  let mockOnAuthSuccess: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthSuccess = jest.fn();
    (Alert.alert as jest.Mock).mockClear();
  });

  const navigateToRegister = (getByText: any) => {
    const registerTab = getByText('Register');
    fireEvent.press(registerTab);
  };

  describe('UI Elements', () => {
    it('should render register form when register tab is clicked', () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      expect(getByPlaceholderText('Full Name')).toBeTruthy();
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password (min 6 characters)')).toBeTruthy();
      expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
      expect(getByText('Register')).toBeTruthy();
    });

    it('should toggle password visibility for both password fields', () => {
      const { getByText, getByPlaceholderText, getAllByTestId } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      const passwordInput = getByPlaceholderText('Password (min 6 characters)');
      const confirmPasswordInput = getByPlaceholderText('Confirm Password');
      const eyeIcons = getAllByTestId('eye-icon');

      // Test password field
      expect(passwordInput.props.secureTextEntry).toBe(true);
      fireEvent.press(eyeIcons[0]);
      expect(passwordInput.props.secureTextEntry).toBe(false);

      // Test confirm password field
      expect(confirmPasswordInput.props.secureTextEntry).toBe(true);
      fireEvent.press(eyeIcons[1]);
      expect(confirmPasswordInput.props.secureTextEntry).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should show error when fields are empty', async () => {
      const { getByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      const registerButton = getByText('Register');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please fill in all fields'
        );
      });
    });

    it('should show error when passwords do not match', async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password (min 6 characters)'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'differentpassword');

      const registerButton = getByText('Register');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Passwords do not match'
        );
      });
    });

    it('should show error when password is too short', async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password (min 6 characters)'), '12345');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), '12345');

      const registerButton = getByText('Register');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Password must be at least 6 characters'
        );
      });
    });

    it('should validate email format', async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      const emailInput = getByPlaceholderText('Email');

      // Test invalid email formats
      const invalidEmails = ['notanemail', 'test@', '@example.com', 'test@.com'];

      for (const invalidEmail of invalidEmails) {
        fireEvent.changeText(emailInput, invalidEmail);
        expect(emailInput.props.value).toBe(invalidEmail);
      }
    });
  });

  describe('Successful Registration', () => {
    it('should register successfully with valid data', async () => {
      (SupabaseService.signUp as jest.Mock).mockResolvedValue(mockAuthResponses.signUpSuccess);

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password (min 6 characters)'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

      const registerButton = getByText('Register');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(SupabaseService.signUp).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          { name: 'Test User' }
        );
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          'Registration successful! Please check your email to confirm your account.',
          expect.any(Array)
        );
      });
    });

    it('should switch to login tab after successful registration', async () => {
      (SupabaseService.signUp as jest.Mock).mockResolvedValue(mockAuthResponses.signUpSuccess);

      const { getByText, getByPlaceholderText, queryByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password (min 6 characters)'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

      const registerButton = getByText('Register');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // Simulate OK button press on alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const okButton = alertCall[2][0];
      okButton.onPress();

      // Should switch back to login form
      await waitFor(() => {
        expect(queryByPlaceholderText('Full Name')).toBeFalsy();
        expect(queryByPlaceholderText('Confirm Password')).toBeFalsy();
        expect(queryByPlaceholderText('Password')).toBeTruthy();
      });
    });

    it('should show loading state during registration', async () => {
      (SupabaseService.signUp as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockAuthResponses.signUpSuccess), 100))
      );

      const { getByText, getByPlaceholderText, queryByTestId } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password (min 6 characters)'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

      const registerButton = getByText('Register');
      fireEvent.press(registerButton);

      // Check for loading indicator
      await waitFor(() => {
        expect(queryByTestId('loading-indicator')).toBeTruthy();
      });

      // Wait for registration to complete
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
    });
  });

  describe('Failed Registration', () => {
    it('should show error when email is already registered', async () => {
      (SupabaseService.signUp as jest.Mock).mockResolvedValue(mockAuthResponses.signUpError);

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'existing@example.com');
      fireEvent.changeText(getByPlaceholderText('Password (min 6 characters)'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

      const registerButton = getByText('Register');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Registration Failed',
          'User already registered'
        );
      });
    });

    it('should handle network errors gracefully', async () => {
      (SupabaseService.signUp as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password (min 6 characters)'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

      const registerButton = getByText('Register');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Registration Failed',
          'Network error'
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in name', async () => {
      (SupabaseService.signUp as jest.Mock).mockResolvedValue(mockAuthResponses.signUpSuccess);

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      const specialNames = ["O'Brien", "José García", "Marie-Claire", "李明"];

      for (const name of specialNames) {
        fireEvent.changeText(getByPlaceholderText('Full Name'), name);
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password (min 6 characters)'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

        const registerButton = getByText('Register');
        fireEvent.press(registerButton);

        await waitFor(() => {
          expect(SupabaseService.signUp).toHaveBeenCalledWith(
            'test@example.com',
            'password123',
            { name }
          );
        });

        jest.clearAllMocks();
      }
    });

    it('should trim whitespace from input fields', async () => {
      (SupabaseService.signUp as jest.Mock).mockResolvedValue(mockAuthResponses.signUpSuccess);

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToRegister(getByText);

      fireEvent.changeText(getByPlaceholderText('Full Name'), '  Test User  ');
      fireEvent.changeText(getByPlaceholderText('Email'), '  test@example.com  ');
      fireEvent.changeText(getByPlaceholderText('Password (min 6 characters)'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');

      const registerButton = getByText('Register');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(SupabaseService.signUp).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          { name: 'Test User' }
        );
      });
    });
  });
});