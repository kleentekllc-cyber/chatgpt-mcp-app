/**
 * Tests for Refinement Filter Service
 */

import { describe, it, expect } from 'vitest';
import {
  applyFilters,
  applyRatingFilter,
  applyPriceFilter,
  applyDistanceFilter,
  refinementsToFilterState,
  mergeFilters,
} from './refinement-filter-service.js';
import { BusinessResult } from '../types/business-search.js';
import { FilterState, FilterType } from '../types/conversation.js';

describe('RefinementFilterService', () => {
  const mockBusinesses: BusinessResult[] = [
    {
      place_id: '1',
      name: 'High Rated Restaurant',
      location: { lat: 37.7749, lng: -122.4194 },
      rating: 4.5,
      price_level: 3,
      distance: 500,
      address: { city: 'SF' },
      formatted_address: '123 St',
      photos: [],
      business_status: 'OPERATIONAL',
    },
    {
      place_id: '2',
      name: 'Cheap Cafe',
      location: { lat: 37.7750, lng: -122.4195 },
      rating: 3.5,
      price_level: 1,
      distance: 1000,
      address: { city: 'SF' },
      formatted_address: '456 St',
      photos: [],
      business_status: 'OPERATIONAL',
    },
    {
      place_id: '3',
      name: 'Far Business',
      location: { lat: 37.7800, lng: -122.4300 },
      rating: 4.0,
      price_level: 2,
      distance: 3000,
      address: { city: 'SF' },
      formatted_address: '789 St',
      photos: [],
      business_status: 'OPERATIONAL',
    },
  ];

  const searchCenter = { lat: 37.7749, lng: -122.4194 };

  describe('applyRatingFilter', () => {
    it('should filter by minimum rating', () => {
      const results = applyRatingFilter(mockBusinesses, 4.0);

      expect(results).toHaveLength(2);
      expect(results[0].rating).toBeGreaterThanOrEqual(4.0);
      expect(results[1].rating).toBeGreaterThanOrEqual(4.0);
    });
  });

  describe('applyPriceFilter', () => {
    it('should filter by maximum price level', () => {
      const results = applyPriceFilter(mockBusinesses, 2);

      expect(results).toHaveLength(2);
      expect(results.every((b) => b.price_level! <= 2)).toBe(true);
    });
  });

  describe('applyDistanceFilter', () => {
    it('should filter by maximum distance', () => {
      const results = applyDistanceFilter(mockBusinesses, 1500, searchCenter);

      expect(results).toHaveLength(2);
      expect(results.every((b) => b.distance! <= 1500)).toBe(true);
    });
  });

  describe('applyFilters', () => {
    it('should apply multiple filters with AND logic', () => {
      const filters: FilterState = {
        rating: 4.0,
        priceLevel: 3,
      };

      const results = applyFilters(mockBusinesses, filters, searchCenter);

      expect(results).toHaveLength(2);
      expect(results.every((b) => b.rating! >= 4.0 && b.price_level! <= 3)).toBe(
        true
      );
    });

    it('should return original list when no filters applied', () => {
      const results = applyFilters(mockBusinesses, {}, searchCenter);

      expect(results).toHaveLength(3);
    });
  });

  describe('refinementsToFilterState', () => {
    it('should convert refinement queries to filter state', () => {
      const refinements = [
        {
          filterType: FilterType.RATING,
          threshold: 4.0,
          confidence: 0.9,
        },
        {
          filterType: FilterType.PRICE,
          maxLevel: 2,
          confidence: 0.9,
        },
      ];

      const filters = refinementsToFilterState(refinements);

      expect(filters.rating).toBe(4.0);
      expect(filters.priceLevel).toBe(2);
    });
  });

  describe('mergeFilters', () => {
    it('should merge new filters with existing', () => {
      const existing: FilterState = { rating: 4.0 };
      const newFilters: FilterState = { priceLevel: 2 };

      const merged = mergeFilters(existing, newFilters);

      expect(merged.rating).toBe(4.0);
      expect(merged.priceLevel).toBe(2);
    });
  });
});
