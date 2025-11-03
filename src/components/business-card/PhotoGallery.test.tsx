/**
 * Tests for PhotoGallery Component
 * Task 4.1: Focused tests for rich content components (Photo Gallery)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoGallery } from './PhotoGallery';
import { Photo } from '../../types/business';

const MOCK_PHOTOS: Photo[] = [
  {
    photoReference: 'photo1',
    width: 800,
    height: 600,
    attributions: ['Photo by User 1'],
  },
  {
    photoReference: 'photo2',
    width: 800,
    height: 600,
    attributions: ['Photo by User 2'],
  },
  {
    photoReference: 'photo3',
    width: 800,
    height: 600,
    attributions: ['Photo by User 3'],
  },
];

describe('PhotoGallery Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render hero image and thumbnails', () => {
    render(<PhotoGallery photos={MOCK_PHOTOS} businessName="Test Business" />);

    // Check photo count indicator
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // Check thumbnails
    const thumbnails = screen.getAllByRole('listitem');
    expect(thumbnails).toHaveLength(3);
  });

  it('should navigate to next photo with arrow button', () => {
    render(<PhotoGallery photos={MOCK_PHOTOS} businessName="Test Business" />);

    // Initially on photo 1
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // Click next button
    const nextButton = screen.getByLabelText('Next photo');
    fireEvent.click(nextButton);

    // Should show photo 2
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('should navigate with keyboard arrow keys', () => {
    render(<PhotoGallery photos={MOCK_PHOTOS} businessName="Test Business" />);

    const heroImage = screen.getByRole('img', { name: /Photo 1 of 3/i });

    // Navigate right
    fireEvent.keyDown(heroImage, { key: 'ArrowRight' });
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    // Navigate left
    fireEvent.keyDown(heroImage, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('should show placeholder when no photos available', () => {
    render(<PhotoGallery photos={[]} businessName="Test Business" />);

    expect(screen.getByText('No photos available')).toBeInTheDocument();
  });

  it('should limit photos to maximum of 10', () => {
    const manyPhotos: Photo[] = Array.from({ length: 15 }, (_, i) => ({
      photoReference: `photo${i}`,
      width: 800,
      height: 600,
      attributions: [`Photo by User ${i}`],
    }));

    render(<PhotoGallery photos={manyPhotos} businessName="Test Business" />);

    const thumbnails = screen.getAllByRole('listitem');
    expect(thumbnails).toHaveLength(10);
  });
});
