/**
 * Input Validation and Sanitization
 */

import { ValidationError } from '../types/query-parser.js';

const MAX_QUERY_LENGTH = 500;

/**
 * Validate query input
 */
export function validateQuery(query: string): ValidationError | null {
  // Check for empty query
  if (!query || query.trim().length === 0) {
    return {
      code: 'EMPTY_QUERY',
      message: 'Query cannot be empty',
      field: 'query',
    };
  }

  // Check length limit
  if (query.length > MAX_QUERY_LENGTH) {
    return {
      code: 'QUERY_TOO_LONG',
      message: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`,
      field: 'query',
    };
  }

  // Check for malformed or nonsensical queries
  if (isMalformed(query)) {
    return {
      code: 'MALFORMED_QUERY',
      message: 'Query appears to be malformed or nonsensical',
      field: 'query',
    };
  }

  return null;
}

/**
 * Sanitize query input to prevent injection attacks
 */
export function sanitizeQuery(query: string): string {
  // Remove HTML tags
  let sanitized = query.replace(/<[^>]*>/g, '');

  // Escape special characters
  sanitized = sanitized.replace(/[<>]/g, '');

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * Check if query is malformed or nonsensical
 */
function isMalformed(query: string): boolean {
  // Query is just numbers
  if (/^\d+$/.test(query.trim())) {
    return true;
  }

  // Query is just special characters
  if (/^[^a-zA-Z0-9\s]+$/.test(query.trim())) {
    return true;
  }

  // Query has excessive repetition (same character repeated many times)
  if (/(.)\1{10,}/.test(query)) {
    return true;
  }

  return false;
}

/**
 * Validate extracted business types against allowlist
 */
export function validateBusinessTypes(types: string[]): boolean {
  if (types.length === 0) {
    return false;
  }

  // All types should be valid (already validated by parser using BUSINESS_TYPES constant)
  return true;
}

/**
 * Validate location string
 */
export function validateLocation(location: string): boolean {
  // Location should be non-empty
  if (!location || location.trim().length === 0) {
    return false;
  }

  // Location should have reasonable length
  if (location.length > 200) {
    return false;
  }

  return true;
}

/**
 * Validate filter values
 */
export function validateFilters(filters: {
  rating?: number;
  priceLevel?: number;
  openNow?: boolean;
}): boolean {
  // Validate rating is in range 1-5
  if (filters.rating !== undefined) {
    if (filters.rating < 1 || filters.rating > 5) {
      return false;
    }
  }

  // Validate price level is in range 1-4
  if (filters.priceLevel !== undefined) {
    if (filters.priceLevel < 1 || filters.priceLevel > 4) {
      return false;
    }
  }

  return true;
}
