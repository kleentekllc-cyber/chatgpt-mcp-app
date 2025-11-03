/**
 * Integration Tests for App Component
 * End-to-end tests for map display foundation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';
import * as mapsApi from './lib/api/maps';

// Mock the maps API
vi.mock('./lib/api/maps');

// Mock Google Maps components
vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="api-provider">{children}</div>
  ),
  Map: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map" role="application" aria-label="Interactive map">
      {children}
    </div>
  ),
  AdvancedMarker: () => <div data-testid="marker" />,
  useMap: () => null,
  InfoWindow: ({ children }: { children: React.ReactNode }) => <div data-testid="info-window">{children}</div>,
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render complete app with map in fullscreen', async () => {
    // Arrange
    vi.spyOn(mapsApi, 'fetchMapsConfigWithTimeout').mockResolvedValue({
      apiKey: 'test-api-key',
    });

    // Act
    render(<App />);

    // Assert - Map should load in fullscreen
    await waitFor(() => {
      const map = screen.getByRole('application', { name: /interactive map/i });
      expect(map).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should handle API initialization error gracefully', async () => {
    // Arrange
    vi.spyOn(mapsApi, 'fetchMapsConfigWithTimeout').mockRejectedValue(
      new mapsApi.MapsApiError('API key missing')
    );

    // Act
    render(<App />);

    // Assert - Error message should be displayed
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Unable to Load Map')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should show loading state during initialization', () => {
    // Arrange
    vi.spyOn(mapsApi, 'fetchMapsConfigWithTimeout').mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    // Act
    render(<App />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading map...')).toBeInTheDocument();
  });

  it('should render app container', async () => {
    // Arrange
    vi.spyOn(mapsApi, 'fetchMapsConfigWithTimeout').mockResolvedValue({
      apiKey: 'test-api-key',
    });

    // Act
    const { container } = render(<App />);

    // Assert
    const appContainer = container.querySelector('.app-container');
    expect(appContainer).toBeInTheDocument();
  });
});
