/**
 * Place Details Transformation Service
 * Transforms Google Places API Details response to BusinessData interface
 */

import { PlaceDetails, BusinessData } from '../types/place-details.js';
import { AddressComponents } from '../types/business-search.js';

/**
 * Transform PlaceDetails API response to BusinessData interface
 */
export function transformPlaceDetails(
  placeDetails: PlaceDetails
): BusinessData {
  return {
    place_id: placeDetails.place_id,
    name: placeDetails.name,
    location: placeDetails.geometry.location,
    rating: placeDetails.rating,
    reviewCount: placeDetails.user_ratings_total,
    priceLevel: placeDetails.price_level,
    priceDisplay: formatPriceLevel(placeDetails.price_level),
    address: parseAddressComponents(placeDetails),
    formatted_address: placeDetails.formatted_address,
    phone: placeDetails.formatted_phone_number,
    international_phone: placeDetails.international_phone_number,
    website: placeDetails.website,
    googleMapsUrl: placeDetails.url,
    photos: transformPhotos(placeDetails.photos),
    hours: transformOpeningHours(placeDetails.opening_hours),
    reviews: transformReviews(placeDetails.reviews),
    businessStatus: placeDetails.business_status,
    category: extractPrimaryCategory(placeDetails.types),
    types: placeDetails.types,
    lastUpdated: Date.now(),
  };
}

/**
 * Format price level to dollar sign representation
 */
function formatPriceLevel(priceLevel?: number): string | undefined {
  if (priceLevel === undefined || priceLevel === null) {
    return undefined;
  }

  const dollarSigns = '$'.repeat(Math.max(1, Math.min(4, priceLevel)));
  return dollarSigns;
}

/**
 * Parse address components into structured format
 */
function parseAddressComponents(
  placeDetails: PlaceDetails
): AddressComponents {
  if (!placeDetails.address_components) {
    return {};
  }

  const components: AddressComponents = {};

  for (const component of placeDetails.address_components) {
    if (component.types.includes('street_number')) {
      components.street = component.long_name;
    } else if (component.types.includes('route')) {
      components.street = components.street
        ? `${components.street} ${component.long_name}`
        : component.long_name;
    } else if (
      component.types.includes('locality') ||
      component.types.includes('postal_town')
    ) {
      components.city = component.long_name;
    } else if (component.types.includes('administrative_area_level_1')) {
      components.state = component.short_name;
    } else if (component.types.includes('postal_code')) {
      components.postal_code = component.long_name;
    } else if (component.types.includes('country')) {
      components.country = component.long_name;
    }
  }

  return components;
}

/**
 * Transform photo references to frontend format
 */
function transformPhotos(
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
    html_attributions?: string[];
  }>
): BusinessData['photos'] {
  if (!photos || photos.length === 0) {
    return undefined;
  }

  return photos.slice(0, 10).map((photo) => ({
    photoReference: photo.photo_reference,
    width: photo.width,
    height: photo.height,
    attributions: photo.html_attributions || [],
  }));
}

/**
 * Transform opening hours to frontend format
 */
function transformOpeningHours(
  openingHours?: {
    open_now?: boolean;
    periods?: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
    weekday_text?: string[];
  }
): BusinessData['hours'] {
  if (!openingHours) {
    return undefined;
  }

  return {
    isOpenNow: openingHours.open_now,
    weekdayText: openingHours.weekday_text,
    periods: openingHours.periods,
  };
}

/**
 * Transform reviews to frontend format
 */
function transformReviews(
  reviews?: Array<{
    author_name: string;
    author_url?: string;
    rating: number;
    relative_time_description: string;
    text: string;
    profile_photo_url?: string;
    time: number;
  }>
): BusinessData['reviews'] {
  if (!reviews || reviews.length === 0) {
    return undefined;
  }

  return reviews.slice(0, 5).map((review) => ({
    author: review.author_name,
    authorUrl: review.author_url,
    rating: review.rating,
    relativeTime: review.relative_time_description,
    text: review.text,
    profilePhoto: review.profile_photo_url,
    timestamp: review.time * 1000, // Convert to milliseconds
  }));
}

/**
 * Extract primary category from types array
 */
function extractPrimaryCategory(types?: string[]): string | undefined {
  if (!types || types.length === 0) {
    return undefined;
  }

  // Priority order for category selection
  const priorityTypes = [
    'restaurant',
    'cafe',
    'bar',
    'bakery',
    'grocery_or_supermarket',
    'shopping_mall',
    'store',
    'bank',
    'hospital',
    'pharmacy',
    'gas_station',
    'lodging',
    'gym',
    'park',
  ];

  // Find first priority type
  for (const priorityType of priorityTypes) {
    if (types.includes(priorityType)) {
      return formatCategoryName(priorityType);
    }
  }

  // Use first type if no priority match
  return formatCategoryName(types[0]);
}

/**
 * Format category name for display
 */
function formatCategoryName(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
