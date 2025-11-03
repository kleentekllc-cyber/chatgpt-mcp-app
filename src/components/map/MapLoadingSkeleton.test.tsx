/**
 * Tests for MapLoadingSkeleton Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapLoadingSkeleton } from './MapLoadingSkeleton';

describe('MapLoadingSkeleton', () => {
  it('should render loading spinner', () => {
    // Act
    render(<MapLoadingSkeleton />);

    // Assert
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-label', 'Loading map');
  });

  it('should display loading text', () => {
    // Act
    render(<MapLoadingSkeleton />);

    // Assert
    expect(screen.getByText('Loading map...')).toBeInTheDocument();
  });

  it('should have fullscreen layout', () => {
    // Act
    const { container } = render(<MapLoadingSkeleton />);

    // Assert
    const loadingContainer = container.firstChild as HTMLElement;
    expect(loadingContainer).toHaveClass('w-screen', 'h-screen');
  });
});
