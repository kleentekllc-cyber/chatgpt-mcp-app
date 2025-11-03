/**
 * Marker Generator
 * Transforms business results into marker data for map display
 */

import { BusinessResult, PopupData, BusinessMarkerData } from '../types/business';

/**
 * Create marker data from business result
 */
export function createMarkerData(business: BusinessResult): BusinessMarkerData {
  const marker: BusinessMarkerData = {
    id: business.place_id,
    position: business.location,
    label: truncateLabel(business.name, 20),
    icon: getMarkerIcon(business.types?.[0]),
    popup: createPopupData(business),
    zIndex: calculateZIndex(business.rating),
  };

  return marker;
}

/**
 * Create marker data for multiple businesses
 */
export function createMarkers(businesses: BusinessResult[]): BusinessMarkerData[] {
  return businesses.map(createMarkerData);
}

/**
 * Create popup data from business result
 */
export function createPopupData(business: BusinessResult): PopupData {
  return {
    name: business.name,
    rating: business.rating,
    ratingDisplay: formatRating(business.rating, business.user_ratings_total),
    reviewCount: business.user_ratings_total,
    address: formatAddress(business),
    status: formatBusinessStatus(business.business_status),
    photo: business.photos?.[0]?.photo_reference,
    category: formatCategory(business.types?.[0]),
    priceDisplay: business.price_display,
  };
}

/**
 * Calculate z-index based on rating
 * Higher rated businesses appear on top
 */
function calculateZIndex(rating?: number): number {
  if (!rating) return 0;
  return Math.floor(rating * 10);
}

/**
 * Truncate label to specified length
 */
function truncateLabel(label: string, maxLength: number): string {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 3) + '...';
}

/**
 * Get marker icon based on business type
 * Returns icon identifier for future custom icon support
 */
function getMarkerIcon(type?: string): string {
  const iconMap: Record<string, string> = {
    restaurant: 'restaurant',
    cafe: 'cafe',
    bar: 'bar',
    lodging: 'hotel',
    store: 'store',
    shopping_mall: 'shopping',
    bank: 'bank',
    hospital: 'hospital',
    pharmacy: 'pharmacy',
    gas_station: 'gas',
    parking: 'parking',
  };

  return iconMap[type || ''] || 'default';
}

/**
 * Format rating with star display
 */
export function formatRating(rating?: number, reviewCount?: number): string {
  if (!rating) return 'No rating';

  const stars = renderStars(rating);
  const reviews = reviewCount ? ` (${reviewCount})` : '';

  return `${stars} ${rating.toFixed(1)}${reviews}`;
}

/**
 * Render star symbols for rating
 */
export function renderStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let stars = '';

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }

  // Half star
  if (hasHalfStar) {
    stars += '⯨';
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += '☆';
  }

  return stars;
}

/**
 * Format address for display
 */
function formatAddress(business: BusinessResult): string {
  // Prefer structured address
  if (business.address.street || business.address.city) {
    const parts: string[] = [];

    if (business.address.street) {
      parts.push(business.address.street);
    }

    if (business.address.city && business.address.state) {
      parts.push(`${business.address.city}, ${business.address.state}`);
    } else if (business.address.city) {
      parts.push(business.address.city);
    }

    return parts.join(', ');
  }

  // Fallback to formatted address
  return business.formatted_address || 'Address not available';
}

/**
 * Format business status
 */
function formatBusinessStatus(status: string): string {
  switch (status) {
    case 'OPERATIONAL':
      return 'Open';
    case 'CLOSED_TEMPORARILY':
      return 'Temporarily Closed';
    case 'CLOSED_PERMANENTLY':
      return 'Permanently Closed';
    default:
      return 'Status Unknown';
  }
}

/**
 * Format business category
 */
function formatCategory(type?: string): string {
  if (!type) return '';

  // Convert snake_case to Title Case
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate photo URL for thumbnail display
 */
export function getThumbnailUrl(photoReference: string): string {
  // This will be called from the component with the API key
  return `/api/photo?reference=${photoReference}&maxwidth=200&maxheight=150`;
}

/**
 * Generate photo URL for full-size display
 */
export function getPhotoUrl(photoReference: string): string {
  return `/api/photo?reference=${photoReference}&maxwidth=400&maxheight=300`;
}
