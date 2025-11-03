/**
 * Google Maps Type Definitions
 * Extended types for Google Maps API objects used in the application
 */

export interface MapConfig {
  apiKey: string;
}

export interface MapCenter {
  lat: number;
  lng: number;
}

export interface MarkerPosition {
  lat: number;
  lng: number;
}

export interface MarkerData {
  id: string;
  position: MarkerPosition;
  label?: string;
  icon?: string;
}

export interface MapState {
  center: MapCenter;
  zoom: number;
  markers: MarkerData[];
}

export interface MapViewProps {
  center: MapCenter;
  zoom: number;
  markers: MarkerData[];
  onMapLoad?: (map: google.maps.Map) => void;
}

export interface MapContainerProps {
  initialCenter?: MapCenter;
  initialZoom?: number;
}

export interface MapErrorProps {
  message: string;
  onRetry?: () => void;
}
