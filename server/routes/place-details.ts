/**
 * Place Details API Route
 * Backend endpoint for Google Places Details API
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PlaceDetailsRequest, PlaceDetailsResponse } from '../types/place-details.js';
import { fetchPlaceDetailsWithRetry } from '../services/place-details-service.js';
import { transformPlaceDetails } from '../services/place-details-transformation-service.js';
import {
  getCachedPlaceDetails,
  setCachedPlaceDetails,
} from '../services/place-details-cache-service.js';

const router = Router();

/**
 * POST /api/places/details
 * Get detailed business information by place_id
 */
router.post('/details', async (req: Request, res: Response) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  try {
    console.log(`[${requestId}] Place details request received:`, req.body);

    // Validate request
    const { place_id } = req.body as PlaceDetailsRequest;

    if (!place_id || typeof place_id !== 'string') {
      console.warn(`[${requestId}] Invalid place_id:`, place_id);
      return res.status(400).json({
        error: 'Invalid request',
        message: 'place_id is required and must be a string',
        requestId,
      });
    }

    // Check cache first
    const cachedData = getCachedPlaceDetails(place_id);
    if (cachedData) {
      const duration = Date.now() - startTime;
      console.log(
        `[${requestId}] Cache hit for place ${place_id} (${duration}ms)`
      );

      const response: PlaceDetailsResponse = {
        businessData: cachedData,
        cacheStatus: 'hit',
        requestId,
      };

      return res.status(200).json(response);
    }

    console.log(`[${requestId}] Cache miss, fetching from API...`);

    // Fetch place details from API with retry
    const placeDetails = await fetchPlaceDetailsWithRetry(place_id);

    // Transform to BusinessData format
    const businessData = transformPlaceDetails(placeDetails);

    // Cache the result
    setCachedPlaceDetails(place_id, businessData);

    const duration = Date.now() - startTime;
    console.log(
      `[${requestId}] Place details fetched successfully (${duration}ms)`
    );

    const response: PlaceDetailsResponse = {
      businessData,
      cacheStatus: 'miss',
      requestId,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(`[${requestId}] Place details error:`, error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorMessageLower = errorMessage.toLowerCase();

    // Handle specific error types
    if (errorMessageLower.includes('not found')) {
      return res.status(404).json({
        error: 'Business not found',
        message: 'The requested business could not be found',
        requestId,
      });
    }

    if (errorMessageLower.includes('invalid place id')) {
      return res.status(400).json({
        error: 'Invalid place ID',
        message: errorMessage,
        requestId,
      });
    }

    if (
      errorMessageLower.includes('timeout') ||
      errorMessageLower.includes('timed out') ||
      errorMessageLower.includes('temporarily busy')
    ) {
      return res.status(504).json({
        error: 'Request timeout',
        message: 'The request took too long. Please try again.',
        requestId,
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch business details. Please try again.',
      requestId,
    });
  }
});

export default router;
