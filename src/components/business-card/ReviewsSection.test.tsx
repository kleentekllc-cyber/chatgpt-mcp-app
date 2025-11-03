/**
 * Tests for ReviewsSection Component
 * Task 4.1: Focused tests for rich content components (Reviews Section)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewsSection } from './ReviewsSection';
import { Review } from '../../types/business';

const MOCK_REVIEWS: Review[] = [
  {
    author: 'John Doe',
    rating: 5,
    relativeTime: '2 weeks ago',
    text: 'Great place! The food was amazing and the service was excellent.',
    timestamp: 1234567890000,
  },
  {
    author: 'Jane Smith',
    rating: 4,
    relativeTime: '1 month ago',
    text: 'Good experience overall. Would recommend to friends.',
    timestamp: 1234567800000,
  },
  {
    author: 'Bob Johnson',
    rating: 3,
    relativeTime: '2 months ago',
    text: 'Average. Nothing special but not bad either. Service could be improved.',
    timestamp: 1234567700000,
  },
];

describe('ReviewsSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display review snippets correctly', () => {
    render(
      <ReviewsSection
        rating={4.5}
        reviewCount={234}
        reviews={MOCK_REVIEWS}
        googleMapsUrl="https://maps.google.com/?cid=123456"
      />
    );

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText(/Based on 234 reviews/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display maximum 3 reviews', () => {
    const manyReviews: Review[] = Array.from({ length: 10 }, (_, i) => ({
      author: `User ${i}`,
      rating: 5,
      relativeTime: '1 week ago',
      text: 'Great!',
      timestamp: Date.now(),
    }));

    render(
      <ReviewsSection
        rating={4.5}
        reviewCount={10}
        reviews={manyReviews}
        googleMapsUrl="https://maps.google.com"
      />
    );

    // Should only show 3 reviews
    const reviewTexts = screen.getAllByText('Great!');
    expect(reviewTexts).toHaveLength(3);
  });

  it('should expand long review text when "Read more" clicked', () => {
    const longText = 'A'.repeat(400); // Create a long review text
    const longReview: Review = {
      author: 'Test User',
      rating: 5,
      relativeTime: '1 week ago',
      text: longText,
      timestamp: Date.now(),
    };

    render(
      <ReviewsSection
        rating={4.5}
        reviewCount={1}
        reviews={[longReview]}
        googleMapsUrl="https://maps.google.com"
      />
    );

    // Should show truncated text initially
    const readMoreButton = screen.getByText('Read more');
    expect(readMoreButton).toBeInTheDocument();

    // Click to expand
    fireEvent.click(readMoreButton);

    // Should show "Show less" after expansion
    expect(screen.getByText('Show less')).toBeInTheDocument();
  });

  it('should not render when no rating or reviews available', () => {
    const { container } = render(
      <ReviewsSection
        rating={undefined}
        reviewCount={undefined}
        reviews={undefined}
        googleMapsUrl="https://maps.google.com"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should display star rating correctly', () => {
    render(
      <ReviewsSection
        rating={4.5}
        reviewCount={100}
        reviews={[]}
        googleMapsUrl="https://maps.google.com"
      />
    );

    // Should display rating number
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should include Google attribution link', () => {
    render(
      <ReviewsSection
        rating={4.5}
        reviewCount={100}
        reviews={MOCK_REVIEWS}
        googleMapsUrl="https://maps.google.com/?cid=123456"
      />
    );

    const link = screen.getByText('See all reviews on Google Maps');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://maps.google.com/?cid=123456');
    expect(screen.getByText('Reviews powered by Google')).toBeInTheDocument();
  });
});
