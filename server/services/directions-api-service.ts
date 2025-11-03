/**
 * Google Directions API service
 */

import { Client, TravelMode as GoogleTravelMode, DirectionsResponse as GoogleDirectionsResponse } from '@googlemaps/google-maps-services-js';
import { DirectionsRequest, TravelMode, Route, DirectionStep, RouteLeg, ManeuverType, Location } from '../types/directions.js';

// Initialize Google Maps client
const client = new Client({});

// API timeout
const API_TIMEOUT = 5000;

/**
 * Convert our TravelMode to Google's TravelMode
 */
function toGoogleTravelMode(mode: TravelMode): GoogleTravelMode {
  const mapping: Record<TravelMode, GoogleTravelMode> = {
    [TravelMode.DRIVING]: GoogleTravelMode.driving,
    [TravelMode.WALKING]: GoogleTravelMode.walking,
    [TravelMode.TRANSIT]: GoogleTravelMode.transit,
    [TravelMode.BICYCLING]: GoogleTravelMode.bicycling,
  };
  return mapping[mode];
}

/**
 * Convert location to string format for Google API
 */
function locationToString(location: Location | string): string {
  if (typeof location === 'string') {
    return location; // place ID
  }
  return `${location.lat},${location.lng}`;
}

/**
 * Map Google maneuver to our ManeuverType
 */
function mapManeuver(googleManeuver?: string): ManeuverType | undefined {
  if (!googleManeuver) return undefined;

  const maneuverMap: Record<string, ManeuverType> = {
    'turn-left': 'turn-left',
    'turn-right': 'turn-right',
    'turn-slight-left': 'turn-slight-left',
    'turn-slight-right': 'turn-slight-right',
    'turn-sharp-left': 'turn-sharp-left',
    'turn-sharp-right': 'turn-sharp-right',
    'uturn-left': 'uturn-left',
    'uturn-right': 'uturn-right',
    'merge': 'merge',
    'fork-left': 'fork-left',
    'fork-right': 'fork-right',
    'roundabout-left': 'roundabout-left',
    'roundabout-right': 'roundabout-right',
    'straight': 'straight',
    'ramp-left': 'ramp-left',
    'ramp-right': 'ramp-right',
    'keep-left': 'keep-left',
    'keep-right': 'keep-right',
    'ferry': 'ferry',
    'ferry-train': 'ferry-train',
  };

  return maneuverMap[googleManeuver];
}

/**
 * Transform Google Directions API response to our format
 */
function transformDirectionsResponse(googleResponse: GoogleDirectionsResponse): Route[] {
  if (!googleResponse.data.routes || googleResponse.data.routes.length === 0) {
    return [];
  }

  return googleResponse.data.routes.map((route) => {
    const legs: RouteLeg[] = route.legs.map((leg) => {
      const steps: DirectionStep[] = leg.steps.map((step) => ({
        instruction: step.html_instructions || '',
        distance: {
          text: step.distance?.text || '',
          value: step.distance?.value || 0,
        },
        duration: {
          text: step.duration?.text || '',
          value: step.duration?.value || 0,
        },
        maneuver: mapManeuver(step.maneuver),
        startLocation: {
          lat: step.start_location.lat,
          lng: step.start_location.lng,
        },
        endLocation: {
          lat: step.end_location.lat,
          lng: step.end_location.lng,
        },
      }));

      return {
        steps,
        distance: {
          text: leg.distance?.text || '',
          value: leg.distance?.value || 0,
        },
        duration: {
          text: leg.duration?.text || '',
          value: leg.duration?.value || 0,
        },
        durationInTraffic: leg.duration_in_traffic
          ? {
              text: leg.duration_in_traffic.text || '',
              value: leg.duration_in_traffic.value || 0,
            }
          : undefined,
        startAddress: leg.start_address || '',
        endAddress: leg.end_address || '',
        startLocation: {
          lat: leg.start_location.lat,
          lng: leg.start_location.lng,
        },
        endLocation: {
          lat: leg.end_location.lat,
          lng: leg.end_location.lng,
        },
      };
    });

    return {
      legs,
      overviewPolyline: route.overview_polyline?.points || '',
      bounds: {
        northeast: {
          lat: route.bounds.northeast.lat,
          lng: route.bounds.northeast.lng,
        },
        southwest: {
          lat: route.bounds.southwest.lat,
          lng: route.bounds.southwest.lng,
        },
      },
      summary: route.summary || '',
      warnings: route.warnings || [],
      copyrights: route.copyrights || '',
      fare: route.fare
        ? {
            currency: route.fare.currency || '',
            value: route.fare.value || 0,
            text: route.fare.text || '',
          }
        : undefined,
    };
  });
}

/**
 * Call Google Directions API
 */
export async function getDirections(request: DirectionsRequest): Promise<Route[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google API key not configured');
  }

  try {
    const response = await client.directions({
      params: {
        origin: locationToString(request.origin),
        destination: locationToString(request.destination),
        mode: toGoogleTravelMode(request.travelMode),
        alternatives: true, // Request up to 3 alternative routes
        key: apiKey,
      },
      timeout: API_TIMEOUT,
    });

    if (response.data.status === 'ZERO_RESULTS') {
      return [];
    }

    if (response.data.status !== 'OK') {
      throw new Error(`Directions API error: ${response.data.status}`);
    }

    return transformDirectionsResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Directions API timeout. Please try again.');
      }
      throw error;
    }
    throw new Error('Failed to fetch directions');
  }
}

/**
 * Call Google Directions API with retry logic
 */
export async function getDirectionsWithRetry(
  request: DirectionsRequest,
  maxRetries: number = 2
): Promise<Route[]> {
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await getDirections(request);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on validation errors or no results
      if (
        lastError.message.includes('ZERO_RESULTS') ||
        lastError.message.includes('INVALID_REQUEST') ||
        lastError.message.includes('NOT_FOUND')
      ) {
        throw lastError;
      }

      attempt++;

      // Exponential backoff
      if (attempt <= maxRetries) {
        const delay = Math.pow(2, attempt) * 100; // 200ms, 400ms
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed to fetch directions after retries');
}
