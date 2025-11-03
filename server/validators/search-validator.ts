/**
 * Input validation for business search requests
 */

import { SearchRequest } from '../types/business-search.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate search request parameters
 */
export function validateSearchRequest(request: SearchRequest): ValidationResult {
  const errors: string[] = [];

  // Validate businessType
  if (!request.businessType || typeof request.businessType !== 'string') {
    errors.push('businessType is required and must be a string');
  } else if (request.businessType.trim().length === 0) {
    errors.push('businessType cannot be empty');
  }

  // Validate location
  if (!request.location || typeof request.location !== 'string') {
    errors.push('location is required and must be a string');
  } else if (request.location.trim().length === 0) {
    errors.push('location cannot be empty');
  }

  // Validate filters if present
  if (request.filters) {
    const { rating, price, openNow, distance, attributes } = request.filters;

    // Validate rating (0-5 range)
    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        errors.push('filters.rating must be a number between 0 and 5');
      }
    }

    // Validate price (1-4 range)
    if (price !== undefined) {
      if (
        typeof price !== 'number' ||
        !Number.isInteger(price) ||
        price < 1 ||
        price > 4
      ) {
        errors.push('filters.price must be an integer between 1 and 4');
      }
    }

    // Validate openNow
    if (openNow !== undefined && typeof openNow !== 'boolean') {
      errors.push('filters.openNow must be a boolean');
    }

    // Validate distance
    if (distance !== undefined) {
      if (typeof distance !== 'number' || distance <= 0) {
        errors.push('filters.distance must be a positive number');
      }
    }

    // Validate attributes
    if (attributes !== undefined) {
      if (!Array.isArray(attributes)) {
        errors.push('filters.attributes must be an array');
      } else if (
        attributes.some((attr) => typeof attr !== 'string')
      ) {
        errors.push('filters.attributes must be an array of strings');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize search request to prevent injection attacks
 */
export function sanitizeSearchRequest(request: SearchRequest): SearchRequest {
  return {
    businessType: sanitizeString(request.businessType),
    location: sanitizeString(request.location),
    filters: request.filters
      ? {
          rating: request.filters.rating,
          price: request.filters.price,
          openNow: request.filters.openNow,
          distance: request.filters.distance,
          attributes: request.filters.attributes?.map(sanitizeString),
        }
      : undefined,
  };
}

/**
 * Sanitize string to remove potentially dangerous characters
 */
function sanitizeString(value: string): string {
  if (typeof value !== 'string') return '';

  // Remove HTML tags
  let sanitized = value.replace(/<[^>]*>/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}
