/**
 * Geocoding Service
 * Converts location strings to lat/lng coordinates
 */

import { getPlacesClient, getApiKey } from '../lib/places-api-client.js';
import { LocationCoordinates } from '../types/business-search.js';

// Simple in-memory cache for geocoding results (24 hour TTL)
interface GeocodeCache {
  [key: string]: {
    coordinates: LocationCoordinates;
    timestamp: number;
  };
}

const geocodeCache: GeocodeCache = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Geocode a location string to lat/lng coordinates
 */
export async function geocodeLocation(
  location: string
): Promise<LocationCoordinates> {
  // Normalize location string for cache key
  const cacheKey = location.toLowerCase().trim();

  // Check cache
  const cached = geocodeCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Geocoding cache hit for: ${location}`);
    return cached.coordinates;
  }

  try {
    const client = getPlacesClient();
    const apiKey = getApiKey();

    const response = await client.geocode({
      params: {
        address: location,
        key: apiKey,
        region: 'us', // Bias to US results
      },
      timeout: 5000,
    });

    if (
      response.data.status !== 'OK' ||
      !response.data.results ||
      response.data.results.length === 0
    ) {
      throw new Error(
        `Geocoding failed for location: ${location}. Status: ${response.data.status}`
      );
    }

    const result = response.data.results[0];
    const coordinates: LocationCoordinates = {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
    };

    // Cache the result
    geocodeCache[cacheKey] = {
      coordinates,
      timestamp: Date.now(),
    };

    console.log(
      `Geocoded location "${location}" to: ${coordinates.lat}, ${coordinates.lng}`
    );

    return coordinates;
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(
      `Failed to geocode location "${location}". Please check the location and try again.`
    );
  }
}

/**
 * Clear expired entries from geocode cache
 */
export function cleanGeocodeCache(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const key in geocodeCache) {
    if (now - geocodeCache[key].timestamp >= CACHE_TTL) {
      delete geocodeCache[key];
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`Cleaned ${cleaned} expired geocoding cache entries`);
  }
}

// Run cache cleanup every hour
setInterval(cleanGeocodeCache, 60 * 60 * 1000);
