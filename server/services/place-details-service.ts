/**
 * Places Details Service
 * Handles Google Places API Details requests with retry and caching
 */

import { getPlacesClient, getApiKey } from '../lib/places-api-client.js';
import { PlaceDetails } from '../types/place-details.js';

const TIMEOUT_MS = 3000; // 3 second timeout per spec requirements

/**
 * Fetch place details from Google Places API
 */
export async function fetchPlaceDetails(
  placeId: string
): Promise<PlaceDetails> {
  const client = getPlacesClient();
  const apiKey = getApiKey();

  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'formatted_phone_number',
          'international_phone_number',
          'website',
          'url',
          'rating',
          'user_ratings_total',
          'price_level',
          'opening_hours',
          'photos',
          'reviews',
          'business_status',
          'types',
          'geometry',
          'address_components',
        ],
        key: apiKey,
      },
      timeout: TIMEOUT_MS,
    });

    if (response.data.status === 'OK' && response.data.result) {
      return response.data.result as PlaceDetails;
    } else if (response.data.status === 'NOT_FOUND') {
      throw new Error('Business not found');
    } else if (response.data.status === 'INVALID_REQUEST') {
      throw new Error('Invalid place ID');
    } else {
      console.warn(
        `Place Details API returned status: ${response.data.status}`,
        response.data.error_message
      );
      throw new Error('Failed to fetch place details');
    }
  } catch (error) {
    console.error('Place details fetch error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      }
      if (error.message.includes('OVER_QUERY_LIMIT')) {
        throw new Error(
          'Service temporarily busy. Please try again in a moment.'
        );
      }
      // Re-throw known errors
      if (
        error.message.includes('not found') ||
        error.message.includes('Invalid place ID')
      ) {
        throw error;
      }
    }

    throw new Error('Failed to fetch place details. Please try again.');
  }
}

/**
 * Fetch place details with retry logic and exponential backoff
 */
export async function fetchPlaceDetailsWithRetry(
  placeId: string,
  maxRetries: number = 3
): Promise<PlaceDetails> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchPlaceDetails(placeId);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on non-transient errors
      if (!isTransientError(error)) {
        throw error;
      }

      // Exponential backoff: 500ms, 1s, 2s
      const delay = Math.min(500 * Math.pow(2, attempt), 2000);
      console.log(
        `Place details attempt ${attempt + 1} failed, retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Failed to fetch place details after retries');
}

/**
 * Check if error is transient and retryable
 */
function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('temporarily busy') ||
      message.includes('500') ||
      message.includes('503')
    );
  }
  return false;
}
