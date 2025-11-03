/**
 * Type definitions for Google Places Details API
 */

import { LocationCoordinates, AddressComponents, PhotoReference } from './business-search.js';

/**
 * Request for place details
 */
export interface PlaceDetailsRequest {
  place_id: string;
}

/**
 * Opening hours period
 */
export interface OpeningPeriod {
  open: {
    day: number;
    time: string;
  };
  close?: {
    day: number;
    time: string;
  };
}

/**
 * Opening hours information
 */
export interface OpeningHours {
  open_now?: boolean;
  periods?: OpeningPeriod[];
  weekday_text?: string[];
}

/**
 * Review information
 */
export interface Review {
  author_name: string;
  author_url?: string;
  language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

/**
 * Detailed business data from Places Details API
 */
export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: OpeningHours;
  photos?: PhotoReference[];
  reviews?: Review[];
  business_status?: string;
  types?: string[];
  geometry: {
    location: LocationCoordinates;
  };
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

/**
 * Business data for frontend (transformed from PlaceDetails)
 */
export interface BusinessData {
  place_id: string;
  name: string;
  location: LocationCoordinates;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
  priceDisplay?: string;
  address: AddressComponents;
  formatted_address: string;
  phone?: string;
  international_phone?: string;
  website?: string;
  googleMapsUrl?: string;
  photos?: Array<{
    photoReference: string;
    width: number;
    height: number;
    attributions: string[];
  }>;
  hours?: {
    isOpenNow?: boolean;
    weekdayText?: string[];
    periods?: OpeningPeriod[];
  };
  reviews?: Array<{
    author: string;
    authorUrl?: string;
    rating: number;
    relativeTime: string;
    text: string;
    profilePhoto?: string;
    timestamp: number;
  }>;
  businessStatus?: string;
  category?: string;
  types?: string[];
  distance?: number;
  lastUpdated: number;
}

/**
 * Place details response
 */
export interface PlaceDetailsResponse {
  businessData: BusinessData;
  cacheStatus: 'hit' | 'miss';
  requestId: string;
}

/**
 * Cached place details
 */
export interface CachedPlaceDetails {
  data: BusinessData;
  timestamp: number;
  place_id: string;
}
