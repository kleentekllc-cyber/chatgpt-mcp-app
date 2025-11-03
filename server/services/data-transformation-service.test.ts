/**
 * Data Transformation Service Tests
 * Task Group 3: Result Normalization & Data Transformation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  transformBusinessResult,
  transformBusinessResults,
  metersToMiles,
  filterByRating,
  sortByDistance,
} from './data-transformation-service.js';
import { LocationCoordinates } from '../types/business-search.js';

describe('Data Transformation Service', () => {
  describe('Task 3.1: Data Transformation Tests', () => {
    const searchCenter: LocationCoordinates = { lat: 47.6062, lng: -122.3321 };

    it('should transform Places API result to BusinessResult', () => {
      const placeData: any = {
        place_id: 'ChIJ123',
        name: 'Test Coffee Shop',
        geometry: { location: { lat: 47.6102, lng: -122.3421 } },
        rating: 4.3,
        user_ratings_total: 156,
        formatted_address: '123 Main St, Seattle, WA 98101, USA',
        business_status: 'OPERATIONAL',
        price_level: 2,
        types: ['cafe', 'food'],
        address_components: [
          { long_name: '123', short_name: '123', types: ['street_number'] },
          { long_name: 'Main St', short_name: 'Main St', types: ['route'] },
          { long_name: 'Seattle', short_name: 'Seattle', types: ['locality'] },
          { long_name: 'WA', short_name: 'WA', types: ['administrative_area_level_1'] },
          { long_name: '98101', short_name: '98101', types: ['postal_code'] },
        ],
      };

      const result = transformBusinessResult(placeData, searchCenter);

      expect(result.place_id).toBe('ChIJ123');
      expect(result.name).toBe('Test Coffee Shop');
      expect(result.rating).toBe(4.3);
      expect(result.location.lat).toBe(47.6102);
      expect(result.location.lng).toBe(-122.3421);
      expect(result.address.street).toBe('123 Main St');
      expect(result.address.city).toBe('Seattle');
      expect(result.address.state).toBe('WA');
      expect(result.address.postal_code).toBe('98101');
    });

    it('should normalize address to consistent structure', () => {
      const placeData: any = {
        place_id: 'ChIJ456',
        name: 'Test Restaurant',
        geometry: { location: { lat: 47.6062, lng: -122.3321 } },
        formatted_address: '456 Pike St, Seattle, WA 98101, USA',
        business_status: 'OPERATIONAL',
        address_components: [
          { long_name: '456', short_name: '456', types: ['street_number'] },
          { long_name: 'Pike St', short_name: 'Pike St', types: ['route'] },
          { long_name: 'Seattle', short_name: 'Seattle', types: ['locality'] },
          { long_name: 'Washington', short_name: 'WA', types: ['administrative_area_level_1'] },
        ],
      };

      const result = transformBusinessResult(placeData, searchCenter);

      expect(result.address).toHaveProperty('street');
      expect(result.address).toHaveProperty('city');
      expect(result.address).toHaveProperty('state');
      expect(result.address.street).toBe('456 Pike St');
      expect(result.address.city).toBe('Seattle');
      expect(result.address.state).toBe('WA');
    });

    it('should convert price level from numeric to dollar signs', () => {
      const testCases = [
        { priceLevel: 0, expected: 'Free' },
        { priceLevel: 1, expected: '$' },
        { priceLevel: 2, expected: '$$' },
        { priceLevel: 3, expected: '$$$' },
        { priceLevel: 4, expected: '$$$$' },
        { priceLevel: undefined, expected: 'Price not available' },
      ];

      testCases.forEach(({ priceLevel, expected }) => {
        const placeData: any = {
          place_id: `test_${priceLevel}`,
          name: 'Test Business',
          geometry: { location: { lat: 47.6062, lng: -122.3321 } },
          formatted_address: 'Test Address',
          business_status: 'OPERATIONAL',
          price_level: priceLevel,
        };

        const result = transformBusinessResult(placeData, searchCenter);
        expect(result.price_display).toBe(expected);
      });
    });

    it('should calculate distance from search center using Haversine formula', () => {
      const placeData: any = {
        place_id: 'ChIJ789',
        name: 'Distant Business',
        geometry: { location: { lat: 47.7062, lng: -122.4321 } },
        formatted_address: 'Far Away St',
        business_status: 'OPERATIONAL',
      };

      const result = transformBusinessResult(placeData, searchCenter);

      expect(result.distance).toBeDefined();
      expect(typeof result.distance).toBe('number');
      expect(result.distance).toBeGreaterThan(0);
    });

    it('should round ratings to one decimal place', () => {
      const placeData: any = {
        place_id: 'ChIJ999',
        name: 'Test Business',
        geometry: { location: { lat: 47.6062, lng: -122.3321 } },
        formatted_address: 'Test Address',
        business_status: 'OPERATIONAL',
        rating: 4.567,
      };

      const result = transformBusinessResult(placeData, searchCenter);
      expect(result.rating).toBe(4.6);
    });

    it('should handle missing fields with sensible defaults', () => {
      const placeData: any = {
        place_id: 'ChIJ000',
        name: 'Minimal Business',
        geometry: { location: { lat: 47.6062, lng: -122.3321 } },
        business_status: 'OPERATIONAL',
      };

      const result = transformBusinessResult(placeData, searchCenter);

      expect(result.rating).toBeUndefined();
      expect(result.price_display).toBe('Price not available');
      expect(result.formatted_address).toBe('');
      expect(result.photos).toEqual([]);
    });

    it('should convert meters to miles correctly', () => {
      expect(metersToMiles(1609.34)).toBe(1.0);
      expect(metersToMiles(3218.68)).toBe(2.0);
      expect(metersToMiles(8046.7)).toBe(5.0);
    });

    it('should filter results by rating', () => {
      const businesses = [
        {
          place_id: '1',
          name: 'High Rated',
          rating: 4.5,
          location: { lat: 0, lng: 0 },
          address: {},
          formatted_address: '',
          business_status: 'OPERATIONAL',
        },
        {
          place_id: '2',
          name: 'Low Rated',
          rating: 3.0,
          location: { lat: 0, lng: 0 },
          address: {},
          formatted_address: '',
          business_status: 'OPERATIONAL',
        },
      ];

      const filtered = filterByRating(businesses, 4.0);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('High Rated');
    });
  });
});
