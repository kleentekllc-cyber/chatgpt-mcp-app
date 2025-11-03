/**
 * Place Details API Client
 * Frontend service for fetching detailed business information
 */

import { BusinessData } from '../../types/business';

const API_BASE_URL = import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:3001';

export interface PlaceDetailsResponse {
  businessData: BusinessData;
  cacheStatus: 'hit' | 'miss';
  requestId: string;
}

export interface PlaceDetailsError {
  error: string;
  message: string;
  requestId: string;
}

/**
 * Fetch detailed business information by place_id
 */
export async function fetchPlaceDetails(
  placeId: string
): Promise<BusinessData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/places/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ place_id: placeId }),
    });

    if (!response.ok) {
      const errorData: PlaceDetailsError = await response.json();
      throw new Error(errorData.message || 'Failed to fetch place details');
    }

    const data: PlaceDetailsResponse = await response.json();
    return data.businessData;
  } catch (error) {
    console.error('Error fetching place details:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch place details');
  }
}

/**
 * Construct photo URL from photo reference
 */
export function getPhotoUrl(
  photoReference: string,
  maxWidth: number = 800
): string {
  return `${API_BASE_URL}/api/photo/proxy?photoReference=${encodeURIComponent(
    photoReference
  )}&maxWidth=${maxWidth}`;
}
