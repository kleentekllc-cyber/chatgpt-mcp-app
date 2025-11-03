/**
 * Business Type Extraction Parser
 */

import { BusinessType, BusinessTypeResult } from '../types/query-parser.js';
import {
  BUSINESS_TYPES,
  BUSINESS_TYPE_SYNONYMS,
} from '../constants/business-types.js';

/**
 * Extract business types from natural language query
 */
export function extractBusinessType(query: string): BusinessTypeResult {
  const normalizedQuery = query.toLowerCase().trim();
  const detectedTypes: BusinessType[] = [];
  let maxConfidence = 0;

  // Check for exact matches in synonyms
  for (const [synonym, canonicalType] of Object.entries(
    BUSINESS_TYPE_SYNONYMS
  )) {
    if (normalizedQuery.includes(synonym)) {
      if (!detectedTypes.includes(canonicalType)) {
        detectedTypes.push(canonicalType);
        // Exact match gets higher confidence
        maxConfidence = Math.max(maxConfidence, 0.9);
      }
    }
  }

  // Check for direct business type matches
  for (const businessType of BUSINESS_TYPES) {
    const typePattern = businessType.replace(/_/g, ' ');
    if (normalizedQuery.includes(typePattern)) {
      if (!detectedTypes.includes(businessType)) {
        detectedTypes.push(businessType);
        maxConfidence = Math.max(maxConfidence, 0.95);
      }
    }
  }

  // Handle "or" alternatives (e.g., "coffee shops or bakeries")
  if (normalizedQuery.includes(' or ')) {
    // Already handled by individual matches above
    // Just increase confidence slightly if we found multiple types
    if (detectedTypes.length > 1) {
      maxConfidence = Math.max(maxConfidence, 0.85);
    }
  }

  // If no types detected, default to generic "business" or "place"
  if (detectedTypes.length === 0) {
    detectedTypes.push('business');
    maxConfidence = 0.3; // Low confidence for default
  }

  return {
    types: detectedTypes,
    confidence: maxConfidence,
  };
}
