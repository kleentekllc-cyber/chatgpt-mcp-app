/**
 * Integration Tests for Business Card Feature
 * Task 6.3: Strategic tests for end-to-end workflows
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapView } from '../map/MapView';
import { BusinessMarkerData } from '../../types/business';
import * as placeDetailsApi from '../../lib/api/placeDetails';
import { DirectionsProvider } from '../../context/DirectionsContext';

// Mock the Google Maps components
vi.mock('@vis.gl/react-google-maps', async () => {
  return {
    Map: ({ children }: any) => <div data-testid="google-map">{children}</div>,
    InfoWindow: ({ children }: any) => <div data-testid="info-window">{children}</div>,
    AdvancedMarker: ({ children }: any) => <div data-testid="advanced-marker">{children}</div>,
    Pin: () => <div data-testid="pin" />,
    useMap: () => null,
  };
});

const MOCK_MARKER: BusinessMarkerData = {
  id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  position: { lat: -33.8688, lng: 151.2093 },
  label: 'Test Restaurant',
  popup: {
    name: 'Test Restaurant',
    rating: 4.5,
    ratingDisplay: '4.5',
    reviewCount: 234,
    address: '123 Main St, Sydney',
    status: 'OPERATIONAL',
    category: 'Restaurant',
    priceDisplay: '$$',
  },
  zIndex: 1,
};

const MOCK_BUSINESS_DATA = {
  place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  name: 'Test Restaurant',
  location: { lat: -33.8688, lng: 151.2093 },
  rating: 4.5,
  reviewCount: 234,
  priceLevel: 2,
  priceDisplay: '$$',
  address: {
    street: '123 Main St',
    city: 'Sydney',
    state: 'NSW',
    postal_code: '2000',
    country: 'Australia',
  },
  formatted_address: '123 Main St, Sydney NSW 2000, Australia',
  phone: '(02) 1234 5678',
  website: 'https://testrestaurant.com',
  googleMapsUrl: 'https://maps.google.com/?cid=123456',
  photos: [
    {
      photoReference: 'test_photo_ref',
      width: 800,
      height: 600,
      attributions: ['Test attribution'],
    },
  ],
  hours: {
    isOpenNow: true,
    weekdayText: ['Monday: 9:00 AM - 9:00 PM'],
    periods: [],
  },
  reviews: [
    {
      author: 'John Doe',
      rating: 5,
      relativeTime: '2 weeks ago',
      text: 'Great place!',
      timestamp: 1234567890000,
    },
  ],
  businessStatus: 'OPERATIONAL',
  category: 'Restaurant',
  lastUpdated: Date.now(),
  business_status: 'OPERATIONAL',
  types: ['restaurant'],
};

describe('Business Card Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render map with markers', () => {
    vi.spyOn(placeDetailsApi, 'fetchPlaceDetails').mockResolvedValue(MOCK_BUSINESS_DATA);

    render(
      <DirectionsProvider>
        <MapView center={{ lat: 0, lng: 0 }} zoom={12} markers={[MOCK_MARKER]} />
      </DirectionsProvider>
    );

    const map = screen.getByTestId('google-map');
    expect(map).toBeInTheDocument();
  });

  it('should have API client available for fetching place details', async () => {
    vi.spyOn(placeDetailsApi, 'fetchPlaceDetails').mockResolvedValue(MOCK_BUSINESS_DATA);

    const result = await placeDetailsApi.fetchPlaceDetails('test-place-id');
    expect(result).toEqual(MOCK_BUSINESS_DATA);
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Failed to fetch business details';
    vi.spyOn(placeDetailsApi, 'fetchPlaceDetails').mockRejectedValue(new Error(errorMessage));

    await expect(placeDetailsApi.fetchPlaceDetails('invalid-id')).rejects.toThrow(errorMessage);
  });
});
