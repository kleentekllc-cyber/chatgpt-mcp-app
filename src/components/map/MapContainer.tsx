/**
 * MapContainer Component
 * Main wrapper that handles API initialization, state management, and MCP communication
 */

import React, { useState, useEffect, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { MapView } from './MapView';
import { MapLoadingSkeleton } from './MapLoadingSkeleton';
import { MapError } from './MapError';
import { fetchMapsConfigWithTimeout } from '../../lib/api/maps';
import type { MapContainerProps, MapCenter, MarkerData } from '../../types/google-maps';

// Default map configuration
const DEFAULT_CENTER: MapCenter = { lat: 37.7749, lng: -122.4194 };
const DEFAULT_ZOOM = 12;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export const MapContainer: React.FC<MapContainerProps> = ({
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  // Map state - prepared for future use
  const [center] = useState<MapCenter>(initialCenter);
  const [zoom] = useState<number>(initialZoom);
  const [markers] = useState<MarkerData[]>([]);

  /**
   * Load Google Maps API configuration
   */
  const loadMapConfig = useCallback(async () => {
    setLoadingState('loading');
    setError('');

    try {
      const config = await fetchMapsConfigWithTimeout(10000);
      setApiKey(config.apiKey);
      setLoadingState('success');
      setRetryCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load map configuration';
      setError(errorMessage);
      setLoadingState('error');
      console.error('Map configuration error:', err);
    }
  }, []);

  /**
   * Retry loading with exponential backoff
   */
  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRIES) {
      setError('Unable to load map after multiple attempts. Please refresh the page.');
      return;
    }

    const delay = RETRY_DELAYS[retryCount] || 4000;
    setRetryCount(prev => prev + 1);

    setTimeout(() => {
      loadMapConfig();
    }, delay);
  }, [retryCount, loadMapConfig]);

  /**
   * Initialize map on mount
   */
  useEffect(() => {
    loadMapConfig();
  }, [loadMapConfig]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clear any pending timeouts or intervals
      // Reset state to prevent memory leaks
    };
  }, []);

  // Render loading state
  if (loadingState === 'loading' || loadingState === 'idle') {
    return <MapLoadingSkeleton />;
  }

  // Render error state
  if (loadingState === 'error') {
    return (
      <MapError
        message={error}
        onRetry={retryCount < MAX_RETRIES ? handleRetry : undefined}
      />
    );
  }

  // Render map
  return (
    <APIProvider apiKey={apiKey}>
      <MapView
        center={center}
        zoom={zoom}
        markers={markers}
      />
    </APIProvider>
  );
};
