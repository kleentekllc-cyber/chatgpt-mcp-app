/**
 * Tests for Google Maps API Configuration Client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchMapsConfig, fetchMapsConfigWithTimeout, MapsApiError } from './maps';

describe('Maps API Client', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');
  });

  describe('fetchMapsConfig', () => {
    it('should successfully retrieve API key when configured', async () => {
      // Arrange
      const testApiKey = 'test-api-key-123';
      vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', testApiKey);

      // Act
      const config = await fetchMapsConfig();

      // Assert
      expect(config).toEqual({ apiKey: testApiKey });
    });

    it('should throw error when API key is missing', async () => {
      // Arrange
      vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');

      // Act & Assert
      await expect(fetchMapsConfig()).rejects.toThrow(MapsApiError);
      await expect(fetchMapsConfig()).rejects.toThrow('Google Maps API key is not configured');
    });

    it('should throw error when API key is placeholder value', async () => {
      // Arrange
      vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'your_api_key_here');

      // Act & Assert
      await expect(fetchMapsConfig()).rejects.toThrow(MapsApiError);
      await expect(fetchMapsConfig()).rejects.toThrow('Google Maps API key is not configured');
    });
  });

  describe('fetchMapsConfigWithTimeout', () => {
    it('should resolve successfully within timeout', async () => {
      // Arrange
      const testApiKey = 'test-api-key-456';
      vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', testApiKey);

      // Act
      const config = await fetchMapsConfigWithTimeout(5000);

      // Assert
      expect(config).toEqual({ apiKey: testApiKey });
    });

    it('should timeout if request takes too long', async () => {
      // Arrange
      vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key');

      // Act & Assert
      // Set very short timeout to test timeout behavior
      await expect(fetchMapsConfigWithTimeout(1)).rejects.toThrow(MapsApiError);
      await expect(fetchMapsConfigWithTimeout(1)).rejects.toThrow('Request timed out');
    });
  });
});
