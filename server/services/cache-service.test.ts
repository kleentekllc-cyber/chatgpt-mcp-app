/**
 * Cache Service Tests
 * Task Group 4: Caching & Rate Limiting Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateCacheKey,
  getCachedResults,
  setCachedResults,
  shouldBypassCache,
  clearCache,
} from './cache-service.js';
import { SearchRequest, BusinessResult } from '../types/business-search.js';

describe('Cache Service', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('Task 4.1: Caching Tests', () => {
    it('should generate consistent cache keys from normalized parameters', () => {
      const request1: SearchRequest = {
        businessType: 'Coffee Shop',
        location: 'Seattle, WA',
        filters: { rating: 4 },
      };

      const request2: SearchRequest = {
        businessType: 'coffee shop',
        location: 'seattle, wa',
        filters: { rating: 4 },
      };

      const key1 = generateCacheKey(request1);
      const key2 = generateCacheKey(request2);

      expect(key1).toBe(key2);
    });

    it('should return null for cache miss', () => {
      const request: SearchRequest = {
        businessType: 'restaurant',
        location: 'Portland, OR',
      };

      const result = getCachedResults(request);
      expect(result).toBeNull();
    });

    it('should store and retrieve cached results', () => {
      const request: SearchRequest = {
        businessType: 'coffee_shop',
        location: 'Seattle, WA',
      };

      const mockBusinesses: BusinessResult[] = [
        {
          place_id: 'test123',
          name: 'Test Coffee',
          location: { lat: 47.6062, lng: -122.3321 },
          address: {},
          formatted_address: '123 Main St',
          business_status: 'OPERATIONAL',
        },
      ];

      setCachedResults(request, mockBusinesses);
      const cached = getCachedResults(request);

      expect(cached).not.toBeNull();
      expect(cached).toHaveLength(1);
      expect(cached![0].name).toBe('Test Coffee');
    });

    it('should bypass cache for openNow queries', () => {
      const request: SearchRequest = {
        businessType: 'restaurant',
        location: 'Seattle, WA',
        filters: { openNow: true },
      };

      expect(shouldBypassCache(request)).toBe(true);
    });

    it('should not bypass cache for regular queries', () => {
      const request: SearchRequest = {
        businessType: 'restaurant',
        location: 'Seattle, WA',
        filters: { rating: 4 },
      };

      expect(shouldBypassCache(request)).toBe(false);
    });

    it('should generate different keys for different filter combinations', () => {
      const request1: SearchRequest = {
        businessType: 'restaurant',
        location: 'Seattle, WA',
        filters: { rating: 4, price: 2 },
      };

      const request2: SearchRequest = {
        businessType: 'restaurant',
        location: 'Seattle, WA',
        filters: { rating: 4, price: 3 },
      };

      const key1 = generateCacheKey(request1);
      const key2 = generateCacheKey(request2);

      expect(key1).not.toBe(key2);
    });
  });
});
