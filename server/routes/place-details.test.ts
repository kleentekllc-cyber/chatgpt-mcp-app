/**
 * Tests for Place Details API endpoint
 * Task 1.1: Focused tests for Places Details API endpoint
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../mcp-server.js';
import * as placeDetailsService from '../services/place-details-service.js';
import * as placeDetailsCache from '../services/place-details-cache-service.js';

// Mock the services
vi.mock('../services/place-details-service.js');
vi.mock('../services/place-details-cache-service.js');

const MOCK_PLACE_ID = 'ChIJN1t_tDeuEmsRUsoyG83frY4';

const MOCK_PLACE_DETAILS = {
  place_id: MOCK_PLACE_ID,
  name: 'Test Restaurant',
  formatted_address: '123 Main St, Sydney NSW 2000, Australia',
  formatted_phone_number: '(02) 1234 5678',
  international_phone_number: '+61 2 1234 5678',
  website: 'https://testrestaurant.com',
  url: 'https://maps.google.com/?cid=123456',
  rating: 4.5,
  user_ratings_total: 234,
  price_level: 2,
  opening_hours: {
    open_now: true,
    weekday_text: ['Monday: 9:00 AM - 9:00 PM'],
    periods: [],
  },
  photos: [
    {
      photo_reference: 'test_photo_ref',
      width: 800,
      height: 600,
      html_attributions: ['Test attribution'],
    },
  ],
  reviews: [
    {
      author_name: 'John Doe',
      rating: 5,
      relative_time_description: '2 weeks ago',
      text: 'Great place!',
      time: 1234567890,
    },
  ],
  business_status: 'OPERATIONAL',
  types: ['restaurant'],
  geometry: {
    location: { lat: -33.8688, lng: 151.2093 },
  },
  address_components: [],
};

const MOCK_BUSINESS_DATA = {
  place_id: MOCK_PLACE_ID,
  name: 'Test Restaurant',
  location: { lat: -33.8688, lng: 151.2093 },
  rating: 4.5,
  reviewCount: 234,
  priceLevel: 2,
  priceDisplay: '$$',
  address: {},
  formatted_address: '123 Main St, Sydney NSW 2000, Australia',
  phone: '(02) 1234 5678',
  international_phone: '+61 2 1234 5678',
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
  types: ['restaurant'],
  lastUpdated: Date.now(),
};

describe('Place Details API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully retrieve place details with valid place_id', async () => {
    // Mock cache miss
    vi.mocked(placeDetailsCache.getCachedPlaceDetails).mockReturnValue(null);

    // Mock successful API call
    vi.mocked(placeDetailsService.fetchPlaceDetailsWithRetry).mockResolvedValue(
      MOCK_PLACE_DETAILS as any
    );

    const response = await request(app)
      .post('/api/places/details')
      .send({ place_id: MOCK_PLACE_ID });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('businessData');
    expect(response.body).toHaveProperty('cacheStatus', 'miss');
    expect(response.body).toHaveProperty('requestId');
    expect(response.body.businessData.place_id).toBe(MOCK_PLACE_ID);
  });

  it('should return error for invalid place_id', async () => {
    const response = await request(app)
      .post('/api/places/details')
      .send({ place_id: '' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid request');
  });

  it('should handle API timeout with 3-second limit', async () => {
    // Mock cache miss
    vi.mocked(placeDetailsCache.getCachedPlaceDetails).mockReturnValue(null);

    // Mock timeout error
    vi.mocked(placeDetailsService.fetchPlaceDetailsWithRetry).mockRejectedValue(
      new Error('Request timed out. Please try again.')
    );

    const response = await request(app)
      .post('/api/places/details')
      .send({ place_id: MOCK_PLACE_ID });

    expect(response.status).toBe(504);
    expect(response.body).toHaveProperty('error', 'Request timeout');
  });

  it('should return cached data when available', async () => {
    // Mock cache hit
    vi.mocked(placeDetailsCache.getCachedPlaceDetails).mockReturnValue(
      MOCK_BUSINESS_DATA
    );

    const response = await request(app)
      .post('/api/places/details')
      .send({ place_id: MOCK_PLACE_ID });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('cacheStatus', 'hit');
    expect(response.body.businessData).toEqual(MOCK_BUSINESS_DATA);

    // Verify API was not called when cache hit
    expect(placeDetailsService.fetchPlaceDetailsWithRetry).not.toHaveBeenCalled();
  });

  it('should transform API response to BusinessData interface format', async () => {
    // Mock cache miss
    vi.mocked(placeDetailsCache.getCachedPlaceDetails).mockReturnValue(null);

    // Mock successful API call
    vi.mocked(placeDetailsService.fetchPlaceDetailsWithRetry).mockResolvedValue(
      MOCK_PLACE_DETAILS as any
    );

    const response = await request(app)
      .post('/api/places/details')
      .send({ place_id: MOCK_PLACE_ID });

    expect(response.status).toBe(200);

    // Verify transformed data structure
    const { businessData } = response.body;
    expect(businessData).toHaveProperty('place_id');
    expect(businessData).toHaveProperty('name');
    expect(businessData).toHaveProperty('location');
    expect(businessData).toHaveProperty('photos');
    expect(businessData).toHaveProperty('hours');
    expect(businessData).toHaveProperty('reviews');
    expect(businessData).toHaveProperty('lastUpdated');

    // Verify photo transformation (photoReference instead of photo_reference)
    if (businessData.photos && businessData.photos.length > 0) {
      expect(businessData.photos[0]).toHaveProperty('photoReference');
      expect(businessData.photos[0]).toHaveProperty('attributions');
    }
  });

  it('should handle not found error (404) for invalid place_id', async () => {
    // Mock cache miss
    vi.mocked(placeDetailsCache.getCachedPlaceDetails).mockReturnValue(null);

    // Mock not found error
    vi.mocked(placeDetailsService.fetchPlaceDetailsWithRetry).mockRejectedValue(
      new Error('Business not found')
    );

    const response = await request(app)
      .post('/api/places/details')
      .send({ place_id: 'invalid_place_id' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Business not found');
  });
});
