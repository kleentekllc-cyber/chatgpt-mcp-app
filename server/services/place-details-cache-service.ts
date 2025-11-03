/**
 * Cache service for Place Details
 * In-memory caching with 1-hour TTL
 */

import { CachedPlaceDetails, BusinessData } from '../types/place-details.js';

// Cache map: place_id -> CachedPlaceDetails
const placeDetailsCache = new Map<string, CachedPlaceDetails>();

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get cached place details
 */
export function getCachedPlaceDetails(
  placeId: string
): BusinessData | null {
  const cached = placeDetailsCache.get(placeId);

  if (!cached) {
    return null;
  }

  // Check if cache entry has expired
  const now = Date.now();
  const age = now - cached.timestamp;

  if (age > CACHE_TTL_MS) {
    // Cache expired, remove it
    placeDetailsCache.delete(placeId);
    return null;
  }

  return cached.data;
}

/**
 * Set cached place details
 */
export function setCachedPlaceDetails(
  placeId: string,
  data: BusinessData
): void {
  const cached: CachedPlaceDetails = {
    data,
    timestamp: Date.now(),
    place_id: placeId,
  };

  placeDetailsCache.set(placeId, cached);
}

/**
 * Clear all cached place details
 */
export function clearPlaceDetailsCache(): void {
  placeDetailsCache.clear();
}

/**
 * Get cache size
 */
export function getPlaceDetailsCacheSize(): number {
  return placeDetailsCache.size;
}

/**
 * Cleanup expired cache entries
 * Should be called periodically
 */
export function cleanupExpiredPlaceDetailsCache(): number {
  const now = Date.now();
  let removed = 0;

  for (const [placeId, cached] of placeDetailsCache.entries()) {
    const age = now - cached.timestamp;
    if (age > CACHE_TTL_MS) {
      placeDetailsCache.delete(placeId);
      removed++;
    }
  }

  if (removed > 0) {
    console.log(`Cleaned up ${removed} expired place details cache entries`);
  }

  return removed;
}

// Run cleanup every 15 minutes
setInterval(cleanupExpiredPlaceDetailsCache, 15 * 60 * 1000);
