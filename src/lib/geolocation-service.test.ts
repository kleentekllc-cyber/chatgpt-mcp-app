/**
 * Tests for Geolocation Service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getCurrentLocation,
  getCurrentLocationWithRetry,
  isGeolocationSupported,
  getGeolocationErrorMessage,
  clearCachedLocation,
} from './geolocation-service';

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
  configurable: true,
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

describe('Geolocation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
  });

  describe('isGeolocationSupported', () => {
    it('should return true when geolocation is supported', () => {
      expect(isGeolocationSupported()).toBe(true);
    });
  });

  describe('getCurrentLocation', () => {
    it('should successfully get current location', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
        timestamp: Date.now(),
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition as any);
      });

      const location = await getCurrentLocation();

      expect(location.coords.lat).toBe(40.7128);
      expect(location.coords.lng).toBe(-74.006);
      expect(location.accuracy).toBe(10);
    });

    it('should handle permission denied error', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'Permission denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError as any);
      });

      await expect(getCurrentLocation()).rejects.toThrow('PERMISSION_DENIED');
    });

    it('should handle timeout error', async () => {
      const mockError = {
        code: 3, // TIMEOUT
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError as any);
      });

      await expect(getCurrentLocation()).rejects.toThrow('TIMEOUT');
    });

    it('should use cached location when available', async () => {
      // Cache a location
      const cachedLocation = {
        coords: { lat: 40.7128, lng: -74.006 },
        timestamp: Date.now(),
        accuracy: 10,
      };

      sessionStorageMock.setItem('localhub_user_location', JSON.stringify(cachedLocation));

      const location = await getCurrentLocation();

      expect(location.coords.lat).toBe(40.7128);
      expect(mockGeolocation.getCurrentPosition).not.toHaveBeenCalled();
    });

    it('should not use expired cached location', async () => {
      // Cache an expired location (6 minutes ago)
      const expiredLocation = {
        coords: { lat: 40.7128, lng: -74.006 },
        timestamp: Date.now() - 6 * 60 * 1000,
        accuracy: 10,
      };

      sessionStorageMock.setItem('localhub_user_location', JSON.stringify(expiredLocation));

      const mockPosition = {
        coords: {
          latitude: 40.7138,
          longitude: -74.007,
          accuracy: 10,
        },
        timestamp: Date.now(),
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition as any);
      });

      const location = await getCurrentLocation();

      expect(location.coords.lat).toBe(40.7138);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });
  });

  describe('getCurrentLocationWithRetry', () => {
    it('should retry on timeout error', async () => {
      const mockError = {
        code: 3, // TIMEOUT
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
        timestamp: Date.now(),
      };

      // First call fails with timeout, second succeeds
      let callCount = 0;
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        callCount++;
        if (callCount === 1) {
          error(mockError as any);
        } else {
          success(mockPosition as any);
        }
      });

      const location = await getCurrentLocationWithRetry(1);

      expect(location.coords.lat).toBe(40.7128);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    });

    it('should not retry on permission denied', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'Permission denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError as any);
      });

      await expect(getCurrentLocationWithRetry(1)).rejects.toThrow('PERMISSION_DENIED');
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    });
  });

  describe('getGeolocationErrorMessage', () => {
    it('should return appropriate message for each error type', () => {
      expect(getGeolocationErrorMessage('PERMISSION_DENIED')).toContain('permission');
      expect(getGeolocationErrorMessage('POSITION_UNAVAILABLE')).toContain('Unable');
      expect(getGeolocationErrorMessage('TIMEOUT')).toContain('timed out');
      expect(getGeolocationErrorMessage('UNSUPPORTED')).toContain('not supported');
    });
  });

  describe('clearCachedLocation', () => {
    it('should clear cached location from sessionStorage', () => {
      sessionStorageMock.setItem('localhub_user_location', JSON.stringify({ coords: { lat: 0, lng: 0 }, timestamp: Date.now() }));

      clearCachedLocation();

      expect(sessionStorageMock.getItem('localhub_user_location')).toBeNull();
    });
  });
});
