/**
 * Tests for Business Types
 * Task 2.1: Focused tests for data type validation
 */

import { describe, it, expect } from 'vitest';
import type {
  BusinessData,
  Photo,
  Hours,
  Review,
  BusinessCardProps,
} from './business';

describe('Business Type Definitions', () => {
  it('should validate BusinessData structure correctly', () => {
    const businessData: BusinessData = {
      place_id: 'test-place-id',
      name: 'Test Business',
      location: { lat: 40.7128, lng: -74.006 },
      rating: 4.5,
      user_ratings_total: 100,
      reviewCount: 100,
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA',
      },
      formatted_address: '123 Main St, New York, NY 10001',
      business_status: 'OPERATIONAL',
      lastUpdated: Date.now(),
    };

    expect(businessData.place_id).toBeDefined();
    expect(businessData.name).toBeDefined();
    expect(businessData.location).toHaveProperty('lat');
    expect(businessData.location).toHaveProperty('lng');
    expect(businessData.lastUpdated).toBeGreaterThan(0);
  });

  it('should validate Photo structure with required fields', () => {
    const photo: Photo = {
      photoReference: 'test-photo-ref',
      width: 800,
      height: 600,
      attributions: ['Test Attribution'],
    };

    expect(photo.photoReference).toBe('test-photo-ref');
    expect(photo.width).toBe(800);
    expect(photo.height).toBe(600);
    expect(Array.isArray(photo.attributions)).toBe(true);
  });

  it('should validate Hours structure with weekdayText and periods', () => {
    const hours: Hours = {
      isOpenNow: true,
      weekdayText: ['Monday: 9:00 AM - 5:00 PM', 'Tuesday: 9:00 AM - 5:00 PM'],
      periods: [
        {
          open: { day: 1, time: '0900' },
          close: { day: 1, time: '1700' },
        },
      ],
    };

    expect(hours.isOpenNow).toBe(true);
    expect(Array.isArray(hours.weekdayText)).toBe(true);
    expect(Array.isArray(hours.periods)).toBe(true);
    expect(hours.periods![0].open.day).toBe(1);
  });

  it('should validate Review structure with required fields', () => {
    const review: Review = {
      author: 'John Doe',
      rating: 5,
      relativeTime: '2 weeks ago',
      text: 'Great place!',
      timestamp: Date.now(),
    };

    expect(review.author).toBe('John Doe');
    expect(review.rating).toBe(5);
    expect(review.text).toBe('Great place!');
    expect(review.timestamp).toBeGreaterThan(0);
  });

  it('should handle null for optional fields in BusinessData', () => {
    const minimalData: BusinessData = {
      place_id: 'test-id',
      name: 'Minimal Business',
      location: { lat: 0, lng: 0 },
      address: {},
      formatted_address: 'Test Address',
      business_status: 'OPERATIONAL',
      lastUpdated: Date.now(),
    };

    // Optional fields can be undefined
    expect(minimalData.phone).toBeUndefined();
    expect(minimalData.website).toBeUndefined();
    expect(minimalData.photos).toBeUndefined();
    expect(minimalData.hours).toBeUndefined();
    expect(minimalData.reviews).toBeUndefined();
  });

  it('should validate BusinessCardProps interface', () => {
    const mockClose = () => {};
    const mockDirections = (_placeId: string) => {};

    const props: BusinessCardProps = {
      businessData: null,
      isOpen: false,
      onClose: mockClose,
      onDirections: mockDirections,
      loading: false,
      error: null,
    };

    expect(props.isOpen).toBe(false);
    expect(props.businessData).toBeNull();
    expect(typeof props.onClose).toBe('function');
    expect(typeof props.onDirections).toBe('function');
  });
});
