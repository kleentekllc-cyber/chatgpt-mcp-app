/**
 * MapError Component
 * Displays user-friendly error messages when map fails to load
 */

import React from 'react';
import type { MapErrorProps } from '../../types/google-maps';

export const MapError: React.FC<MapErrorProps> = ({ message, onRetry }) => {
  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-gray-50"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center gap-4 max-w-md px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-chatgpt-text">Unable to Load Map</h2>

        <p className="text-sm text-gray-600">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-6 py-2.5 bg-chatgpt-accent text-white font-medium rounded-lg hover:bg-chatgpt-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-chatgpt-accent focus:ring-offset-2"
            aria-label="Retry loading map"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
