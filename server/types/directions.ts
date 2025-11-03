/**
 * Type definitions for Directions API
 */

/**
 * Travel mode enum matching Google Directions API
 */
export enum TravelMode {
  DRIVING = 'DRIVING',
  WALKING = 'WALKING',
  TRANSIT = 'TRANSIT',
  BICYCLING = 'BICYCLING',
}

/**
 * Location coordinates
 */
export interface Location {
  lat: number;
  lng: number;
}

/**
 * Directions API request
 */
export interface DirectionsRequest {
  origin: Location | string;
  destination: Location | string;
  travelMode: TravelMode;
}

/**
 * Direction step maneuver type
 */
export type ManeuverType =
  | 'turn-left'
  | 'turn-right'
  | 'turn-slight-left'
  | 'turn-slight-right'
  | 'turn-sharp-left'
  | 'turn-sharp-right'
  | 'uturn-left'
  | 'uturn-right'
  | 'merge'
  | 'fork-left'
  | 'fork-right'
  | 'roundabout-left'
  | 'roundabout-right'
  | 'straight'
  | 'ramp-left'
  | 'ramp-right'
  | 'keep-left'
  | 'keep-right'
  | 'ferry'
  | 'ferry-train';

/**
 * Direction step
 */
export interface DirectionStep {
  instruction: string;
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
  maneuver?: ManeuverType;
  startLocation: Location;
  endLocation: Location;
}

/**
 * Transit information (for transit mode)
 */
export interface TransitInfo {
  line?: {
    name: string;
    shortName?: string;
    color?: string;
    vehicle: {
      type: string;
      name: string;
    };
  };
  departureStop?: {
    name: string;
    location: Location;
  };
  arrivalStop?: {
    name: string;
    location: Location;
  };
  departureTime?: string;
  arrivalTime?: string;
  numStops?: number;
}

/**
 * Route leg
 */
export interface RouteLeg {
  steps: DirectionStep[];
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  durationInTraffic?: {
    text: string;
    value: number;
  };
  startAddress: string;
  endAddress: string;
  startLocation: Location;
  endLocation: Location;
}

/**
 * Route information
 */
export interface Route {
  legs: RouteLeg[];
  overviewPolyline: string;
  bounds: {
    northeast: Location;
    southwest: Location;
  };
  summary: string;
  warnings: string[];
  copyrights: string;
  fare?: {
    currency: string;
    value: number;
    text: string;
  };
}

/**
 * Directions API response
 */
export interface DirectionsResponse {
  routes: Route[];
  status: string;
  requestId: string;
  cacheStatus: 'hit' | 'miss' | 'bypass';
  timestamp: number;
}

/**
 * Cache key for directions
 */
export interface DirectionsCacheKey {
  origin: string;
  destination: string;
  travelMode: TravelMode;
}

/**
 * Cached direction data
 */
export interface CachedDirections {
  routes: Route[];
  timestamp: number;
  expiresAt: number;
}
