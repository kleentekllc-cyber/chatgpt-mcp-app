/**
 * Tests for Directions API client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { decodePolyline, calculateDistance } from './directions-api-client';

describe('Directions API Client', () => {
  describe('decodePolyline', () => {
    it('should decode a simple polyline', () => {
      // Example encoded polyline from Google
      const encoded = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
      const decoded = decodePolyline(encoded);

      expect(decoded.length).toBeGreaterThan(0);
      expect(decoded[0]).toHaveProperty('lat');
      expect(decoded[0]).toHaveProperty('lng');
    });

    it('should return empty array for empty string', () => {
      const result = decodePolyline('');
      expect(result).toEqual([]);
    });

    it('should handle single point polyline', () => {
      // A single point encoded polyline
      const encoded = '_p~iF~ps|U';
      const decoded = decodePolyline(encoded);

      expect(decoded.length).toBe(1);
      expect(decoded[0].lat).toBeCloseTo(38.5, 0);
      expect(decoded[0].lng).toBeCloseTo(-120.2, 0);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const from = { lat: 40.7128, lng: -74.006 }; // New York
      const to = { lat: 40.7580, lng: -73.9855 }; // Times Square

      const distance = calculateDistance(from, to);

      // Distance should be approximately 5.8 km = 5800 meters
      expect(distance).toBeGreaterThan(5000);
      expect(distance).toBeLessThan(7000);
    });

    it('should return 0 for same location', () => {
      const location = { lat: 40.7128, lng: -74.006 };

      const distance = calculateDistance(location, location);

      expect(distance).toBe(0);
    });

    it('should handle locations across the equator', () => {
      const northernHemisphere = { lat: 40.7128, lng: -74.006 };
      const southernHemisphere = { lat: -33.8688, lng: 151.2093 }; // Sydney

      const distance = calculateDistance(northernHemisphere, southernHemisphere);

      // Should be a very large distance (around 16,000 km)
      expect(distance).toBeGreaterThan(15000000);
    });
  });
});
