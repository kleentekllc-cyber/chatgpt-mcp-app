/**
 * RoutePolyline Component
 * Renders a route on the Google Map
 */

import React, { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { Location } from '../../types/directions';

export interface RoutePolylineProps {
  path: Location[];
  color?: string;
  strokeWeight?: number;
  zIndex?: number;
  onClick?: () => void;
  opacity?: number;
}

export const RoutePolyline: React.FC<RoutePolylineProps> = ({
  path,
  color = '#4285F4', // Blue for selected route
  strokeWeight = 5,
  zIndex = 100,
  onClick,
  opacity = 1.0,
}) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !path || path.length === 0) {
      return;
    }

    // Create polyline
    const polyline = new google.maps.Polyline({
      path: path.map((p) => ({ lat: p.lat, lng: p.lng })),
      geodesic: true,
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight: strokeWeight,
      zIndex: zIndex,
      clickable: !!onClick,
    });

    // Add click listener if provided
    if (onClick) {
      polyline.addListener('click', onClick);
    }

    // Set polyline on map
    polyline.setMap(map);
    polylineRef.current = polyline;

    // Cleanup function
    return () => {
      if (polylineRef.current) {
        google.maps.event.clearInstanceListeners(polylineRef.current);
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, path, color, strokeWeight, zIndex, onClick, opacity]);

  return null; // This component doesn't render any React elements
};
