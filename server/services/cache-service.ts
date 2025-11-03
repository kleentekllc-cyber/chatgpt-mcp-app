/**
 * Cache Service
 * In-memory caching with LRU eviction and TTL
 */

import {
  SearchRequest,
  CachedResult,
  BusinessResult,
} from '../types/business-search.js';

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const MAX_CACHE_SIZE = 500;

interface CacheEntry {
  data: CachedResult;
  lastAccessed: number;
}

// In-memory cache using Map for LRU tracking
const cache = new Map<string, CacheEntry>();

/**
 * Generate cache key from search request
 */
export function generateCacheKey(request: SearchRequest): string {
  // Normalize and sort filters for consistent keys
  const normalizedRequest = {
    businessType: request.businessType.toLowerCase().trim(),
    location: request.location.toLowerCase().trim(),
    filters: request.filters
      ? {
          rating: request.filters.rating,
          price: request.filters.price,
          openNow: request.filters.openNow,
          distance: request.filters.distance,
          attributes: request.filters.attributes?.sort(),
        }
      : {},
  };

  // Convert to JSON string
  return JSON.stringify(normalizedRequest);
}

/**
 * Get cached results if available and not expired
 */
export function getCachedResults(
  request: SearchRequest
): BusinessResult[] | null {
  const key = generateCacheKey(request);
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if expired
  if (Date.now() - entry.data.timestamp > CACHE_TTL) {
    cache.delete(key);
    console.log(`Cache expired for key: ${key.substring(0, 50)}...`);
    return null;
  }

  // Update last accessed time for LRU
  entry.lastAccessed = Date.now();
  cache.set(key, entry);

  console.log(
    `Cache hit for key: ${key.substring(0, 50)}... (${entry.data.results.length} results)`
  );
  return entry.data.results;
}

/**
 * Store results in cache
 */
export function setCachedResults(
  request: SearchRequest,
  results: BusinessResult[]
): void {
  const key = generateCacheKey(request);

  // Check if cache is full and needs eviction
  if (cache.size >= MAX_CACHE_SIZE) {
    evictLRUEntry();
  }

  const cachedResult: CachedResult = {
    results,
    timestamp: Date.now(),
    queryParams: request,
  };

  const entry: CacheEntry = {
    data: cachedResult,
    lastAccessed: Date.now(),
  };

  cache.set(key, entry);
  console.log(
    `Cached ${results.length} results for key: ${key.substring(0, 50)}...`
  );
}

/**
 * Check if cache should be bypassed for a request
 */
export function shouldBypassCache(request: SearchRequest): boolean {
  // Bypass cache for openNow queries to ensure real-time data
  return request.filters?.openNow === true;
}

/**
 * Evict least recently used entry from cache
 */
function evictLRUEntry(): void {
  let oldestKey: string | null = null;
  let oldestTime = Date.now();

  // Find the least recently used entry
  for (const [key, entry] of cache.entries()) {
    if (entry.lastAccessed < oldestTime) {
      oldestTime = entry.lastAccessed;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    cache.delete(oldestKey);
    console.log(`Evicted LRU cache entry: ${oldestKey.substring(0, 50)}...`);
  }
}

/**
 * Clear expired entries from cache
 */
export function clearExpiredEntries(): void {
  const now = Date.now();
  let cleared = 0;

  for (const [key, entry] of cache.entries()) {
    if (now - entry.data.timestamp > CACHE_TTL) {
      cache.delete(key);
      cleared++;
    }
  }

  if (cleared > 0) {
    console.log(`Cleared ${cleared} expired cache entries`);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    maxSize: MAX_CACHE_SIZE,
    ttl: CACHE_TTL,
  };
}

/**
 * Clear all cache entries (useful for testing)
 */
export function clearCache(): void {
  cache.clear();
  console.log('Cache cleared');
}

// Run cache cleanup every 5 minutes
setInterval(clearExpiredEntries, 5 * 60 * 1000);
