/**
 * Directions API Routes
 * Backend proxy endpoint for Google Directions API
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DirectionsRequest, DirectionsResponse, TravelMode } from '../types/directions.js';
import {
  validateDirectionsRequest,
  sanitizeDirectionsRequest,
} from '../validators/directions-validator.js';
import { getDirectionsWithRetry } from '../services/directions-api-service.js';
import {
  getCachedDirections,
  setCachedDirections,
  shouldBypassDirectionsCache,
} from '../services/directions-cache-service.js';

const router = Router();

/**
 * POST /api/directions
 * Get directions between origin and destination
 */
router.post('/', async (req: Request, res: Response) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  try {
    console.log(`[${requestId}] Directions request received:`, req.body);

    // Validate request
    const validationResult = validateDirectionsRequest(req.body);
    if (!validationResult.isValid) {
      console.warn(`[${requestId}] Validation failed:`, validationResult.errors);
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: validationResult.errors,
        requestId,
      });
    }

    // Sanitize request
    const directionsRequest = sanitizeDirectionsRequest(req.body);

    // Check if we should bypass cache
    const bypassCache = shouldBypassDirectionsCache(directionsRequest.travelMode);
    let cacheStatus: 'hit' | 'miss' | 'bypass' = 'miss';

    // Check cache if not bypassing
    if (!bypassCache) {
      const cachedRoutes = getCachedDirections(
        directionsRequest.origin,
        directionsRequest.destination,
        directionsRequest.travelMode
      );

      if (cachedRoutes) {
        console.log(
          `[${requestId}] Cache hit: ${cachedRoutes.length} routes (${Date.now() - startTime}ms)`
        );

        const response: DirectionsResponse = {
          routes: cachedRoutes,
          status: 'OK',
          requestId,
          cacheStatus: 'hit',
          timestamp: Date.now(),
        };

        return res.status(200).json(response);
      }
    } else {
      cacheStatus = 'bypass';
      console.log(`[${requestId}] Cache bypassed`);
    }

    // Fetch directions from Google API with retry
    const routes = await getDirectionsWithRetry(directionsRequest);

    // Check if no route found
    if (routes.length === 0) {
      console.log(`[${requestId}] No route found`);
      return res.status(404).json({
        error: 'No route available for this mode. Try a different transport option.',
        requestId,
      });
    }

    // Cache results if not bypassing
    if (!bypassCache) {
      setCachedDirections(
        directionsRequest.origin,
        directionsRequest.destination,
        directionsRequest.travelMode,
        routes
      );
    }

    const response: DirectionsResponse = {
      routes,
      status: 'OK',
      requestId,
      cacheStatus,
      timestamp: Date.now(),
    };

    const duration = Date.now() - startTime;
    console.log(
      `[${requestId}] Directions completed: ${routes.length} routes (${duration}ms)`
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error(`[${requestId}] Directions error:`, error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    // Check for specific error types
    if (
      errorMessage.includes('ZERO_RESULTS') ||
      errorMessage.includes('NOT_FOUND')
    ) {
      return res.status(404).json({
        error: 'No route available for this mode. Try a different transport option.',
        requestId,
      });
    }

    if (errorMessage.includes('INVALID_REQUEST')) {
      return res.status(400).json({
        error: 'Invalid location parameters',
        message: errorMessage,
        requestId,
      });
    }

    if (errorMessage.includes('timeout')) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'Request timeout. Please try again.',
        requestId,
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to calculate directions. Please try again.',
      requestId,
    });
  }
});

export default router;
