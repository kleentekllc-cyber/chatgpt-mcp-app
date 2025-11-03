/**
 * Directions Context
 * Manages directions state across the application
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  TravelMode,
  Route,
  UserLocation,
  Location,
  DirectionsState,
} from '../types/directions';
import { fetchDirections } from '../lib/directions-api-client';
import { getCurrentLocationWithRetry } from '../lib/geolocation-service';

interface DirectionsContextValue extends DirectionsState {
  startDirections: (destination: Location, businessName?: string) => Promise<void>;
  changeTravelMode: (mode: TravelMode) => Promise<void>;
  selectRoute: (index: number) => void;
  closeDirections: () => void;
  businessName?: string;
}

const DirectionsContext = createContext<DirectionsContextValue | undefined>(undefined);

export function useDirections() {
  const context = useContext(DirectionsContext);
  if (!context) {
    throw new Error('useDirections must be used within DirectionsProvider');
  }
  return context;
}

interface DirectionsProviderProps {
  children: ReactNode;
}

export function DirectionsProvider({ children }: DirectionsProviderProps) {
  const [state, setState] = useState<DirectionsState>({
    userLocation: null,
    destination: null,
    travelMode: TravelMode.DRIVING,
    routes: [],
    selectedRouteIndex: 0,
    loading: false,
    error: null,
    isActive: false,
  });

  const [businessName, setBusinessName] = useState<string | undefined>(undefined);

  /**
   * Fetch directions from API
   */
  const fetchDirectionsData = useCallback(
    async (origin: Location, destination: Location, mode: TravelMode) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetchDirections({
          origin,
          destination,
          travelMode: mode,
        });

        if (response.routes.length === 0) {
          throw new Error('No route available for this mode. Try a different transport option.');
        }

        setState((prev) => ({
          ...prev,
          routes: response.routes,
          selectedRouteIndex: 0,
          loading: false,
          error: null,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get directions';
        setState((prev) => ({
          ...prev,
          routes: [],
          loading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Start directions to a destination
   */
  const startDirections = useCallback(
    async (destination: Location, name?: string) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          destination,
          isActive: true,
        }));

        setBusinessName(name);

        // Get user location
        const userLoc = await getCurrentLocationWithRetry();

        setState((prev) => ({ ...prev, userLocation: userLoc }));

        // Fetch directions
        await fetchDirectionsData(userLoc.coords, destination, state.travelMode);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get directions';

        // Handle geolocation errors
        if (
          errorMessage === 'PERMISSION_DENIED' ||
          errorMessage === 'POSITION_UNAVAILABLE' ||
          errorMessage === 'TIMEOUT' ||
          errorMessage === 'UNSUPPORTED'
        ) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: 'Unable to get your location. Please enable location access or try again.',
          }));
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        }
      }
    },
    [state.travelMode, fetchDirectionsData]
  );

  /**
   * Change travel mode and refetch directions
   */
  const changeTravelMode = useCallback(
    async (mode: TravelMode) => {
      if (!state.userLocation || !state.destination) {
        return;
      }

      setState((prev) => ({ ...prev, travelMode: mode }));

      try {
        await fetchDirectionsData(state.userLocation.coords, state.destination, mode);
      } catch (error) {
        // Error is already handled in fetchDirectionsData
        console.error('Error changing travel mode:', error);
      }
    },
    [state.userLocation, state.destination, fetchDirectionsData]
  );

  /**
   * Select a different route alternative
   */
  const selectRoute = useCallback((index: number) => {
    setState((prev) => {
      if (index >= 0 && index < prev.routes.length) {
        return { ...prev, selectedRouteIndex: index };
      }
      return prev;
    });
  }, []);

  /**
   * Close directions and reset state
   */
  const closeDirections = useCallback(() => {
    setState({
      userLocation: null,
      destination: null,
      travelMode: TravelMode.DRIVING,
      routes: [],
      selectedRouteIndex: 0,
      loading: false,
      error: null,
      isActive: false,
    });
    setBusinessName(undefined);
  }, []);

  const value: DirectionsContextValue = {
    ...state,
    businessName,
    startDirections,
    changeTravelMode,
    selectRoute,
    closeDirections,
  };

  return <DirectionsContext.Provider value={value}>{children}</DirectionsContext.Provider>;
}
