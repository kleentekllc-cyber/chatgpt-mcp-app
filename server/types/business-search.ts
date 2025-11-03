/**
 * Type definitions for Business Search API
 */

/**
 * Search request payload from client
 */
export interface SearchRequest {
  businessType: string;
  location: string;
  filters?: FilterParams;
}

/**
 * Filter parameters for search
 */
export interface FilterParams {
  rating?: number;
  price?: number;
  openNow?: boolean;
  distance?: number;
  attributes?: string[];
}

/**
 * Location coordinates
 */
export interface LocationCoordinates {
  lat: number;
  lng: number;
}

/**
 * Business result from Places API
 */
export interface BusinessResult {
  place_id: string;
  name: string;
  location: LocationCoordinates;
  rating?: number;
  user_ratings_total?: number;
  address: AddressComponents;
  formatted_address: string;
  photos?: PhotoReference[];
  business_status: string;
  price_level?: number;
  price_display?: string;
  distance?: number;
  types?: string[];
}

/**
 * Address components
 */
export interface AddressComponents {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

/**
 * Photo reference from Places API
 */
export interface PhotoReference {
  photo_reference: string;
  width: number;
  height: number;
  html_attributions: string[];
}

/**
 * Search response to client
 */
export interface SearchResponse {
  businesses: BusinessResult[];
  totalCount: number;
  queryParams: SearchRequest;
  cacheStatus: 'hit' | 'miss' | 'bypass';
  cachedAt?: number;
  requestId: string;
}

/**
 * Cached search result
 */
export interface CachedResult {
  results: BusinessResult[];
  timestamp: number;
  queryParams: SearchRequest;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: number;
}
