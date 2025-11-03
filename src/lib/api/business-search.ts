/**
 * Business Search API Client
 * Frontend API client for calling business search endpoints
 */

import { BusinessResult } from '../../types/business';

/**
 * Search request parameters
 */
export interface SearchParams {
  businessType: string;
  location: string;
  filters?: {
    rating?: number;
    price?: number;
    openNow?: boolean;
    distance?: number;
    attributes?: string[];
  };
}

/**
 * Search response from API
 */
export interface SearchApiResponse {
  businesses: BusinessResult[];
  totalCount: number;
  queryParams: SearchParams;
  cacheStatus: 'hit' | 'miss' | 'bypass';
  cachedAt?: number;
  requestId: string;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  message?: string;
  details?: string[];
  requestId?: string;
}

/**
 * Search for businesses
 */
export async function searchBusinesses(
  params: SearchParams
): Promise<SearchApiResponse> {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  try {
    const response = await fetch(`${API_URL}/api/search/businesses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ApiError;
      throw new Error(errorData.message || errorData.error || 'Search failed');
    }

    const data = (await response.json()) as SearchApiResponse;
    return data;
  } catch (error) {
    console.error('Business search error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to search for businesses. Please try again.');
  }
}

/**
 * Get photo URL from photo reference
 */
export function getPhotoUrl(
  photoReference: string,
  maxWidth: number = 400,
  maxHeight: number = 300
): string {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return `${API_URL}/api/photo?reference=${photoReference}&maxwidth=${maxWidth}&maxheight=${maxHeight}`;
}
