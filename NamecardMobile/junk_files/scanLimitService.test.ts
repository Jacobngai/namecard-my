/**
 * Unit tests for scanLimitService
 *
 * Testing daily scan limit tracking and enforcement
 */

import { scanLimitService } from '../../services/scanLimitService';

// Mock supabase client
const mockSupabase = {
  rpc: jest.fn(),
  from: jest.fn(),
};

jest.mock('../../services/supabaseClient', () => ({
  getSupabaseClient: jest.fn(() => mockSupabase),
}));

// Create a local reference for easier access in tests
const supabase = mockSupabase;

describe('scanLimitService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canUserScan', () => {
    it('should return true when user has scans remaining', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{ can_scan: true, scans_remaining: 3, daily_limit: 5 }],
        error: null,
      });

      const result = await scanLimitService.canUserScan('user-123');

      expect(result).toEqual({
        canScan: true,
        scansRemaining: 3,
        dailyLimit: 5,
        limitReached: false,
      });
    });

    it('should return false when daily limit is reached', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{ can_scan: false, scans_remaining: 0, daily_limit: 5 }],
        error: null,
      });

      const result = await scanLimitService.canUserScan('user-123');

      expect(result).toEqual({
        canScan: false,
        scansRemaining: 0,
        dailyLimit: 5,
        limitReached: true,
      });
    });

    it('should handle database errors gracefully', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await scanLimitService.canUserScan('user-123');

      expect(result).toEqual({
        canScan: false,
        scansRemaining: 0,
        dailyLimit: 0,
        limitReached: true,
      });
    });

    it('should return high limit for pro users', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{ can_scan: true, scans_remaining: 95, daily_limit: 100 }],
        error: null,
      });

      const result = await scanLimitService.canUserScan('pro-user-123');

      expect(result.dailyLimit).toBe(100);
      expect(result.canScan).toBe(true);
    });
  });

  describe('incrementScanCount', () => {
    it('should increment scan count and return updated values', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{ daily_count: 3, limit_reached: false }],
        error: null,
      });

      const result = await scanLimitService.incrementScanCount('user-123');

      expect(result).toEqual({
        dailyCount: 3,
        limitReached: false,
      });
      expect(supabase.rpc).toHaveBeenCalledWith('increment_scan_count', {
        user_id_param: 'user-123',
      });
    });

    it('should indicate when limit is reached after increment', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [{ daily_count: 5, limit_reached: true }],
        error: null,
      });

      const result = await scanLimitService.incrementScanCount('user-123');

      expect(result).toEqual({
        dailyCount: 5,
        limitReached: true,
      });
    });

    it('should handle errors during increment', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Failed to increment' },
      });

      await expect(scanLimitService.incrementScanCount('user-123')).rejects.toThrow(
        'Failed to increment scan count'
      );
    });
  });

  describe('getDailyLimit', () => {
    it('should return free tier limit for free users', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { tier: 'free' },
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { tier: 'free' },
              error: null,
            }),
          }),
        }),
      }).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{ value: '5' }],
            error: null,
          }),
        }),
      });

      const result = await scanLimitService.getDailyLimit('user-123');
      expect(result).toBe(5);
    });

    it('should return pro tier limit for pro users', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { tier: 'pro' },
              error: null,
            }),
          }),
        }),
      }).mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{ value: '100' }],
            error: null,
          }),
        }),
      });

      const result = await scanLimitService.getDailyLimit('pro-user');
      expect(result).toBe(100);
    });
  });

  describe('getScanUsageStats', () => {
    it('should return usage statistics for user', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                daily_scan_count: 3,
                total_scans: 150,
                last_scan_date: '2025-11-04',
                tier: 'free',
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await scanLimitService.getScanUsageStats('user-123');

      expect(result).toEqual({
        dailyScanCount: 3,
        totalScans: 150,
        lastScanDate: '2025-11-04',
        tier: 'free',
      });
    });
  });
});

console.log('[scanLimitService.test] ✅ Tests defined');
