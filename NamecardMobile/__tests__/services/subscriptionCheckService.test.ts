/**
 * Unit tests for subscriptionCheckService
 *
 * Testing subscription status checking logic
 */

import { subscriptionCheckService } from '../../services/subscriptionCheckService';

// Mock supabase client
const mockSupabase = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
  },
};

jest.mock('../../services/supabaseClient', () => ({
  getSupabaseClient: jest.fn(() => mockSupabase),
}));

// Create a local reference for easier access in tests
const supabase = mockSupabase;

describe('subscriptionCheckService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isPremiumUser', () => {
    it('should return true for pro tier user with valid subscription', async () => {
      const mockUser = {
        id: 'user-123',
        tier: 'pro',
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await subscriptionCheckService.isPremiumUser('user-123');
      expect(result).toBe(true);
    });

    it('should return true for enterprise tier user', async () => {
      const mockUser = {
        id: 'user-123',
        tier: 'enterprise',
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await subscriptionCheckService.isPremiumUser('user-123');
      expect(result).toBe(true);
    });

    it('should return false for free tier user', async () => {
      const mockUser = {
        id: 'user-123',
        tier: 'free',
        subscription_end: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await subscriptionCheckService.isPremiumUser('user-123');
      expect(result).toBe(false);
    });

    it('should return false for expired subscription', async () => {
      const mockUser = {
        id: 'user-123',
        tier: 'pro',
        subscription_end: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await subscriptionCheckService.isPremiumUser('user-123');
      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            }),
          }),
        }),
      });

      const result = await subscriptionCheckService.isPremiumUser('user-123');
      expect(result).toBe(false);
    });
  });

  describe('getUserSubscriptionInfo', () => {
    it('should return complete subscription info for premium user', async () => {
      const subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const mockUser = {
        id: 'user-123',
        tier: 'pro',
        subscription_end: subscriptionEnd.toISOString(),
        email: 'test@example.com',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await subscriptionCheckService.getUserSubscriptionInfo('user-123');

      expect(result).toEqual({
        isPremium: true,
        tier: 'pro',
        subscriptionEnd: subscriptionEnd.toISOString(),
        daysRemaining: expect.any(Number),
      });
      expect(result.daysRemaining).toBeGreaterThan(29);
    });

    it('should return correct info for free user', async () => {
      const mockUser = {
        id: 'user-123',
        tier: 'free',
        subscription_end: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await subscriptionCheckService.getUserSubscriptionInfo('user-123');

      expect(result).toEqual({
        isPremium: false,
        tier: 'free',
        subscriptionEnd: null,
        daysRemaining: 0,
      });
    });
  });

  describe('shouldShowPaywall', () => {
    it('should return false for premium users', async () => {
      const mockUser = {
        id: 'user-123',
        tier: 'pro',
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await subscriptionCheckService.shouldShowPaywall('user-123');
      expect(result).toBe(false);
    });

    it('should return true for free users', async () => {
      const mockUser = {
        id: 'user-123',
        tier: 'free',
        subscription_end: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await subscriptionCheckService.shouldShowPaywall('user-123');
      expect(result).toBe(true);
    });
  });
});

console.log('[subscriptionCheckService.test] ✅ Tests defined');
