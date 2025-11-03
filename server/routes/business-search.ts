/**
 * Business Search API Routes
 * Backend proxy endpoint for Google Places API
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  SearchRequest,
  SearchResponse,
  BusinessResult,
} from '../types/business-search.js';
import {
  validateSearchRequest,
  sanitizeSearchRequest,
} from '../validators/search-validator.js';
import { searchBusinessesWithRetry } from '../services/places-search-service.js';
import {
  transformBusinessResults,
  filterByRating,
  sortByDistance,
} from '../services/data-transformation-service.js';
import {
  getCachedResults,
  setCachedResults,
  shouldBypassCache,
} from '../services/cache-service.js';
import {
  checkRateLimit,
  recordRequest,
  isRateLimitExceeded,
  getRateLimitHeaders,
  logRateLimitWarning,
} from '../services/rate-limit-service.js';
import { geocodeLocation } from '../services/geocoding-service.js';

const router = Router();

/**
 * POST /api/search/businesses
 * Search for businesses based on query parameters
 */
router.post('/businesses', async (req: Request, res: Response) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  try {
    console.log(`[${requestId}] Business search request received:`, req.body);

    // Validate request
    const validationResult = validateSearchRequest(req.body);
    if (!validationResult.isValid) {
      console.warn(`[${requestId}] Validation failed:`, validationResult.errors);
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: validationResult.errors,
        requestId,
      });
    }

    // Sanitize request
    const searchRequest = sanitizeSearchRequest(req.body as SearchRequest);

    // Check rate limit
    const rateLimitInfo = checkRateLimit();
    if (isRateLimitExceeded()) {
      console.warn(`[${requestId}] Rate limit exceeded`);

      // Try to return cached results
      const cachedResults = getCachedResults(searchRequest);
      if (cachedResults) {
        console.log(`[${requestId}] Returning cached results due to rate limit`);

        const response: SearchResponse = {
          businesses: cachedResults,
          totalCount: cachedResults.length,
          queryParams: searchRequest,
          cacheStatus: 'hit',
          requestId,
        };

        return res
          .status(200)
          .set(getRateLimitHeaders())
          .json(response);
      }

      return res
        .status(503)
        .set(getRateLimitHeaders())
        .json({
          error: 'Service temporarily busy. Please try again in a moment.',
          requestId,
        });
    }

    // Log rate limit warnings
    logRateLimitWarning();

    // Check if we should bypass cache
    const bypassCache = shouldBypassCache(searchRequest);
    let cacheStatus: 'hit' | 'miss' | 'bypass' = 'miss';

    // Check cache if not bypassing
    if (!bypassCache) {
      const cachedResults = getCachedResults(searchRequest);
      if (cachedResults) {
        console.log(
          `[${requestId}] Cache hit: ${cachedResults.length} results (${Date.now() - startTime}ms)`
        );

        const response: SearchResponse = {
          businesses: cachedResults,
          totalCount: cachedResults.length,
          queryParams: searchRequest,
          cacheStatus: 'hit',
          requestId,
        };

        return res
          .status(200)
          .set(getRateLimitHeaders())
          .json(response);
      }
    } else {
      cacheStatus = 'bypass';
      console.log(`[${requestId}] Cache bypassed (openNow filter)`);
    }

    // Record API request for rate limiting
    recordRequest();

    // Get geocoded location for distance calculations
    const searchCenter = await geocodeLocation(searchRequest.location);

    // Search businesses using Places API with retry
    const placeResults = await searchBusinessesWithRetry(searchRequest);

    // Transform results
    let businesses = transformBusinessResults(placeResults, searchCenter);

    // Apply additional filtering
    if (searchRequest.filters?.rating) {
      businesses = filterByRating(businesses, searchRequest.filters.rating);
    }

    // Sort by distance
    businesses = sortByDistance(businesses);

    // Cache results if not bypassing
    if (!bypassCache && businesses.length > 0) {
      setCachedResults(searchRequest, businesses);
    }

    const response: SearchResponse = {
      businesses,
      totalCount: businesses.length,
      queryParams: searchRequest,
      cacheStatus,
      requestId,
    };

    const duration = Date.now() - startTime;
    console.log(
      `[${requestId}] Search completed: ${businesses.length} results (${duration}ms)`
    );

    return res
      .status(200)
      .set(getRateLimitHeaders())
      .json(response);
  } catch (error) {
    console.error(`[${requestId}] Search error:`, error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    // Check for specific error types
    if (errorMessage.includes('geocode')) {
      return res.status(400).json({
        error: 'Invalid location',
        message: errorMessage,
        requestId,
      });
    }

    if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('temporarily busy')
    ) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: errorMessage,
        requestId,
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search for businesses. Please try again.',
      requestId,
    });
  }
});

export default router;
