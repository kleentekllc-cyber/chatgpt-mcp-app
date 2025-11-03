/**
 * Tests for MapContainer Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MapContainer } from './MapContainer';
import * as mapsApi from '../../lib/api/maps';
import { DirectionsProvider } from '../../context/DirectionsContext';

// Mock the maps API
vi.mock('../../lib/api/maps');

// Mock the APIProvider and Map components
vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="api-provider">{children}</div>,
  Map: ({ children }: { children: React.ReactNode }) => <div data-testid="map">{children}</div>,
  AdvancedMarker: () => <div data-testid="marker" />,
  useMap: () => null,
  InfoWindow: ({ children }: { children: React.ReactNode }) => <div data-testid="info-window">{children}</div>,
}));

describe('MapContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    // Arrange
    vi.spyOn(mapsApi, 'fetchMapsConfigWithTimeout').mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    // Act
    render(
      <DirectionsProvider>
        <MapContainer />
      </DirectionsProvider>
    );

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading map...')).toBeInTheDocument();
  });

  it('should render map on successful API load', async () => {
    // Arrange
    vi.spyOn(mapsApi, 'fetchMapsConfigWithTimeout').mockResolvedValue({
      apiKey: 'test-api-key',
    });

    // Act
    render(
      <DirectionsProvider>
        <MapContainer />
      </DirectionsProvider>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('api-provider')).toBeInTheDocument();
      expect(screen.getByTestId('map')).toBeInTheDocument();
    });
  });

  it('should render error state on API load failure', async () => {
    // Arrange
    const errorMessage = 'Failed to load API key';
    vi.spyOn(mapsApi, 'fetchMapsConfigWithTimeout').mockRejectedValue(
      new mapsApi.MapsApiError(errorMessage)
    );

    // Act
    render(
      <DirectionsProvider>
        <MapContainer />
      </DirectionsProvider>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Unable to Load Map')).toBeInTheDocument();
    });
  });

  it('should handle retry on error', async () => {
    // Arrange
    const fetchSpy = vi.spyOn(mapsApi, 'fetchMapsConfigWithTimeout');
    fetchSpy.mockRejectedValueOnce(new mapsApi.MapsApiError('Network error'));
    fetchSpy.mockResolvedValueOnce({ apiKey: 'test-key' });

    // Act
    render(
      <DirectionsProvider>
        <MapContainer />
      </DirectionsProvider>
    );

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    retryButton.click();

    // Assert - map should load after retry
    await waitFor(() => {
      expect(screen.getByTestId('map')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should cleanup on unmount', async () => {
    // Arrange
    vi.spyOn(mapsApi, 'fetchMapsConfigWithTimeout').mockResolvedValue({
      apiKey: 'test-api-key',
    });

    // Act
    const { unmount } = render(
      <DirectionsProvider>
        <MapContainer />
      </DirectionsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('map')).toBeInTheDocument();
    });

    // Unmount and verify cleanup
    unmount();

    // Assert - component should unmount without errors
    expect(screen.queryByTestId('map')).not.toBeInTheDocument();
  });
});
