import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthScreen } from '../../components/screens/AuthScreen';
import { SupabaseService } from '../../services/supabase';
import { mockAuthResponses } from '../../__mocks__/supabase.mock';

// Mock Supabase service
jest.mock('../../services/supabase');

describe('Login Functionality', () => {
  let mockOnAuthSuccess: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthSuccess = jest.fn();
    (Alert.alert as jest.Mock).mockClear();
  });

  describe('UI Elements', () => {
    it('should render login form by default', () => {
      const { getByPlaceholderText, getByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
      expect(getByText('Forgot Password?')).toBeTruthy();
    });

    it('should toggle password visibility', () => {
      const { getByPlaceholderText, getAllByTestId } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      const passwordInput = getByPlaceholderText('Password');
      const eyeIcons = getAllByTestId('eye-icon');

      // Initially password should be hidden
      expect(passwordInput.props.secureTextEntry).toBe(true);

      // Click eye icon to show password
      fireEvent.press(eyeIcons[0]);
      expect(passwordInput.props.secureTextEntry).toBe(false);

      // Click again to hide password
      fireEvent.press(eyeIcons[0]);
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should show error when fields are empty', async () => {
      const { getByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please fill in all fields'
        );
      });
    });

    it('should show error when only email is provided', async () => {
      const { getByPlaceholderText, getByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'test@example.com');

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please fill in all fields'
        );
      });
    });

    it('should show error when only password is provided', async () => {
      const { getByPlaceholderText, getByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      const passwordInput = getByPlaceholderText('Password');
      fireEvent.changeText(passwordInput, 'password123');

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please fill in all fields'
        );
      });
    });
  });

  describe('Successful Login', () => {
    it('should login successfully with valid credentials', async () => {
      (SupabaseService.signIn as jest.Mock).mockResolvedValue(mockAuthResponses.signInSuccess);

      const { getByPlaceholderText, getByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(SupabaseService.signIn).toHaveBeenCalledWith(
          'test@example.com',
          'password123'
        );
        expect(mockOnAuthSuccess).toHaveBeenCalledWith(mockAuthResponses.signInSuccess.user);
        expect(Alert.alert).not.toHaveBeenCalled();
      });
    });

    it('should show loading state during login', async () => {
      (SupabaseService.signIn as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockAuthResponses.signInSuccess), 100))
      );

      const { getByPlaceholderText, getByText, queryByTestId } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      // Check for loading indicator
      await waitFor(() => {
        expect(queryByTestId('loading-indicator')).toBeTruthy();
      });

      // Wait for login to complete
      await waitFor(() => {
        expect(mockOnAuthSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Failed Login', () => {
    it('should show error message for invalid credentials', async () => {
      (SupabaseService.signIn as jest.Mock).mockResolvedValue(mockAuthResponses.signInError);

      const { getByPlaceholderText, getByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');

      fireEvent.changeText(emailInput, 'wrong@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Login Failed',
          'Invalid login credentials'
        );
        expect(mockOnAuthSuccess).not.toHaveBeenCalled();
      });
    });

    it('should handle network errors gracefully', async () => {
      (SupabaseService.signIn as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { getByPlaceholderText, getByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Login Failed',
          'Network error'
        );
        expect(mockOnAuthSuccess).not.toHaveBeenCalled();
      });
    });

    it('should handle unknown errors', async () => {
      (SupabaseService.signIn as jest.Mock).mockResolvedValue({
        user: null,
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(mockOnAuthSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to forgot password screen', () => {
      const { getByText, queryByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      const forgotPasswordLink = getByText('Forgot Password?');
      fireEvent.press(forgotPasswordLink);

      expect(queryByText('Reset Password')).toBeTruthy();
      expect(queryByText('Enter your email and we\'ll send you a reset link')).toBeTruthy();
    });

    it('should navigate to register screen', () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      const registerTab = getByText('Register');
      fireEvent.press(registerTab);

      expect(getByPlaceholderText('Full Name')).toBeTruthy();
      expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    });
  });
});