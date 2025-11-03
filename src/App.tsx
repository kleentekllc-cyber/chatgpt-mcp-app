/**
 * LocalHub Application Entry Point
 * ChatGPT app for local business discovery with Google Maps integration
 */

import React from 'react';
import { MapContainer } from './components/map/MapContainer';
import { DirectionsProvider } from './context/DirectionsContext';

export const App: React.FC = () => {
  return (
    <DirectionsProvider>
      <div className="app-container">
        <MapContainer />
      </div>
    </DirectionsProvider>
  );
};
