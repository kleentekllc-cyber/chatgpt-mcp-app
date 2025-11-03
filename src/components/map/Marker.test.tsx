/**
 * Tests for Marker Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Marker } from './Marker';

// Mock the AdvancedMarker component
vi.mock('@vis.gl/react-google-maps', () => ({
  AdvancedMarker: ({ position, title, children }: any) => (
    <div data-testid="advanced-marker" data-position={JSON.stringify(position)} title={title}>
      {children}
    </div>
  ),
}));

describe('Marker', () => {
  it('should render marker at correct position', () => {
    // Arrange
    const position = { lat: 37.7749, lng: -122.4194 };
    const label = 'Test Location';

    // Act
    render(<Marker position={position} label={label} />);

    // Assert
    const marker = screen.getByTestId('advanced-marker');
    expect(marker).toBeInTheDocument();
    expect(marker).toHaveAttribute('data-position', JSON.stringify(position));
    expect(marker).toHaveAttribute('title', label);
  });

  it('should render default marker without icon', () => {
    // Arrange
    const position = { lat: 40.7128, lng: -74.0060 };

    // Act
    render(<Marker position={position} />);

    // Assert
    const markerElement = screen.getByLabelText('Location marker');
    expect(markerElement).toBeInTheDocument();
    expect(markerElement).toHaveClass('bg-chatgpt-accent');
  });

  it('should render custom icon when provided', () => {
    // Arrange
    const position = { lat: 34.0522, lng: -118.2437 };
    const icon = '/test-icon.png';
    const label = 'Custom Marker';

    // Act
    render(<Marker position={position} icon={icon} label={label} />);

    // Assert
    const iconElement = screen.getByAltText(label);
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveAttribute('src', icon);
  });

  it('should update when position changes', () => {
    // Arrange
    const initialPosition = { lat: 37.7749, lng: -122.4194 };
    const updatedPosition = { lat: 40.7128, lng: -74.0060 };

    // Act
    const { rerender } = render(<Marker position={initialPosition} />);

    let marker = screen.getByTestId('advanced-marker');
    expect(marker).toHaveAttribute('data-position', JSON.stringify(initialPosition));

    // Update position
    rerender(<Marker position={updatedPosition} />);

    // Assert
    marker = screen.getByTestId('advanced-marker');
    expect(marker).toHaveAttribute('data-position', JSON.stringify(updatedPosition));
  });
});
