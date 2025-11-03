/**
 * Data Transformation Service
 * Normalizes and transforms Places API responses into BusinessResult objects
 */

import { PlaceData } from '@googlemaps/google-maps-services-js';
import {
  BusinessResult,
  AddressComponents,
  PhotoReference,
  LocationCoordinates,
} from '../types/business-search.js';

/**
 * Transform Places API result to BusinessResult
 */
export function transformBusinessResult(
  placeData: PlaceData,
  searchCenter: LocationCoordinates
): BusinessResult {
  const business: BusinessResult = {
    place_id: placeData.place_id || '',
    name: placeData.name || 'Unknown Business',
    location: {
      lat: placeData.geometry?.location?.lat || 0,
      lng: placeData.geometry?.location?.lng || 0,
    },
    rating: placeData.rating ? roundToOneDecimal(placeData.rating) : undefined,
    user_ratings_total: placeData.user_ratings_total,
    address: normalizeAddress(placeData),
    formatted_address: placeData.formatted_address || '',
    photos: placeData.photos
      ? placeData.photos.slice(0, 5).map(transformPhoto)
      : [],
    business_status: placeData.business_status || 'OPERATIONAL',
    price_level: placeData.price_level,
    price_display: convertPriceLevel(placeData.price_level),
    types: placeData.types,
  };

  // Calculate distance from search center
  if (business.location.lat && business.location.lng) {
    business.distance = calculateDistance(
      searchCenter,
      business.location
    );
  }

  return business;
}

/**
 * Transform multiple place results
 */
export function transformBusinessResults(
  placeResults: PlaceData[],
  searchCenter: LocationCoordinates
): BusinessResult[] {
  return placeResults
    .map((place) => {
      try {
        return transformBusinessResult(place, searchCenter);
      } catch (error) {
        console.error('Error transforming place result:', error);
        return null;
      }
    })
    .filter((result): result is BusinessResult => result !== null);
}

/**
 * Normalize address components from Places API response
 */
function normalizeAddress(placeData: PlaceData): AddressComponents {
  const components: AddressComponents = {};

  if (placeData.address_components) {
    for (const component of placeData.address_components) {
      if (component.types.includes('street_number')) {
        components.street = component.long_name;
      } else if (component.types.includes('route')) {
        components.street = components.street
          ? `${components.street} ${component.long_name}`
          : component.long_name;
      } else if (
        component.types.includes('locality') ||
        component.types.includes('sublocality')
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
  }

  return components;
}

/**
 * Convert price level from numeric to dollar sign representation
 */
function convertPriceLevel(priceLevel?: number): string {
  if (priceLevel === undefined || priceLevel === null) {
    return 'Price not available';
  }

  switch (priceLevel) {
    case 0:
      return 'Free';
    case 1:
      return '$';
    case 2:
      return '$$';
    case 3:
      return '$$$';
    case 4:
      return '$$$$';
    default:
      return 'Price not available';
  }
}

/**
 * Transform photo reference to PhotoReference object
 */
function transformPhoto(photo: any): PhotoReference {
  return {
    photo_reference: photo.photo_reference,
    width: photo.width,
    height: photo.height,
    html_attributions: photo.html_attributions || [],
  };
}

/**
 * Generate photo URL for display
 */
export function getPhotoUrl(
  photoReference: string,
  maxWidth: number = 400,
  maxHeight: number = 300
): string {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&maxheight=${maxHeight}&photo_reference=${photoReference}&key=${apiKey}`;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(
  from: LocationCoordinates,
  to: LocationCoordinates
): number {
  const R = 6371000; // Earth's radius in meters
  const lat1Rad = toRadians(from.lat);
  const lat2Rad = toRadians(to.lat);
  const deltaLatRad = toRadians(to.lat - from.lat);
  const deltaLngRad = toRadians(to.lng - from.lng);

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLngRad / 2) *
      Math.sin(deltaLngRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return roundToOneDecimal(distance);
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert meters to miles
 */
export function metersToMiles(meters: number): number {
  return roundToOneDecimal(meters / 1609.34);
}

/**
 * Round number to one decimal place
 */
function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Filter results by rating if specified
 */
export function filterByRating(
  results: BusinessResult[],
  minRating: number
): BusinessResult[] {
  return results.filter(
    (result) => result.rating !== undefined && result.rating >= minRating
  );
}

/**
 * Sort results by distance
 */
export function sortByDistance(results: BusinessResult[]): BusinessResult[] {
  return results.sort((a, b) => {
    if (a.distance === undefined) return 1;
    if (b.distance === undefined) return -1;
    return a.distance - b.distance;
  });
}

/**
 * Sort results by rating
 */
export function sortByRating(results: BusinessResult[]): BusinessResult[] {
  return results.sort((a, b) => {
    if (a.rating === undefined) return 1;
    if (b.rating === undefined) return -1;
    return b.rating - a.rating;
  });
}
