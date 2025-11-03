/**
 * Business and Marker Type Definitions for Frontend
 */

import { MarkerData } from './google-maps';

/**
 * Business result from API (used for search results and markers)
 */
export interface BusinessResult {
  place_id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  user_ratings_total?: number;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  formatted_address: string;
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  business_status: string;
  price_level?: number;
  price_display?: string;
  distance?: number;
  types?: string[];
}

/**
 * Popup data for business info window
 */
export interface PopupData {
  name: string;
  rating?: number;
  ratingDisplay: string;
  reviewCount?: number;
  address: string;
  status: string;
  photo?: string;
  category?: string;
  priceDisplay?: string;
}

/**
 * Marker data with popup information
 */
export interface BusinessMarkerData extends MarkerData {
  popup: PopupData;
  zIndex: number;
}

/**
 * Cluster configuration
 */
export interface ClusterConfig {
  minZoom: number;
  maxZoom: number;
  gridSize: number;
  activateThreshold: number;
  maxBusinesses: number;
}

/**
 * Photo data for photo gallery (using camelCase for frontend)
 */
export interface Photo {
  photoReference: string;
  width: number;
  height: number;
  attributions: string[];
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
 * Operating hours information
 */
export interface Hours {
  isOpenNow?: boolean;
  weekdayText?: string[];
  periods?: OpeningPeriod[];
}

/**
 * Review data
 */
export interface Review {
  author: string;
  authorUrl?: string;
  rating: number;
  relativeTime: string;
  text: string;
  profilePhoto?: string;
  timestamp: number;
}

/**
 * Detailed business data for Business Card (from Places Details API)
 * Note: This interface includes both snake_case (from API) and camelCase (for frontend) fields
 */
export interface BusinessData {
  // Core fields from BusinessResult (maintaining compatibility)
  place_id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  user_ratings_total?: number;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  formatted_address: string;
  business_status: string;
  price_level?: number;
  price_display?: string;
  distance?: number;
  types?: string[];

  // Additional detail fields (camelCase for frontend)
  reviewCount?: number;
  priceLevel?: number;
  priceDisplay?: string;
  phone?: string;
  international_phone?: string;
  website?: string;
  googleMapsUrl?: string;
  photos?: Photo[];  // Using Photo interface for detailed data
  hours?: Hours;
  reviews?: Review[];
  businessStatus?: string;
  category?: string;
  lastUpdated: number;
}

/**
 * Props for BusinessCard component
 */
export interface BusinessCardProps {
  businessData: BusinessData | null;
  isOpen: boolean;
  onClose: () => void;
  onDirections?: (placeId: string) => void;
  onCall?: (phone: string) => void;
  onWebsite?: (url: string) => void;
  onShare?: (placeId: string) => void;
  loading?: boolean;
  error?: string | null;
}
