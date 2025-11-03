/**
 * Google Places API Client Wrapper
 * Handles initialization and configuration of the Places API client
 */

import { Client } from '@googlemaps/google-maps-services-js';

// Global client instance
let placesClient: Client | null = null;

/**
 * Get or initialize the Places API client
 */
export function getPlacesClient(): Client {
  if (!placesClient) {
    placesClient = new Client({});
  }
  return placesClient;
}

/**
 * Get the API key from environment
 */
export function getApiKey(): string {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY environment variable is not set');
  }

  return apiKey;
}

/**
 * Validate API key is configured on server startup
 */
export function validateApiKeyOnStartup(): void {
  try {
    getApiKey();
    console.log('Google Places API key validated successfully');
  } catch (error) {
    console.error('Failed to validate Google Places API key:', error);
    throw error;
  }
}
