/**
 * Marker Component
 * Renders individual map markers for business locations
 */

import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import type { MarkerPosition } from '../../types/google-maps';

export interface MarkerProps {
  position: MarkerPosition;
  label?: string;
  icon?: string;
  // Click handler to be implemented in spec 002
  onClick?: () => void;
}

export const Marker: React.FC<MarkerProps> = ({
  position,
  label,
  icon,
  onClick,
}) => {
  return (
    <AdvancedMarker
      position={position}
      title={label}
      onClick={onClick}
    >
      {icon ? (
        <img
          src={icon}
          alt={label || 'Location marker'}
          className="w-8 h-8"
        />
      ) : (
        <div
          className="w-6 h-6 bg-chatgpt-accent rounded-full border-2 border-white shadow-lg"
          aria-label={label || 'Location marker'}
        />
      )}
    </AdvancedMarker>
  );
};
