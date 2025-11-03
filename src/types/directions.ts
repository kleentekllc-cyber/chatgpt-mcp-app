/**
 * Frontend types for Directions feature
 */

/**
 * Travel mode enum
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
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  maneuver?: ManeuverType;
  startLocation: Location;
  endLocation: Location;
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
 * Geolocation state
 */
export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Geolocation error type
 */
export type GeolocationErrorType =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNSUPPORTED';

/**
 * User location data
 */
export interface UserLocation {
  coords: Location;
  timestamp: number;
  accuracy?: number;
}

/**
 * Directions context state
 */
export interface DirectionsState {
  userLocation: UserLocation | null;
  destination: Location | null;
  travelMode: TravelMode;
  routes: Route[];
  selectedRouteIndex: number;
  loading: boolean;
  error: string | null;
  isActive: boolean;
}
