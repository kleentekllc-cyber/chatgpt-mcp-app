/**
 * Tests for Directions API endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../mcp-server.js';
import { TravelMode } from '../types/directions.js';

// Mock the services
vi.mock('../services/directions-api-service.js', () => ({
  getDirectionsWithRetry: vi.fn(),
}));

vi.mock('../services/directions-cache-service.js', () => ({
  getCachedDirections: vi.fn(),
  setCachedDirections: vi.fn(),
  shouldBypassDirectionsCache: vi.fn(),
}));

import * as directionsApiService from '../services/directions-api-service.js';
import * as directionsCacheService from '../services/directions-cache-service.js';

const mockGetDirectionsWithRetry = vi.mocked(directionsApiService.getDirectionsWithRetry);
const mockGetCachedDirections = vi.mocked(directionsCacheService.getCachedDirections);
const mockSetCachedDirections = vi.mocked(directionsCacheService.setCachedDirections);
const mockShouldBypassDirectionsCache = vi.mocked(directionsCacheService.shouldBypassDirectionsCache);

describe('POST /api/directions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockShouldBypassDirectionsCache.mockReturnValue(false);
  });

  describe('Successful route calculation', () => {
    it('should return directions for valid origin and destination', async () => {
      const mockRoutes = [
        {
          legs: [
            {
              steps: [
                {
                  instruction: 'Head north on Main St',
                  distance: { text: '0.5 mi', value: 804 },
                  duration: { text: '2 mins', value: 120 },
                  startLocation: { lat: 40.7128, lng: -74.006 },
                  endLocation: { lat: 40.7138, lng: -74.006 },
                },
              ],
              distance: { text: '0.5 mi', value: 804 },
              duration: { text: '2 mins', value: 120 },
              startAddress: '123 Main St, New York, NY',
              endAddress: '456 Broadway, New York, NY',
              startLocation: { lat: 40.7128, lng: -74.006 },
              endLocation: { lat: 40.7138, lng: -74.006 },
            },
          ],
          overviewPolyline: 'encodedPolylineString',
          bounds: {
            northeast: { lat: 40.7138, lng: -74.006 },
            southwest: { lat: 40.7128, lng: -74.006 },
          },
          summary: 'Main St',
          warnings: [],
          copyrights: 'Map data ©2024 Google',
        },
      ];

      mockGetCachedDirections.mockReturnValue(null);
      mockGetDirectionsWithRetry.mockResolvedValue(mockRoutes);

      const response = await request(app)
        .post('/api/directions')
        .send({
          origin: { lat: 40.7128, lng: -74.006 },
          destination: { lat: 40.7138, lng: -74.006 },
          travelMode: TravelMode.DRIVING,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('routes');
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('requestId');
      expect(response.body).toHaveProperty('cacheStatus', 'miss');
      expect(response.body.routes).toEqual(mockRoutes);
    });

    it('should handle all four transport modes', async () => {
      const mockRoutes = [
        {
          legs: [],
          overviewPolyline: 'test',
          bounds: {
            northeast: { lat: 0, lng: 0 },
            southwest: { lat: 0, lng: 0 },
          },
          summary: '',
          warnings: [],
          copyrights: '',
        },
      ];

      mockGetCachedDirections.mockReturnValue(null);
      mockGetDirectionsWithRetry.mockResolvedValue(mockRoutes);

      const modes = [TravelMode.DRIVING, TravelMode.WALKING, TravelMode.TRANSIT, TravelMode.BICYCLING];

      for (const mode of modes) {
        const response = await request(app)
          .post('/api/directions')
          .send({
            origin: { lat: 40.7128, lng: -74.006 },
            destination: { lat: 40.7138, lng: -74.006 },
            travelMode: mode,
          });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('OK');
      }
    });

    it('should return cached results when available', async () => {
      const mockRoutes = [
        {
          legs: [],
          overviewPolyline: 'cached',
          bounds: {
            northeast: { lat: 0, lng: 0 },
            southwest: { lat: 0, lng: 0 },
          },
          summary: '',
          warnings: [],
          copyrights: '',
        },
      ];

      mockGetCachedDirections.mockReturnValue(mockRoutes);

      const response = await request(app)
        .post('/api/directions')
        .send({
          origin: { lat: 40.7128, lng: -74.006 },
          destination: { lat: 40.7138, lng: -74.006 },
          travelMode: TravelMode.DRIVING,
        });

      expect(response.status).toBe(200);
      expect(response.body.cacheStatus).toBe('hit');
      expect(mockGetDirectionsWithRetry).not.toHaveBeenCalled();
    });
  });

  describe('Validation errors', () => {
    it('should return 400 for missing origin', async () => {
      const response = await request(app)
        .post('/api/directions')
        .send({
          destination: { lat: 40.7138, lng: -74.006 },
          travelMode: TravelMode.DRIVING,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid request parameters');
      expect(response.body.details).toContain('origin is required');
    });

    it('should return 400 for invalid coordinates', async () => {
      const response = await request(app)
        .post('/api/directions')
        .send({
          origin: { lat: 999, lng: -74.006 }, // Invalid latitude
          destination: { lat: 40.7138, lng: -74.006 },
          travelMode: TravelMode.DRIVING,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid request parameters');
    });

    it('should return 400 for invalid travel mode', async () => {
      const response = await request(app)
        .post('/api/directions')
        .send({
          origin: { lat: 40.7128, lng: -74.006 },
          destination: { lat: 40.7138, lng: -74.006 },
          travelMode: 'FLYING', // Invalid mode
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request parameters');
      expect(response.body.details.length).toBeGreaterThan(0);
      expect(response.body.details[0]).toContain('travelMode must be one of');
    });

    it('should return 400 for identical origin and destination', async () => {
      const response = await request(app)
        .post('/api/directions')
        .send({
          origin: { lat: 40.7128, lng: -74.006 },
          destination: { lat: 40.7128, lng: -74.006 },
          travelMode: TravelMode.DRIVING,
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toContain('origin and destination cannot be identical');
    });
  });

  describe('Error handling', () => {
    it('should return 404 when no route is found', async () => {
      mockGetCachedDirections.mockReturnValue(null);
      mockGetDirectionsWithRetry.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/directions')
        .send({
          origin: { lat: 40.7128, lng: -74.006 },
          destination: { lat: 40.7138, lng: -74.006 },
          travelMode: TravelMode.TRANSIT,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('No route available');
    });

    it('should handle API failures gracefully', async () => {
      mockGetCachedDirections.mockReturnValue(null);
      mockGetDirectionsWithRetry.mockRejectedValue(new Error('API timeout'));

      const response = await request(app)
        .post('/api/directions')
        .send({
          origin: { lat: 40.7128, lng: -74.006 },
          destination: { lat: 40.7138, lng: -74.006 },
          travelMode: TravelMode.DRIVING,
        });

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Cache behavior', () => {
    it('should cache successful results', async () => {
      const mockRoutes = [
        {
          legs: [],
          overviewPolyline: 'test',
          bounds: {
            northeast: { lat: 0, lng: 0 },
            southwest: { lat: 0, lng: 0 },
          },
          summary: '',
          warnings: [],
          copyrights: '',
        },
      ];

      mockGetCachedDirections.mockReturnValue(null);
      mockGetDirectionsWithRetry.mockResolvedValue(mockRoutes);

      await request(app)
        .post('/api/directions')
        .send({
          origin: { lat: 40.7128, lng: -74.006 },
          destination: { lat: 40.7138, lng: -74.006 },
          travelMode: TravelMode.DRIVING,
        });

      expect(mockSetCachedDirections).toHaveBeenCalled();
    });
  });
});
