import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from '../testUtils';
import { AuthScreen } from '../../components/screens/AuthScreen';
import { SupabaseService } from '../../services/supabase';
import { mockAuthResponses } from '../../__mocks__/supabase.mock';

// Mock Supabase service
jest.mock('../../services/supabase');

describe('Forgot Password Functionality', () => {
  let mockOnAuthSuccess: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthSuccess = jest.fn();
    (Alert.alert as jest.Mock).mockClear();
  });

  const navigateToForgotPassword = (getByText: any) => {
    const forgotPasswordLink = getByText('Forgot Password?');
    fireEvent.press(forgotPasswordLink);
  };

  describe('UI Elements', () => {
    it('should render forgot password form when link is clicked', () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      expect(getByText('Reset Password')).toBeTruthy();
      expect(getByText("Enter your email and we'll send you a reset link")).toBeTruthy();
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByText('Send Reset Link')).toBeTruthy();
      expect(getByText('Back to Sign In')).toBeTruthy();
    });

    it('should navigate back to login when "Back to Sign In" is clicked', () => {
      const { getByText, queryByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const backButton = getByText('Back to Sign In');
      fireEvent.press(backButton);

      expect(queryByText('Reset Password')).toBeFalsy();
      expect(queryByText('Sign In')).toBeTruthy();
      expect(queryByText('Forgot Password?')).toBeTruthy();
    });
  });

  describe('Validation', () => {
    it('should show error when email field is empty', async () => {
      const { getByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const sendResetButton = getByText('Send Reset Link');
      fireEvent.press(sendResetButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please enter your email address'
        );
      });
    });

    it('should validate email format', async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const emailInput = getByPlaceholderText('Email');

      // Test various email formats
      const testEmails = [
        { email: 'valid@example.com', valid: true },
        { email: 'user.name@domain.co.uk', valid: true },
        { email: 'user+tag@example.org', valid: true },
        { email: 'invalid.email', valid: false },
        { email: '@nodomain.com', valid: false },
        { email: 'spaces in@email.com', valid: false },
      ];

      for (const testCase of testEmails) {
        fireEvent.changeText(emailInput, testCase.email);
        expect(emailInput.props.value).toBe(testCase.email);
      }
    });
  });

  describe('Successful Password Reset', () => {
    it('should send reset email successfully', async () => {
      (SupabaseService.resetPassword as jest.Mock).mockResolvedValue(mockAuthResponses.resetPasswordSuccess);

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'test@example.com');

      const sendResetButton = getByText('Send Reset Link');
      fireEvent.press(sendResetButton);

      await waitFor(() => {
        expect(SupabaseService.resetPassword).toHaveBeenCalledWith('test@example.com');
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          'Password reset link sent! Check your email.',
          expect.any(Array)
        );
      });
    });

    it('should return to login after successful reset request', async () => {
      (SupabaseService.resetPassword as jest.Mock).mockResolvedValue(mockAuthResponses.resetPasswordSuccess);

      const { getByText, getByPlaceholderText, queryByText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'test@example.com');

      const sendResetButton = getByText('Send Reset Link');
      fireEvent.press(sendResetButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // Simulate OK button press on alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const okButton = alertCall[2][0];
      okButton.onPress();

      // Should switch back to login form
      await waitFor(() => {
        expect(queryByText('Reset Password')).toBeFalsy();
        expect(queryByText('Sign In')).toBeTruthy();
      });
    });

    it('should show loading state during reset request', async () => {
      (SupabaseService.resetPassword as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockAuthResponses.resetPasswordSuccess), 100))
      );

      const { getByText, getByPlaceholderText, queryByTestId } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'test@example.com');

      const sendResetButton = getByText('Send Reset Link');
      fireEvent.press(sendResetButton);

      // Check for loading indicator
      await waitFor(() => {
        expect(queryByTestId('loading-indicator')).toBeTruthy();
      });

      // Wait for reset to complete
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
    });

    it('should handle multiple reset requests', async () => {
      (SupabaseService.resetPassword as jest.Mock).mockResolvedValue(mockAuthResponses.resetPasswordSuccess);

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const emailInput = getByPlaceholderText('Email');
      const sendResetButton = getByText('Send Reset Link');

      // First request
      fireEvent.changeText(emailInput, 'first@example.com');
      fireEvent.press(sendResetButton);

      await waitFor(() => {
        expect(SupabaseService.resetPassword).toHaveBeenCalledWith('first@example.com');
      });

      // Clear mocks
      jest.clearAllMocks();

      // Second request with different email
      fireEvent.changeText(emailInput, 'second@example.com');
      fireEvent.press(sendResetButton);

      await waitFor(() => {
        expect(SupabaseService.resetPassword).toHaveBeenCalledWith('second@example.com');
      });
    });
  });

  describe('Failed Password Reset', () => {
    it('should show error when user is not found', async () => {
      (SupabaseService.resetPassword as jest.Mock).mockResolvedValue(mockAuthResponses.resetPasswordError);

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'nonexistent@example.com');

      const sendResetButton = getByText('Send Reset Link');
      fireEvent.press(sendResetButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Reset Failed',
          'User not found'
        );
      });
    });

    it('should handle network errors gracefully', async () => {
      (SupabaseService.resetPassword as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'test@example.com');

      const sendResetButton = getByText('Send Reset Link');
      fireEvent.press(sendResetButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Reset Failed',
          'Network error'
        );
      });
    });

    it('should handle rate limiting errors', async () => {
      (SupabaseService.resetPassword as jest.Mock).mockResolvedValue({
        error: { message: 'Too many requests. Please try again later.' }
      });

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'test@example.com');

      const sendResetButton = getByText('Send Reset Link');
      fireEvent.press(sendResetButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Reset Failed',
          'Too many requests. Please try again later.'
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should trim whitespace from email', async () => {
      (SupabaseService.resetPassword as jest.Mock).mockResolvedValue(mockAuthResponses.resetPasswordSuccess);

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, '  test@example.com  ');

      const sendResetButton = getByText('Send Reset Link');
      fireEvent.press(sendResetButton);

      await waitFor(() => {
        expect(SupabaseService.resetPassword).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should handle case-insensitive emails', async () => {
      (SupabaseService.resetPassword as jest.Mock).mockResolvedValue(mockAuthResponses.resetPasswordSuccess);

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'TEST@EXAMPLE.COM');

      const sendResetButton = getByText('Send Reset Link');
      fireEvent.press(sendResetButton);

      await waitFor(() => {
        expect(SupabaseService.resetPassword).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should prevent duplicate requests while loading', async () => {
      let resolvePromise: any;
      (SupabaseService.resetPassword as jest.Mock).mockImplementation(
        () => new Promise(resolve => { resolvePromise = resolve; })
      );

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'test@example.com');

      const sendResetButton = getByText('Send Reset Link');

      // First click
      fireEvent.press(sendResetButton);

      // Try to click again while loading
      fireEvent.press(sendResetButton);
      fireEvent.press(sendResetButton);

      // Should only be called once
      expect(SupabaseService.resetPassword).toHaveBeenCalledTimes(1);

      // Resolve the promise
      resolvePromise(mockAuthResponses.resetPasswordSuccess);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
    });

    it('should clear email field after successful reset', async () => {
      (SupabaseService.resetPassword as jest.Mock).mockResolvedValue(mockAuthResponses.resetPasswordSuccess);

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} />
      );

      navigateToForgotPassword(getByText);

      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'test@example.com');

      const sendResetButton = getByText('Send Reset Link');
      fireEvent.press(sendResetButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // Simulate OK button press on alert
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const okButton = alertCall[2][0];
      okButton.onPress();

      // Email field should be cleared when returning to login
      await waitFor(() => {
        const loginEmailInput = getByPlaceholderText('Email');
        expect(loginEmailInput.props.value).toBe('');
      });
    });
  });
});