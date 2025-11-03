/**
 * Geolocation service for detecting user location
 */

import type {
  UserLocation,
  GeolocationErrorType,
} from '../types/directions';

// Cache configuration
const LOCATION_CACHE_KEY = 'localhub_user_location';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const GEOLOCATION_TIMEOUT = 10000; // 10 seconds

/**
 * Get cached user location if available and not expired
 */
function getCachedLocation(): UserLocation | null {
  try {
    const cached = sessionStorage.getItem(LOCATION_CACHE_KEY);
    if (!cached) return null;

    const location: UserLocation = JSON.parse(cached);
    const now = Date.now();

    // Check if expired
    if (now - location.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }

    return location;
  } catch (error) {
    console.error('Error reading cached location:', error);
    return null;
  }
}

/**
 * Cache user location
 */
function cacheLocation(location: UserLocation): void {
  try {
    sessionStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
  } catch (error) {
    console.error('Error caching location:', error);
  }
}

/**
 * Clear cached location
 */
export function clearCachedLocation(): void {
  try {
    sessionStorage.removeItem(LOCATION_CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cached location:', error);
  }
}

/**
 * Check if geolocation is supported
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Get geolocation error type from error code
 */
function getErrorType(error: GeolocationPositionError): GeolocationErrorType {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'PERMISSION_DENIED';
    case error.POSITION_UNAVAILABLE:
      return 'POSITION_UNAVAILABLE';
    case error.TIMEOUT:
      return 'TIMEOUT';
    default:
      return 'POSITION_UNAVAILABLE';
  }
}

/**
 * Get user-friendly error message
 */
export function getGeolocationErrorMessage(errorType: GeolocationErrorType): string {
  switch (errorType) {
    case 'PERMISSION_DENIED':
      return 'Location permission denied. Please enable location access in your browser settings or enter your location manually.';
    case 'POSITION_UNAVAILABLE':
      return 'Unable to determine your location. Please check your device settings or enter your location manually.';
    case 'TIMEOUT':
      return 'Location request timed out. Please try again or enter your location manually.';
    case 'UNSUPPORTED':
      return 'Geolocation is not supported by your browser. Please enter your location manually.';
    default:
      return 'Unable to get your location. Please enter it manually.';
  }
}

/**
 * Get current user location
 */
export async function getCurrentLocation(): Promise<UserLocation> {
  // Check if geolocation is supported
  if (!isGeolocationSupported()) {
    throw new Error('UNSUPPORTED');
  }

  // Check cache first
  const cached = getCachedLocation();
  if (cached) {
    console.log('Using cached location');
    return cached;
  }

  // Request new location
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          timestamp: Date.now(),
          accuracy: position.coords.accuracy,
        };

        // Cache the location
        cacheLocation(location);

        resolve(location);
      },
      (error) => {
        const errorType = getErrorType(error);
        reject(new Error(errorType));
      },
      {
        enableHighAccuracy: true,
        timeout: GEOLOCATION_TIMEOUT,
        maximumAge: 0, // Don't use stale position
      }
    );
  });
}

/**
 * Request location with retry logic
 */
export async function getCurrentLocationWithRetry(
  maxRetries: number = 1
): Promise<UserLocation> {
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await getCurrentLocation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on permission denied
      if (lastError.message === 'PERMISSION_DENIED') {
        throw lastError;
      }

      attempt++;

      // Only retry on timeout
      if (lastError.message !== 'TIMEOUT' || attempt > maxRetries) {
        throw lastError;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error('Failed to get location after retries');
}

/**
 * Watch user location for continuous updates
 */
export function watchLocation(
  onUpdate: (location: UserLocation) => void,
  onError: (error: GeolocationErrorType) => void
): () => void {
  if (!isGeolocationSupported()) {
    onError('UNSUPPORTED');
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location: UserLocation = {
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        timestamp: Date.now(),
        accuracy: position.coords.accuracy,
      };

      // Cache the location
      cacheLocation(location);

      onUpdate(location);
    },
    (error) => {
      const errorType = getErrorType(error);
      onError(errorType);
    },
    {
      enableHighAccuracy: true,
      timeout: GEOLOCATION_TIMEOUT,
      maximumAge: CACHE_TTL,
    }
  );

  // Return cleanup function
  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}
