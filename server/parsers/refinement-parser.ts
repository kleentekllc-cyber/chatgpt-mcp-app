/**
 * Refinement Query Parser
 * Detects and parses refinement intent from natural language queries
 */

import {
  RefinementParseResult,
  RefinementQueryResult,
  FilterType,
  RatingRefinement,
  PriceRefinement,
  OpenNowRefinement,
  DistanceRefinement,
  AttributeRefinement,
  LimitRefinement,
} from '../types/conversation.js';

/**
 * Refinement intent patterns
 */
const REFINEMENT_PATTERNS = [
  /show\s+only/i,
  /filter\s+to/i,
  /which\s+are/i,
  /just\s+the/i,
  /limit\s+to/i,
  /only\s+show/i,
  /narrow\s+down/i,
  /reduce\s+to/i,
];

/**
 * Rating patterns with thresholds
 */
const RATING_PATTERNS = [
  { pattern: /(\d+)\+\s*stars?/i, handler: (m: RegExpMatchArray) => parseFloat(m[1]) },
  { pattern: /at\s+least\s+(\d+\.?\d*)\s*stars?/i, handler: (m: RegExpMatchArray) => parseFloat(m[1]) },
  { pattern: /above\s+(\d+\.?\d*)\s*stars?/i, handler: (m: RegExpMatchArray) => parseFloat(m[1]) },
  { pattern: /highly\s+rated/i, handler: () => 4.0 },
  { pattern: /top\s+rated/i, handler: () => 4.5 },
  { pattern: /(\d+)\s*star/i, handler: (m: RegExpMatchArray) => parseFloat(m[1]) },
];

/**
 * Temporal constraint patterns
 */
const TEMPORAL_PATTERNS = [
  { pattern: /open\s+now/i, value: true },
  { pattern: /open\s+late/i, value: true },
  { pattern: /24\s*hours?/i, value: true },
  { pattern: /24\/7/i, value: true },
  { pattern: /open\s+on\s+weekends?/i, value: true },
];

/**
 * Price level patterns
 */
const PRICE_PATTERNS = [
  { pattern: /\$\$\$\$/g, value: 4, handler: null },
  { pattern: /\$\$\$/g, value: 3, handler: null },
  { pattern: /\$\$/g, value: 2, handler: null },
  { pattern: /\$/g, value: 1, handler: null },
  { pattern: /cheap/i, value: 1, handler: null },
  { pattern: /inexpensive/i, value: 1, handler: null },
  { pattern: /affordable/i, value: 2, handler: null },
  { pattern: /expensive/i, value: 3, handler: null },
  { pattern: /fine\s+dining/i, value: 4, handler: null },
  { pattern: /under\s+\$(\d+)/i, value: 0, handler: (m: RegExpMatchArray) => priceAmountToLevel(parseInt(m[1])) },
];

/**
 * Distance patterns
 */
const DISTANCE_PATTERNS = [
  { pattern: /within\s+(\d+\.?\d*)\s*miles?/i, handler: (m: RegExpMatchArray) => parseFloat(m[1]) * 1609.34 },
  { pattern: /within\s+(\d+\.?\d*)\s*km/i, handler: (m: RegExpMatchArray) => parseFloat(m[1]) * 1000 },
  { pattern: /less\s+than\s+(\d+\.?\d*)\s*miles?/i, handler: (m: RegExpMatchArray) => parseFloat(m[1]) * 1609.34 },
  { pattern: /less\s+than\s+(\d+\.?\d*)\s*km/i, handler: (m: RegExpMatchArray) => parseFloat(m[1]) * 1000 },
  { pattern: /walking\s+distance/i, handler: () => 0.5 * 1609.34 },
  { pattern: /nearby/i, handler: () => 2 * 1609.34 },
  { pattern: /close\s+by/i, handler: () => 2 * 1609.34 },
];

/**
 * Attribute patterns
 */
const ATTRIBUTE_PATTERNS = [
  'wifi',
  'wi-fi',
  'outdoor seating',
  'patio',
  'delivery',
  'takeout',
  'take-out',
  'wheelchair accessible',
  'parking',
  'valet parking',
  'pet friendly',
  'kid friendly',
  'family friendly',
];

/**
 * Detect if query is a refinement
 */
export function detectRefinementIntent(query: string): boolean {
  const normalizedQuery = query.toLowerCase();

  // Check for explicit refinement patterns
  for (const pattern of REFINEMENT_PATTERNS) {
    if (pattern.test(normalizedQuery)) {
      return true;
    }
  }

  // Check if query only contains filter terms without new search intent
  const hasBusinessType = /restaurant|coffee|cafe|bar|shop|store|business/i.test(query);
  const hasLocation = /near|in\s+|at\s+|around|downtown|street|avenue/i.test(query);
  const hasFilterTerms = /stars?|rated|open|cheap|expensive|\$|parking|delivery|wifi|distance|within|mile/i.test(query);

  // If has filter terms but no business type or location, likely a refinement
  return hasFilterTerms && !hasBusinessType && !hasLocation;
}

/**
 * Parse refinement query into structured refinements
 */
export function parseRefinementQuery(query: string): RefinementParseResult {
  const normalizedQuery = query.toLowerCase();
  const refinements: RefinementQueryResult[] = [];
  const confidenceScores: number[] = [];

  // Detect refinement intent
  const isRefinement = detectRefinementIntent(query);

  if (!isRefinement) {
    return {
      isRefinement: false,
      refinements: [],
      confidence: 0,
      originalQuery: query,
    };
  }

  // Parse rating refinement
  const ratingRefinement = parseRatingRefinement(normalizedQuery);
  if (ratingRefinement) {
    refinements.push(ratingRefinement);
    confidenceScores.push(ratingRefinement.confidence);
  }

  // Parse temporal refinement
  const temporalRefinement = parseTemporalRefinement(normalizedQuery);
  if (temporalRefinement) {
    refinements.push(temporalRefinement);
    confidenceScores.push(temporalRefinement.confidence);
  }

  // Parse price refinement
  const priceRefinement = parsePriceRefinement(normalizedQuery);
  if (priceRefinement) {
    refinements.push(priceRefinement);
    confidenceScores.push(priceRefinement.confidence);
  }

  // Parse distance refinement
  const distanceRefinement = parseDistanceRefinement(normalizedQuery);
  if (distanceRefinement) {
    refinements.push(distanceRefinement);
    confidenceScores.push(distanceRefinement.confidence);
  }

  // Parse attribute refinement
  const attributeRefinement = parseAttributeRefinement(normalizedQuery);
  if (attributeRefinement) {
    refinements.push(attributeRefinement);
    confidenceScores.push(attributeRefinement.confidence);
  }

  // Calculate overall confidence
  const overallConfidence =
    confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      : 0.5;

  console.log(
    `[Refinement Parser] Parsed ${refinements.length} refinements from query: "${query}"`
  );

  return {
    isRefinement: true,
    refinements,
    confidence: overallConfidence,
    originalQuery: query,
  };
}

/**
 * Parse rating refinement
 */
function parseRatingRefinement(query: string): RatingRefinement | null {
  for (const { pattern, handler } of RATING_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      const threshold = handler(match);
      return {
        filterType: FilterType.RATING,
        threshold,
        confidence: 0.9,
      };
    }
  }
  return null;
}

/**
 * Parse temporal constraint refinement
 */
function parseTemporalRefinement(query: string): OpenNowRefinement | null {
  for (const { pattern, value } of TEMPORAL_PATTERNS) {
    if (pattern.test(query)) {
      return {
        filterType: FilterType.OPEN_NOW,
        openNow: value,
        confidence: 0.95,
      };
    }
  }
  return null;
}

/**
 * Parse price refinement
 */
function parsePriceRefinement(query: string): PriceRefinement | null {
  // Check dollar signs first
  for (const { pattern, value, handler } of PRICE_PATTERNS) {
    if (pattern.source.startsWith('\\$')) {
      const match = query.match(pattern);
      if (match) {
        const level = handler ? handler(match) : value;
        return {
          filterType: FilterType.PRICE,
          maxLevel: level,
          confidence: 0.95,
        };
      }
    }
  }

  // Then check text patterns
  for (const { pattern, value, handler } of PRICE_PATTERNS) {
    if (!pattern.source.startsWith('\\$')) {
      const match = query.match(pattern);
      if (match) {
        const level = handler ? handler(match) : value;
        return {
          filterType: FilterType.PRICE,
          maxLevel: level,
          confidence: 0.85,
        };
      }
    }
  }

  return null;
}

/**
 * Parse distance refinement
 */
function parseDistanceRefinement(query: string): DistanceRefinement | null {
  for (const { pattern, handler } of DISTANCE_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      const maxDistance = handler(match);
      return {
        filterType: FilterType.DISTANCE,
        maxDistance,
        confidence: 0.9,
      };
    }
  }
  return null;
}

/**
 * Parse attribute refinement
 */
function parseAttributeRefinement(query: string): AttributeRefinement | null {
  const foundAttributes: string[] = [];

  for (const attribute of ATTRIBUTE_PATTERNS) {
    if (query.includes(attribute)) {
      foundAttributes.push(attribute);
    }
  }

  if (foundAttributes.length > 0) {
    return {
      filterType: FilterType.ATTRIBUTE,
      attributes: foundAttributes,
      confidence: 0.85,
    };
  }

  return null;
}

/**
 * Convert price amount to price level (1-4)
 */
function priceAmountToLevel(amount: number): number {
  if (amount <= 10) return 1;
  if (amount <= 20) return 2;
  if (amount <= 40) return 3;
  return 4;
}
