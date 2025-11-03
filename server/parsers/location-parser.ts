/**
 * Location Extraction Parser
 */

import { LocationResult, LocationType } from '../types/query-parser.js';

/**
 * Relative location keywords
 */
const RELATIVE_LOCATION_KEYWORDS = [
  'near me',
  'nearby',
  'close by',
  'around here',
  'in the area',
  'local',
  'within walking distance',
];

/**
 * Landmark indicators
 */
const LANDMARK_INDICATORS = [
  'near',
  'by',
  'around',
  'close to',
  'next to',
  'downtown',
];

/**
 * Distance patterns
 */
const DISTANCE_PATTERNS = [
  { pattern: /within (\d+(?:\.\d+)?)\s*(mile|miles)/i, unit: 'miles' as const },
  { pattern: /within (\d+(?:\.\d+)?)\s*(km|kilometer|kilometers)/i, unit: 'km' as const },
  { pattern: /within (\d+(?:\.\d+)?)\s*(m|meter|meters)/i, unit: 'meters' as const },
  { pattern: /less than (\d+(?:\.\d+)?)\s*(mile|miles)/i, unit: 'miles' as const },
  { pattern: /less than (\d+(?:\.\d+)?)\s*(km|kilometer|kilometers)/i, unit: 'km' as const },
  { pattern: /under (\d+(?:\.\d+)?)\s*(mile|miles)/i, unit: 'miles' as const },
  { pattern: /(\d+)\s*mile/i, unit: 'miles' as const },
  { pattern: /(\d+)\s*km/i, unit: 'km' as const },
];

/**
 * Extract location from natural language query
 */
export function extractLocation(query: string): LocationResult {
  const normalizedQuery = query.toLowerCase().trim();

  // Check for relative location
  for (const keyword of RELATIVE_LOCATION_KEYWORDS) {
    if (normalizedQuery.includes(keyword)) {
      return {
        type: 'relative',
        value: keyword,
        confidence: 0.9,
      };
    }
  }

  // Check for distance specifications
  for (const { pattern, unit } of DISTANCE_PATTERNS) {
    const match = normalizedQuery.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      return {
        type: 'relative',
        value: 'near me',
        distance: {
          value,
          unit,
        },
        confidence: 0.85,
      };
    }
  }

  // Extract potential location strings
  const locationResult = extractExplicitLocation(normalizedQuery);
  if (locationResult) {
    return locationResult;
  }

  // Default: no location found
  return {
    type: 'relative',
    value: '',
    confidence: 0.0,
  };
}

/**
 * Extract explicit location (city, neighborhood, landmark)
 */
function extractExplicitLocation(query: string): LocationResult | null {
  // Look for landmark patterns
  for (const indicator of LANDMARK_INDICATORS) {
    const indicatorIndex = query.indexOf(indicator);
    if (indicatorIndex !== -1) {
      // Extract text after the indicator
      const afterIndicator = query.substring(indicatorIndex + indicator.length).trim();

      // Get the next few words (up to first comma or end)
      const locationMatch = afterIndicator.match(/^([^,\.;]+)/);
      if (locationMatch) {
        const location = locationMatch[1].trim();

        // Validate it looks like a location (has letters, reasonable length)
        if (location.length > 2 && location.length < 100 && /[a-zA-Z]/.test(location)) {
          return {
            type: 'landmark',
            value: location,
            confidence: 0.8,
          };
        }
      }
    }
  }

  // Look for "in [location]" pattern
  const inPattern = /\bin\s+([a-zA-Z\s]+?)(?:\s|$|,|\.)/;
  const inMatch = query.match(inPattern);
  if (inMatch) {
    const location = inMatch[1].trim();
    // Filter out common words that aren't locations
    const stopWords = ['the', 'a', 'an', 'my', 'your', 'this', 'that'];
    if (!stopWords.includes(location.toLowerCase()) && location.length > 2) {
      return {
        type: 'explicit',
        value: location,
        confidence: 0.75,
      };
    }
  }

  // Check for zip code patterns
  const zipPattern = /\b\d{5}(?:-\d{4})?\b/;
  const zipMatch = query.match(zipPattern);
  if (zipMatch) {
    return {
      type: 'explicit',
      value: zipMatch[0],
      confidence: 0.95,
    };
  }

  return null;
}

/**
 * Resolve location ambiguity using conversation context
 * (To be implemented when conversation context is integrated)
 */
export function resolveLocationAmbiguity(
  location: LocationResult,
  _previousLocations: string[]
): LocationResult {
  // For now, just return the location as-is
  // Future: implement pronoun resolution and context-based disambiguation
  return location;
}
