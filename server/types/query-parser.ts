/**
 * Type definitions for Natural Language Query Parsing
 */

/**
 * Confidence score for extracted parameters (0-1 range)
 */
export type ConfidenceScore = number;

/**
 * Business type string literal union
 */
export type BusinessType =
  | 'restaurant'
  | 'coffee_shop'
  | 'bar'
  | 'grocery_store'
  | 'bank'
  | 'pharmacy'
  | 'gas_station'
  | 'hotel'
  | 'hair_salon'
  | 'gym'
  | 'auto_repair'
  | 'dentist'
  | 'veterinarian'
  | 'bakery'
  | 'cafe'
  | 'fast_food'
  | 'food'
  | 'store'
  | 'shopping_mall'
  | 'movie_theater'
  | 'park'
  | 'library'
  | 'hospital'
  | 'school'
  | 'business'
  | 'place';

/**
 * Location type indicator
 */
export type LocationType = 'explicit' | 'relative' | 'landmark';

/**
 * Filter parameters for business search
 */
export interface FilterParams {
  rating?: number;
  priceLevel?: number;
  openNow?: boolean;
  distance?: {
    value: number;
    unit: 'miles' | 'km' | 'meters';
  };
  attributes?: string[];
}

/**
 * Location extraction result
 */
export interface LocationResult {
  type: LocationType;
  value: string;
  distance?: {
    value: number;
    unit: 'miles' | 'km' | 'meters';
  };
  confidence: ConfidenceScore;
}

/**
 * Business type extraction result
 */
export interface BusinessTypeResult {
  types: BusinessType[];
  confidence: ConfidenceScore;
}

/**
 * Conversation context for pronoun resolution and location tracking
 */
export interface ConversationContext {
  sessionId: string;
  previousLocations: string[];
  timestamp: number;
}

/**
 * Main query parse result
 */
export interface QueryParseResult {
  businessType: BusinessType[];
  location: LocationResult;
  filters: FilterParams;
  metadata: {
    originalQuery: string;
    timestamp: number;
    sessionId?: string;
  };
  confidence: ConfidenceScore;
}

/**
 * Ambiguity detection result
 */
export interface AmbiguityDetection {
  field: string;
  detectedValues: string[];
  question: string;
  confidence: ConfidenceScore;
}

/**
 * Validation error
 */
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}
