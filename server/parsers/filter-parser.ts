/**
 * Filter Parameter Parser
 */

import { FilterParams } from '../types/query-parser.js';

/**
 * Rating patterns and mappings
 */
const RATING_PATTERNS = [
  { pattern: /5[-\s]star/i, value: 5 },
  { pattern: /4[-\s]star/i, value: 4 },
  { pattern: /3[-\s]star/i, value: 3 },
  { pattern: /2[-\s]star/i, value: 2 },
  { pattern: /1[-\s]star/i, value: 1 },
  { pattern: /(\d)\s*stars?/i, value: null }, // Dynamic rating
  { pattern: /highly rated/i, value: 4 },
  { pattern: /top rated/i, value: 4 },
  { pattern: /good reviews/i, value: 4 },
  { pattern: /great reviews/i, value: 4 },
  { pattern: /excellent/i, value: 4 },
];

/**
 * Temporal filter patterns
 */
const TEMPORAL_PATTERNS = [
  'open now',
  'open late',
  '24 hours',
  '24/7',
  'open on sunday',
  'open on',
];

/**
 * Price level mappings
 */
const PRICE_PATTERNS = [
  { pattern: /\$\$\$\$/g, value: 4 },
  { pattern: /\$\$\$/g, value: 3 },
  { pattern: /\$\$/g, value: 2 },
  { pattern: /\$/g, value: 1 },
  { pattern: /cheap/i, value: 1 },
  { pattern: /inexpensive/i, value: 1 },
  { pattern: /affordable/i, value: 2 },
  { pattern: /expensive/i, value: 3 },
  { pattern: /fine dining/i, value: 4 },
  { pattern: /budget/i, value: 1 },
];

/**
 * Attribute keywords
 */
const ATTRIBUTE_KEYWORDS = [
  'wifi',
  'wi-fi',
  'outdoor seating',
  'patio',
  'delivery',
  'takeout',
  'wheelchair accessible',
  'parking',
  'pet friendly',
  'kid friendly',
  'vegan',
  'vegetarian',
  'gluten free',
];

/**
 * Extract filter parameters from query
 */
export function extractFilters(query: string): {
  filters: FilterParams;
  confidence: number;
} {
  const normalizedQuery = query.toLowerCase();
  const filters: FilterParams = {};
  const confidenceScores: number[] = [];

  // Extract rating filter
  const rating = extractRating(normalizedQuery);
  if (rating) {
    filters.rating = rating.value;
    confidenceScores.push(rating.confidence);
  }

  // Extract temporal filter
  const temporal = extractTemporal(normalizedQuery);
  if (temporal) {
    filters.openNow = temporal.openNow;
    confidenceScores.push(temporal.confidence);
  }

  // Extract price level
  const price = extractPriceLevel(normalizedQuery);
  if (price) {
    filters.priceLevel = price.value;
    confidenceScores.push(price.confidence);
  }

  // Extract attributes
  const attributes = extractAttributes(normalizedQuery);
  if (attributes.length > 0) {
    filters.attributes = attributes;
    confidenceScores.push(0.85);
  }

  // Calculate overall confidence
  const overallConfidence =
    confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      : 0;

  return {
    filters,
    confidence: overallConfidence,
  };
}

/**
 * Extract rating filter
 */
function extractRating(
  query: string
): { value: number; confidence: number } | null {
  for (const { pattern, value } of RATING_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      // Handle dynamic rating pattern
      if (value === null && match[1]) {
        const ratingValue = parseInt(match[1], 10);
        if (ratingValue >= 1 && ratingValue <= 5) {
          return { value: ratingValue, confidence: 0.9 };
        }
      }

      if (value !== null) {
        return { value, confidence: 0.9 };
      }
    }
  }

  return null;
}

/**
 * Extract temporal filter
 */
function extractTemporal(
  query: string
): { openNow: boolean; confidence: number } | null {
  for (const pattern of TEMPORAL_PATTERNS) {
    if (query.includes(pattern)) {
      return { openNow: true, confidence: 0.95 };
    }
  }

  return null;
}

/**
 * Extract price level filter
 */
function extractPriceLevel(
  query: string
): { value: number; confidence: number } | null {
  // Check dollar signs first (they should take precedence)
  for (const { pattern, value } of PRICE_PATTERNS) {
    if (pattern.source.startsWith('\\$')) {
      const match = query.match(pattern);
      if (match) {
        return { value, confidence: 0.95 };
      }
    }
  }

  // Then check text patterns
  for (const { pattern, value } of PRICE_PATTERNS) {
    if (!pattern.source.startsWith('\\$')) {
      const match = query.match(pattern);
      if (match) {
        return { value, confidence: 0.85 };
      }
    }
  }

  return null;
}

/**
 * Extract attribute filters
 */
function extractAttributes(query: string): string[] {
  const foundAttributes: string[] = [];

  for (const attribute of ATTRIBUTE_KEYWORDS) {
    if (query.includes(attribute)) {
      foundAttributes.push(attribute);
    }
  }

  return foundAttributes;
}
