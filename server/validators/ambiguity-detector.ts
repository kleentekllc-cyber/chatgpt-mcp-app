/**
 * Ambiguity Detection for Query Parsing
 */

import { AmbiguityDetection, QueryParseResult } from '../types/query-parser.js';

const CONFIDENCE_THRESHOLD = parseFloat(
  process.env.CONFIDENCE_THRESHOLD || '0.6'
);

/**
 * Common ambiguous location names (city names that exist in multiple states)
 */
const AMBIGUOUS_LOCATIONS = [
  'portland',
  'springfield',
  'franklin',
  'clinton',
  'washington',
  'madison',
  'arlington',
];

/**
 * Detect ambiguities in parsed query result
 */
export function detectAmbiguities(
  result: QueryParseResult
): AmbiguityDetection | null {
  // Check for missing business type
  if (
    result.businessType.length === 0 ||
    result.businessType[0] === 'business'
  ) {
    if (result.confidence < CONFIDENCE_THRESHOLD) {
      return {
        field: 'businessType',
        detectedValues: result.businessType,
        question:
          'What type of business are you looking for? (e.g., restaurants, coffee shops, gyms)',
        confidence: result.confidence,
      };
    }
  }

  // Check for missing or ambiguous location
  if (!result.location.value || result.location.value.trim().length === 0) {
    return {
      field: 'location',
      detectedValues: [],
      question: 'Where would you like to search? (e.g., Seattle, downtown, near me)',
      confidence: 0.0,
    };
  }

  // Check for ambiguous location names
  const locationLower = result.location.value.toLowerCase();
  if (AMBIGUOUS_LOCATIONS.some((loc) => locationLower.includes(loc))) {
    // Only flag as ambiguous if no additional context (state, zip code, etc.)
    if (
      result.location.value.split(/\s+/).length <= 2 &&
      !/\d{5}/.test(result.location.value)
    ) {
      return {
        field: 'location',
        detectedValues: [result.location.value],
        question: `I found "${result.location.value}" - which state or area did you mean?`,
        confidence: result.location.confidence,
      };
    }
  }

  // Check for low confidence on location
  if (result.location.confidence < CONFIDENCE_THRESHOLD) {
    return {
      field: 'location',
      detectedValues: [result.location.value],
      question: `Did you mean to search in "${result.location.value}"?`,
      confidence: result.location.confidence,
    };
  }

  // No significant ambiguities detected
  return null;
}

/**
 * Generate clarifying question for ambiguity
 */
export function generateClarifyingQuestion(
  ambiguity: AmbiguityDetection
): string {
  return ambiguity.question;
}
