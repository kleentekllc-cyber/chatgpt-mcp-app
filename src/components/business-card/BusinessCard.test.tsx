/**
 * Tests for BusinessCard Component
 * Task 3.1: Focused tests for BusinessCard component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BusinessCard } from './BusinessCard';
import { BusinessData } from '../../types/business';

const MOCK_BUSINESS_DATA: BusinessData = {
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

describe('BusinessCard Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with valid businessData prop', () => {
    render(
      <BusinessCard
        businessData={MOCK_BUSINESS_DATA}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
  });

  it('should display loading state with skeleton', () => {
    render(
      <BusinessCard
        businessData={null}
        isOpen={true}
        onClose={mockOnClose}
        loading={true}
      />
    );

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display error banner when error prop is provided', () => {
    const errorMessage = 'Failed to load business details';

    render(
      <BusinessCard
        businessData={null}
        isOpen={true}
        onClose={mockOnClose}
        error={errorMessage}
      />
    );

    expect(screen.getByText(/Some details couldn't be loaded/i)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should trigger onClose callback when close button clicked', () => {
    render(
      <BusinessCard
        businessData={MOCK_BUSINESS_DATA}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close business details');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close card when Escape key is pressed', () => {
    render(
      <BusinessCard
        businessData={MOCK_BUSINESS_DATA}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <BusinessCard
        businessData={MOCK_BUSINESS_DATA}
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
