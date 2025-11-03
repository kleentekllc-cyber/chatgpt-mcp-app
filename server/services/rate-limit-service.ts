/**
 * Rate Limiting Service
 * Implements sliding window rate limiting to prevent API quota exhaustion
 */

import { RateLimitInfo } from '../types/business-search.js';

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 60; // Max requests per minute
const RATE_LIMIT_THRESHOLD = 0.9; // Warn at 90% of limit

// Sliding window tracking
interface RequestRecord {
  timestamp: number;
}

const requestHistory: RequestRecord[] = [];

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(): RateLimitInfo {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Remove old requests outside the window
  while (
    requestHistory.length > 0 &&
    requestHistory[0].timestamp < windowStart
  ) {
    requestHistory.shift();
  }

  const currentCount = requestHistory.length;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - currentCount);
  const resetAt = requestHistory.length > 0
    ? requestHistory[0].timestamp + RATE_LIMIT_WINDOW
    : now + RATE_LIMIT_WINDOW;

  return {
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining,
    resetAt,
  };
}

/**
 * Record a new request
 */
export function recordRequest(): void {
  requestHistory.push({
    timestamp: Date.now(),
  });
}

/**
 * Check if approaching rate limit
 */
export function isApproachingLimit(): boolean {
  const info = checkRateLimit();
  const usagePercent = 1 - info.remaining / info.limit;
  return usagePercent >= RATE_LIMIT_THRESHOLD;
}

/**
 * Check if rate limit exceeded
 */
export function isRateLimitExceeded(): boolean {
  const info = checkRateLimit();
  return info.remaining <= 0;
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(): Record<string, string> {
  const info = checkRateLimit();

  return {
    'X-RateLimit-Limit': info.limit.toString(),
    'X-RateLimit-Remaining': info.remaining.toString(),
    'X-RateLimit-Reset': new Date(info.resetAt).toISOString(),
  };
}

/**
 * Log rate limit warning if approaching threshold
 */
export function logRateLimitWarning(): void {
  const info = checkRateLimit();
  const usagePercent = Math.round(
    ((info.limit - info.remaining) / info.limit) * 100
  );

  if (usagePercent >= 80) {
    console.warn(
      `Rate limit at ${usagePercent}%: ${info.remaining}/${info.limit} requests remaining`
    );
  }

  if (usagePercent >= 95) {
    console.error(
      `CRITICAL: Rate limit at ${usagePercent}%: Only ${info.remaining} requests remaining!`
    );
  }
}

/**
 * Reset rate limit (useful for testing)
 */
export function resetRateLimit(): void {
  requestHistory.length = 0;
  console.log('Rate limit reset');
}
