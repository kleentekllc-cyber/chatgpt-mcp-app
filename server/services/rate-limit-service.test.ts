/**
 * Rate Limit Service Tests
 * Task Group 4: Rate Limiting Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  recordRequest,
  isApproachingLimit,
  isRateLimitExceeded,
  resetRateLimit,
} from './rate-limit-service.js';

describe('Rate Limit Service', () => {
  beforeEach(() => {
    resetRateLimit();
  });

  describe('Task 4.1: Rate Limiting Tests', () => {
    it('should track requests per minute', () => {
      const initialInfo = checkRateLimit();
      expect(initialInfo.remaining).toBe(60);

      recordRequest();
      const afterOneRequest = checkRateLimit();
      expect(afterOneRequest.remaining).toBe(59);

      recordRequest();
      recordRequest();
      const afterThreeRequests = checkRateLimit();
      expect(afterThreeRequests.remaining).toBe(57);
    });

    it('should detect when approaching rate limit', () => {
      // Record 54 requests (90% of 60)
      for (let i = 0; i < 54; i++) {
        recordRequest();
      }

      expect(isApproachingLimit()).toBe(true);
    });

    it('should detect when rate limit is exceeded', () => {
      // Record 60 requests
      for (let i = 0; i < 60; i++) {
        recordRequest();
      }

      expect(isRateLimitExceeded()).toBe(true);
    });

    it('should not be at limit with few requests', () => {
      recordRequest();
      recordRequest();
      recordRequest();

      expect(isApproachingLimit()).toBe(false);
      expect(isRateLimitExceeded()).toBe(false);
    });

    it('should provide rate limit info', () => {
      const info = checkRateLimit();

      expect(info).toHaveProperty('limit');
      expect(info).toHaveProperty('remaining');
      expect(info).toHaveProperty('resetAt');
      expect(info.limit).toBe(60);
      expect(typeof info.resetAt).toBe('number');
    });
  });
});
