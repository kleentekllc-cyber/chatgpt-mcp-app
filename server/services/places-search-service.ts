/**
 * Places API Search Service
 * Handles Text Search and Nearby Search with pagination
 */

import {
  PlaceInputType,
  PlaceData,
} from '@googlemaps/google-maps-services-js';
import { getPlacesClient, getApiKey } from '../lib/places-api-client.js';
import {
  SearchRequest,
  LocationCoordinates,
} from '../types/business-search.js';
import { geocodeLocation } from './geocoding-service.js';

const MAX_RESULTS = 100;
const PAGINATION_DELAY = 2000; // 2 seconds delay between paginated requests

/**
 * Search for businesses using Places API
 */
export async function searchBusinesses(
  request: SearchRequest
): Promise<PlaceData[]> {
  // Geocode location to get coordinates
  const coordinates = await geocodeLocation(request.location);

  // Use Nearby Search for location-based queries
  const results = await nearbySearch(request, coordinates);

  return results.slice(0, MAX_RESULTS);
}

/**
 * Nearby Search implementation with pagination
 */
async function nearbySearch(
  request: SearchRequest,
  coordinates: LocationCoordinates
): Promise<PlaceData[]> {
  const client = getPlacesClient();
  const apiKey = getApiKey();

  let allResults: PlaceData[] = [];
  let nextPageToken: string | undefined;
  let pageCount = 0;
  const maxPages = 5; // Limit to 5 pages (20 results per page = 100 max)

  try {
    do {
      // If we have a next page token, wait before making the request
      if (nextPageToken) {
        await new Promise((resolve) => setTimeout(resolve, PAGINATION_DELAY));
      }

      const params: any = {
        location: coordinates,
        radius: request.filters?.distance || 5000, // Default 5km radius
        key: apiKey,
      };

      // Add type filter if business type is specific
      if (request.businessType && request.businessType !== 'business') {
        params.type = mapBusinessTypeToPlacesType(request.businessType);
      }

      // Add open now filter
      if (request.filters?.openNow) {
        params.opennow = true;
      }

      // Add minimum rating filter
      if (request.filters?.rating) {
        params.minprice = 0;
        params.maxprice = 4;
      }

      // Add price level filter
      if (request.filters?.price) {
        params.minprice = request.filters.price;
        params.maxprice = request.filters.price;
      }

      // Add page token for pagination
      if (nextPageToken) {
        params.pagetoken = nextPageToken;
      }

      const response = await client.placesNearby({
        params,
        timeout: 5000,
      });

      if (response.data.status === 'OK' && response.data.results) {
        allResults = allResults.concat(response.data.results);
        nextPageToken = response.data.next_page_token;
        pageCount++;

        console.log(
          `Fetched page ${pageCount}, total results: ${allResults.length}`
        );
      } else if (response.data.status === 'ZERO_RESULTS') {
        console.log('No results found for search');
        break;
      } else {
        console.warn(
          `Places API returned status: ${response.data.status}`,
          response.data.error_message
        );
        break;
      }

      // Stop if we have enough results or reached max pages
      if (allResults.length >= MAX_RESULTS || pageCount >= maxPages) {
        break;
      }
    } while (nextPageToken);

    return allResults;
  } catch (error) {
    console.error('Nearby search error:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Search request timed out. Please try again.');
      }
      if (error.message.includes('OVER_QUERY_LIMIT')) {
        throw new Error(
          'Service temporarily busy. Please try again in a moment.'
        );
      }
    }

    throw new Error('Failed to search for businesses. Please try again.');
  }
}

/**
 * Text Search implementation (alternative approach)
 */
export async function textSearch(
  request: SearchRequest
): Promise<PlaceData[]> {
  const client = getPlacesClient();
  const apiKey = getApiKey();

  try {
    // Construct query from business type and location
    const query = `${request.businessType} in ${request.location}`;

    const params: any = {
      query,
      key: apiKey,
    };

    // Add open now filter
    if (request.filters?.openNow) {
      params.opennow = true;
    }

    const response = await client.textSearch({
      params,
      timeout: 5000,
    });

    if (response.data.status === 'OK' && response.data.results) {
      return response.data.results.slice(0, MAX_RESULTS);
    } else if (response.data.status === 'ZERO_RESULTS') {
      return [];
    } else {
      console.warn(
        `Text search returned status: ${response.data.status}`,
        response.data.error_message
      );
      return [];
    }
  } catch (error) {
    console.error('Text search error:', error);
    throw new Error('Failed to perform text search. Please try again.');
  }
}

/**
 * Map business type to Google Places type parameter
 */
function mapBusinessTypeToPlacesType(businessType: string): string {
  const typeMap: Record<string, string> = {
    restaurant: 'restaurant',
    coffee_shop: 'cafe',
    cafe: 'cafe',
    bar: 'bar',
    grocery_store: 'grocery_or_supermarket',
    bank: 'bank',
    pharmacy: 'pharmacy',
    gas_station: 'gas_station',
    hotel: 'lodging',
    hair_salon: 'hair_care',
    gym: 'gym',
    auto_repair: 'car_repair',
    dentist: 'dentist',
    veterinarian: 'veterinary_care',
    bakery: 'bakery',
    fast_food: 'restaurant',
    food: 'restaurant',
    store: 'store',
    shopping_mall: 'shopping_mall',
    movie_theater: 'movie_theater',
    park: 'park',
    library: 'library',
    hospital: 'hospital',
    school: 'school',
  };

  return typeMap[businessType.toLowerCase()] || businessType;
}

/**
 * Retry logic with exponential backoff
 */
export async function searchBusinessesWithRetry(
  request: SearchRequest,
  maxRetries: number = 3
): Promise<PlaceData[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await searchBusinesses(request);
    } catch (error) {
      lastError = error as Error;

      // Only retry on transient errors
      if (!isTransientError(error)) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.min(1000 * Math.pow(2, attempt), 4000);
      console.log(
        `Search attempt ${attempt + 1} failed, retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Search failed after multiple retries');
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
      message.includes('500') ||
      message.includes('503')
    );
  }
  return false;
}
