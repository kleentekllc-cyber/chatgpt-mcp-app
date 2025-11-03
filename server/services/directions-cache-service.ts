/**
 * Caching service for directions
 */

import { Route, TravelMode, DirectionsCacheKey, CachedDirections } from '../types/directions.js';

// LRU cache implementation
class LRUCache<K, V> {
  private cache: Map<string, V>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const keyStr = JSON.stringify(key);
    const value = this.cache.get(keyStr);

    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(keyStr);
      this.cache.set(keyStr, value);
    }

    return value;
  }

  set(key: K, value: V): void {
    const keyStr = JSON.stringify(key);

    // Delete if exists (to re-add at end)
    if (this.cache.has(keyStr)) {
      this.cache.delete(keyStr);
    }

    // Add to end
    this.cache.set(keyStr, value);

    // Evict oldest if over capacity
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key: K): boolean {
    return this.cache.has(JSON.stringify(key));
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Cache configuration
const MAX_CACHE_SIZE = 100;
const TRANSIT_TTL = 5 * 60 * 1000; // 5 minutes for transit
const DEFAULT_TTL = 15 * 60 * 1000; // 15 minutes for other modes

// In-memory cache
const directionsCache = new LRUCache<DirectionsCacheKey, CachedDirections>(MAX_CACHE_SIZE);

/**
 * Generate cache key from origin, destination, and travel mode
 */
function generateCacheKey(
  origin: any,
  destination: any,
  travelMode: TravelMode
): DirectionsCacheKey {
  return {
    origin: JSON.stringify(origin),
    destination: JSON.stringify(destination),
    travelMode,
  };
}

/**
 * Get TTL based on travel mode
 */
function getTTL(travelMode: TravelMode): number {
  return travelMode === TravelMode.TRANSIT ? TRANSIT_TTL : DEFAULT_TTL;
}

/**
 * Get cached directions if available and not expired
 */
export function getCachedDirections(
  origin: any,
  destination: any,
  travelMode: TravelMode
): Route[] | null {
  const cacheKey = generateCacheKey(origin, destination, travelMode);
  const cached = directionsCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  // Check if expired
  const now = Date.now();
  if (now > cached.expiresAt) {
    return null;
  }

  return cached.routes;
}

/**
 * Cache directions results
 */
export function setCachedDirections(
  origin: any,
  destination: any,
  travelMode: TravelMode,
  routes: Route[]
): void {
  const cacheKey = generateCacheKey(origin, destination, travelMode);
  const ttl = getTTL(travelMode);
  const now = Date.now();

  const cached: CachedDirections = {
    routes,
    timestamp: now,
    expiresAt: now + ttl,
  };

  directionsCache.set(cacheKey, cached);
}

/**
 * Check if directions should bypass cache
 * Skip cache for routes with real-time traffic data
 */
export function shouldBypassDirectionsCache(travelMode: TravelMode): boolean {
  // For now, we don't bypass cache
  // In production, you might want to bypass for driving mode with traffic
  return false;
}

/**
 * Clear all cached directions
 */
export function clearDirectionsCache(): void {
  directionsCache.clear();
}

/**
 * Get cache statistics
 */
export function getDirectionsCacheStats() {
  return {
    size: directionsCache.size,
    maxSize: MAX_CACHE_SIZE,
  };
}
