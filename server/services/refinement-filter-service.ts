/**
 * Refinement Filter Service
 * Applies filters to business results based on refinement queries
 */

import { BusinessResult, LocationCoordinates } from '../types/business-search.js';
import { FilterState, RefinementQueryResult, FilterType } from '../types/conversation.js';

/**
 * Apply filters to business results
 */
export function applyFilters(
  businesses: BusinessResult[],
  filters: FilterState,
  searchCenter: LocationCoordinates
): BusinessResult[] {
  let results = [...businesses];

  // Apply rating filter
  if (filters.rating !== undefined) {
    results = applyRatingFilter(results, filters.rating);
  }

  // Apply price filter
  if (filters.priceLevel !== undefined) {
    results = applyPriceFilter(results, filters.priceLevel);
  }

  // Apply openNow filter
  if (filters.openNow !== undefined) {
    results = applyOpenNowFilter(results);
  }

  // Apply distance filter
  if (filters.distance !== undefined) {
    results = applyDistanceFilter(results, filters.distance, searchCenter);
  }

  // Apply attribute filters
  if (filters.attributes && filters.attributes.length > 0) {
    results = applyAttributeFilter(results, filters.attributes);
  }

  console.log(
    `[Filter] Applied filters, ${businesses.length} -> ${results.length} businesses`
  );

  return results;
}

/**
 * Apply rating filter
 */
export function applyRatingFilter(
  businesses: BusinessResult[],
  minRating: number
): BusinessResult[] {
  return businesses.filter(
    (business) => business.rating !== undefined && business.rating >= minRating
  );
}

/**
 * Apply price level filter
 */
export function applyPriceFilter(
  businesses: BusinessResult[],
  maxPriceLevel: number
): BusinessResult[] {
  return businesses.filter(
    (business) =>
      business.price_level !== undefined &&
      business.price_level <= maxPriceLevel
  );
}

/**
 * Apply open now filter
 */
export function applyOpenNowFilter(businesses: BusinessResult[]): BusinessResult[] {
  // Note: In a production system, this would check business.currentOpeningHours.openNow
  // For now, we return all businesses as the Places API data structure doesn't include this field
  return businesses;
}

/**
 * Apply distance filter
 */
export function applyDistanceFilter(
  businesses: BusinessResult[],
  maxDistance: number,
  searchCenter: LocationCoordinates
): BusinessResult[] {
  return businesses.filter((business) => {
    if (business.distance === undefined) {
      // Recalculate distance if not present
      const distance = calculateDistance(searchCenter, business.location);
      return distance <= maxDistance;
    }
    return business.distance <= maxDistance;
  });
}

/**
 * Apply attribute filter
 */
export function applyAttributeFilter(
  businesses: BusinessResult[],
  attributes: string[]
): BusinessResult[] {
  // Note: In a production system, this would check business.attributes array
  // For now, we return all businesses as the Places API data doesn't include detailed attributes
  return businesses;
}

/**
 * Convert refinement queries to filter state
 */
export function refinementsToFilterState(
  refinements: RefinementQueryResult[]
): FilterState {
  const filters: FilterState = {};

  for (const refinement of refinements) {
    switch (refinement.filterType) {
      case FilterType.RATING:
        filters.rating = (refinement as any).threshold;
        break;
      case FilterType.PRICE:
        filters.priceLevel = (refinement as any).maxLevel;
        break;
      case FilterType.OPEN_NOW:
        filters.openNow = (refinement as any).openNow;
        break;
      case FilterType.DISTANCE:
        filters.distance = (refinement as any).maxDistance;
        break;
      case FilterType.ATTRIBUTE:
        filters.attributes = (refinement as any).attributes;
        break;
    }
  }

  return filters;
}

/**
 * Merge new filters with existing filters
 */
export function mergeFilters(
  existing: FilterState,
  newFilters: FilterState
): FilterState {
  return {
    ...existing,
    ...newFilters,
  };
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

  return Math.round(distance * 10) / 10;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
