/**
 * Directions API client for frontend
 */

import { DirectionsResponse, TravelMode, Location } from '../types/directions';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface DirectionsRequestParams {
  origin: Location | string;
  destination: Location | string;
  travelMode: TravelMode;
}

/**
 * Fetch directions from backend API
 */
export async function fetchDirections(
  params: DirectionsRequestParams
): Promise<DirectionsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/directions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch directions');
  }

  return response.json();
}

/**
 * Decode polyline string to array of lat/lng coordinates
 * Based on Google's polyline encoding algorithm
 */
export function decodePolyline(encoded: string): Location[] {
  if (!encoded || encoded.length === 0) {
    return [];
  }

  const points: Location[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    // Decode latitude
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    // Decode longitude
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return points;
}

/**
 * Calculate distance between two locations (Haversine formula)
 * Returns distance in meters
 */
export function calculateDistance(from: Location, to: Location): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}
