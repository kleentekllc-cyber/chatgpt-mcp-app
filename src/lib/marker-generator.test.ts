/**
 * Marker Generator Tests
 * Task Group 5: Map Marker Generation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createMarkerData,
  createMarkers,
  createPopupData,
  formatRating,
  renderStars,
} from './marker-generator';
import { BusinessResult } from '../types/business';

describe('Marker Generator', () => {
  describe('Task 5.1: Marker Generation Tests', () => {
    it('should create marker data with position, id, label, and icon', () => {
      const business: BusinessResult = {
        place_id: 'ChIJ123',
        name: 'Test Coffee Shop',
        location: { lat: 47.6062, lng: -122.3321 },
        rating: 4.5,
        user_ratings_total: 100,
        address: {
          street: '123 Main St',
          city: 'Seattle',
          state: 'WA',
        },
        formatted_address: '123 Main St, Seattle, WA',
        business_status: 'OPERATIONAL',
        types: ['cafe'],
      };

      const marker = createMarkerData(business);

      expect(marker.id).toBe('ChIJ123');
      expect(marker.position.lat).toBe(47.6062);
      expect(marker.position.lng).toBe(-122.3321);
      expect(marker.label).toBe('Test Coffee Shop');
      expect(marker.icon).toBeDefined();
      expect(marker.zIndex).toBeDefined();
    });

    it('should use stable keys (place_id) for React rendering', () => {
      const businesses: BusinessResult[] = [
        {
          place_id: 'place1',
          name: 'Business 1',
          location: { lat: 0, lng: 0 },
          address: {},
          formatted_address: '',
          business_status: 'OPERATIONAL',
        },
        {
          place_id: 'place2',
          name: 'Business 2',
          location: { lat: 1, lng: 1 },
          address: {},
          formatted_address: '',
          business_status: 'OPERATIONAL',
        },
      ];

      const markers = createMarkers(businesses);

      expect(markers[0].id).toBe('place1');
      expect(markers[1].id).toBe('place2');
      expect(markers[0].id).not.toBe(markers[1].id);
    });

    it('should calculate z-index based on rating', () => {
      const business1: BusinessResult = {
        place_id: 'high_rated',
        name: 'High Rated',
        location: { lat: 0, lng: 0 },
        rating: 4.8,
        address: {},
        formatted_address: '',
        business_status: 'OPERATIONAL',
      };

      const business2: BusinessResult = {
        place_id: 'low_rated',
        name: 'Low Rated',
        location: { lat: 0, lng: 0 },
        rating: 3.2,
        address: {},
        formatted_address: '',
        business_status: 'OPERATIONAL',
      };

      const marker1 = createMarkerData(business1);
      const marker2 = createMarkerData(business2);

      expect(marker1.zIndex).toBeGreaterThan(marker2.zIndex);
    });

    it('should create popup data with name, rating, address, and status', () => {
      const business: BusinessResult = {
        place_id: 'ChIJ456',
        name: 'Test Restaurant',
        location: { lat: 47.6062, lng: -122.3321 },
        rating: 4.3,
        user_ratings_total: 85,
        address: {
          street: '456 Pike St',
          city: 'Seattle',
          state: 'WA',
        },
        formatted_address: '456 Pike St, Seattle, WA',
        business_status: 'OPERATIONAL',
        types: ['restaurant'],
        price_display: '$$',
      };

      const popup = createPopupData(business);

      expect(popup.name).toBe('Test Restaurant');
      expect(popup.rating).toBe(4.3);
      expect(popup.address).toContain('456 Pike St');
      expect(popup.status).toBe('Open');
      expect(popup.priceDisplay).toBe('$$');
    });

    it('should render stars for rating display', () => {
      const stars5 = renderStars(5.0);
      expect(stars5).toContain('★');
      expect(stars5.split('★').length - 1).toBe(5);

      const stars4half = renderStars(4.5);
      expect(stars4half).toContain('★');
      expect(stars4half).toContain('⯨'); // Half star

      const stars3 = renderStars(3.0);
      expect(stars3.split('★').length - 1).toBe(3);
      expect(stars3).toContain('☆'); // Empty stars
    });

    it('should format rating with review count', () => {
      const formatted = formatRating(4.5, 123);
      expect(formatted).toContain('4.5');
      expect(formatted).toContain('123');
      expect(formatted).toContain('★');
    });

    it('should handle missing rating gracefully', () => {
      const formatted = formatRating(undefined, undefined);
      expect(formatted).toBe('No rating');
    });

    it('should truncate long business names for labels', () => {
      const business: BusinessResult = {
        place_id: 'long_name',
        name: 'This is a very long business name that should be truncated',
        location: { lat: 0, lng: 0 },
        address: {},
        formatted_address: '',
        business_status: 'OPERATIONAL',
      };

      const marker = createMarkerData(business);
      expect(marker.label.length).toBeLessThanOrEqual(20);
      expect(marker.label).toContain('...');
    });
  });
});
