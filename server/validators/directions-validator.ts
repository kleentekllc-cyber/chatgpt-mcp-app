/**
 * Validation for Directions API requests
 */

import { DirectionsRequest, TravelMode, Location } from '../types/directions.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate that a value is a valid location (lat/lng or place ID)
 */
function isValidLocation(location: any): boolean {
  // Check if it's a string (place ID)
  if (typeof location === 'string' && location.trim().length > 0) {
    return true;
  }

  // Check if it's a valid lat/lng object
  if (
    typeof location === 'object' &&
    location !== null &&
    typeof location.lat === 'number' &&
    typeof location.lng === 'number' &&
    !isNaN(location.lat) &&
    !isNaN(location.lng) &&
    location.lat >= -90 &&
    location.lat <= 90 &&
    location.lng >= -180 &&
    location.lng <= 180
  ) {
    return true;
  }

  return false;
}

/**
 * Validate travel mode
 */
function isValidTravelMode(mode: any): mode is TravelMode {
  return Object.values(TravelMode).includes(mode);
}

/**
 * Validate directions request
 */
export function validateDirectionsRequest(request: any): ValidationResult {
  const errors: string[] = [];

  // Check if request is an object
  if (!request || typeof request !== 'object') {
    return {
      isValid: false,
      errors: ['Request must be a valid object'],
    };
  }

  // Validate origin
  if (!request.origin) {
    errors.push('origin is required');
  } else if (!isValidLocation(request.origin)) {
    errors.push('origin must be a valid location (lat/lng object or place ID)');
  }

  // Validate destination
  if (!request.destination) {
    errors.push('destination is required');
  } else if (!isValidLocation(request.destination)) {
    errors.push('destination must be a valid location (lat/lng object or place ID)');
  }

  // Validate travelMode
  if (!request.travelMode) {
    errors.push('travelMode is required');
  } else if (!isValidTravelMode(request.travelMode)) {
    errors.push(
      `travelMode must be one of: ${Object.values(TravelMode).join(', ')}`
    );
  }

  // Check if origin and destination are identical
  if (request.origin && request.destination) {
    const originStr = JSON.stringify(request.origin);
    const destStr = JSON.stringify(request.destination);
    if (originStr === destStr) {
      errors.push('origin and destination cannot be identical');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize directions request
 */
export function sanitizeDirectionsRequest(
  request: any
): DirectionsRequest {
  return {
    origin: request.origin,
    destination: request.destination,
    travelMode: request.travelMode as TravelMode,
  };
}
