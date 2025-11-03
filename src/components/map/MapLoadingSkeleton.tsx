/**
 * MapLoadingSkeleton Component
 * Displays loading state while Google Maps API initializes
 */

import React from 'react';

export const MapLoadingSkeleton: React.FC = () => {
  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-gray-50"
      role="status"
      aria-label="Loading map"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-chatgpt-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-chatgpt-text text-sm font-medium">Loading map...</p>
      </div>
    </div>
  );
};
