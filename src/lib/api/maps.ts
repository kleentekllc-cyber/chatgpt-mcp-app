/**
 * Google Maps API Configuration Client
 * Handles fetching and managing Google Maps API configuration
 */

import type { MapConfig } from '../../types/google-maps';

export class MapsApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MapsApiError';
  }
}

/**
 * Fetch Google Maps API configuration
 * In development: reads from environment variables
 * In production: should proxy through backend API endpoint
 *
 * @returns Promise<MapConfig> - Configuration object with API key
 * @throws {MapsApiError} - If API key is missing or invalid
 */
export async function fetchMapsConfig(): Promise<MapConfig> {
  try {
    // In development, read from Vite environment variables
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new MapsApiError(
        'Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env.local file.'
      );
    }

    // Simulate network delay for realistic loading states
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      apiKey,
    };
  } catch (error) {
    if (error instanceof MapsApiError) {
      throw error;
    }

    console.error('Failed to fetch Maps configuration:', error);
    throw new MapsApiError('Failed to load Maps configuration. Please try again.');
  }
}

/**
 * Fetch Maps configuration with timeout
 *
 * @param timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns Promise<MapConfig>
 * @throws {MapsApiError} - If request times out or fails
 */
export async function fetchMapsConfigWithTimeout(timeoutMs: number = 10000): Promise<MapConfig> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new MapsApiError('Request timed out. Please check your connection and try again.'));
    }, timeoutMs);
  });

  return Promise.race([fetchMapsConfig(), timeoutPromise]);
}
