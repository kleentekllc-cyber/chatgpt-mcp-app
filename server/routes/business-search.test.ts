/**
 * Business Search API Tests
 * Task Group 1 & 6: API Proxy Endpoint and Integration Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../mcp-server.js';

// Mock the services to avoid actual API calls during testing
vi.mock('../services/places-search-service.js', () => ({
  searchBusinessesWithRetry: vi.fn(),
}));

vi.mock('../services/geocoding-service.js', () => ({
  geocodeLocation: vi.fn(),
}));

describe('POST /api/search/businesses', () => {
  describe('Task 1.1: API Proxy Endpoint Tests', () => {
    it('should return 200 with valid payload', async () => {
      const { searchBusinessesWithRetry } = await import(
        '../services/places-search-service.js'
      );
      const { geocodeLocation } = await import(
        '../services/geocoding-service.js'
      );

      // Mock successful responses
      (geocodeLocation as any).mockResolvedValue({ lat: 47.6062, lng: -122.3321 });
      (searchBusinessesWithRetry as any).mockResolvedValue([]);

      const response = await request(app)
        .post('/api/search/businesses')
        .send({
          businessType: 'coffee_shop',
          location: 'Seattle, WA',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('businesses');
      expect(response.body).toHaveProperty('totalCount');
      expect(response.body).toHaveProperty('requestId');
    });

    it('should not expose API key in response', async () => {
      const { searchBusinessesWithRetry } = await import(
        '../services/places-search-service.js'
      );
      const { geocodeLocation } = await import(
        '../services/geocoding-service.js'
      );

      (geocodeLocation as any).mockResolvedValue({ lat: 47.6062, lng: -122.3321 });
      (searchBusinessesWithRetry as any).mockResolvedValue([]);

      const response = await request(app)
        .post('/api/search/businesses')
        .send({
          businessType: 'restaurant',
          location: 'Portland, OR',
        });

      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toContain('AIza'); // Common prefix for Google API keys
      expect(responseText).not.toContain('GOOGLE_PLACES_API_KEY');
    });

    it('should reject missing businessType field', async () => {
      const response = await request(app)
        .post('/api/search/businesses')
        .send({
          location: 'Seattle, WA',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.details).toContain(
        'businessType is required and must be a string'
      );
    });

    it('should reject missing location field', async () => {
      const response = await request(app)
        .post('/api/search/businesses')
        .send({
          businessType: 'coffee_shop',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.details).toContain(
        'location is required and must be a string'
      );
    });

    it('should return 400 for invalid rating filter', async () => {
      const response = await request(app)
        .post('/api/search/businesses')
        .send({
          businessType: 'restaurant',
          location: 'Seattle, WA',
          filters: {
            rating: 10, // Invalid: should be 0-5
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toContain(
        'filters.rating must be a number between 0 and 5'
      );
    });

    it('should return 503 when Places API is unavailable', async () => {
      const { geocodeLocation } = await import(
        '../services/geocoding-service.js'
      );
      const { searchBusinessesWithRetry } = await import(
        '../services/places-search-service.js'
      );

      (geocodeLocation as any).mockResolvedValue({ lat: 47.6062, lng: -122.3321 });
      (searchBusinessesWithRetry as any).mockRejectedValue(
        new Error('Service temporarily unavailable')
      );

      const response = await request(app)
        .post('/api/search/businesses')
        .send({
          businessType: 'coffee_shop',
          location: 'Seattle, WA',
        });

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('error');
    });

    it('should include rate limit headers in response', async () => {
      const { searchBusinessesWithRetry } = await import(
        '../services/places-search-service.js'
      );
      const { geocodeLocation } = await import(
        '../services/geocoding-service.js'
      );

      (geocodeLocation as any).mockResolvedValue({ lat: 47.6062, lng: -122.3321 });
      (searchBusinessesWithRetry as any).mockResolvedValue([]);

      const response = await request(app)
        .post('/api/search/businesses')
        .send({
          businessType: 'restaurant',
          location: 'New York, NY',
        });

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });

  describe('Task 6.1: Integration Tests', () => {
    it('should complete end-to-end search flow', async () => {
      const { searchBusinessesWithRetry } = await import(
        '../services/places-search-service.js'
      );
      const { geocodeLocation } = await import(
        '../services/geocoding-service.js'
      );

      const mockPlaces = [
        {
          place_id: 'test123',
          name: 'Test Coffee Shop',
          geometry: { location: { lat: 47.6062, lng: -122.3321 } },
          rating: 4.5,
          formatted_address: '123 Main St, Seattle, WA',
          business_status: 'OPERATIONAL',
        },
      ];

      (geocodeLocation as any).mockResolvedValue({ lat: 47.6062, lng: -122.3321 });
      (searchBusinessesWithRetry as any).mockResolvedValue(mockPlaces);

      const response = await request(app)
        .post('/api/search/businesses')
        .send({
          businessType: 'coffee_shop',
          location: 'Seattle, WA',
        });

      expect(response.status).toBe(200);
      expect(response.body.businesses).toHaveLength(1);
      expect(response.body.businesses[0].name).toBe('Test Coffee Shop');
    });

    it('should return empty results with user-friendly message', async () => {
      const { searchBusinessesWithRetry } = await import(
        '../services/places-search-service.js'
      );
      const { geocodeLocation } = await import(
        '../services/geocoding-service.js'
      );

      (geocodeLocation as any).mockResolvedValue({ lat: 47.6062, lng: -122.3321 });
      (searchBusinessesWithRetry as any).mockResolvedValue([]);

      const response = await request(app)
        .post('/api/search/businesses')
        .send({
          businessType: 'underwater_restaurant',
          location: 'Seattle, WA',
        });

      expect(response.status).toBe(200);
      expect(response.body.businesses).toHaveLength(0);
      expect(response.body.totalCount).toBe(0);
    });

    it('should not expose internal API errors to client', async () => {
      const { geocodeLocation } = await import(
        '../services/geocoding-service.js'
      );

      (geocodeLocation as any).mockRejectedValue(
        new Error('Internal Google API error with sensitive details')
      );

      const response = await request(app)
        .post('/api/search/businesses')
        .send({
          businessType: 'restaurant',
          location: 'Invalid Location XYZ',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).not.toContain('Google API');
      expect(response.body.message).toContain('location');
    });
  });
});
