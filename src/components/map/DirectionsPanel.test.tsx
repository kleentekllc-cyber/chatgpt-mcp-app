/**
 * Tests for DirectionsPanel component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DirectionsPanel } from './DirectionsPanel';
import { TravelMode, Route } from '../../types/directions';

describe('DirectionsPanel', () => {
  const mockRoute: Route = {
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
          {
            instruction: 'Turn left onto Broadway',
            distance: { text: '1.2 mi', value: 1931 },
            duration: { text: '5 mins', value: 300 },
            maneuver: 'turn-left' as any,
            startLocation: { lat: 40.7138, lng: -74.006 },
            endLocation: { lat: 40.7228, lng: -74.006 },
          },
        ],
        distance: { text: '1.7 mi', value: 2735 },
        duration: { text: '7 mins', value: 420 },
        startAddress: '123 Main St, New York, NY',
        endAddress: '456 Broadway, New York, NY',
        startLocation: { lat: 40.7128, lng: -74.006 },
        endLocation: { lat: 40.7228, lng: -74.006 },
      },
    ],
    overviewPolyline: 'test',
    bounds: {
      northeast: { lat: 40.7228, lng: -74.006 },
      southwest: { lat: 40.7128, lng: -74.006 },
    },
    summary: 'Main St and Broadway',
    warnings: [],
    copyrights: 'Test',
  };

  const defaultProps = {
    route: mockRoute,
    travelMode: TravelMode.DRIVING,
    onTravelModeChange: vi.fn(),
    onClose: vi.fn(),
  };

  it('should render directions panel with route information', () => {
    render(<DirectionsPanel {...defaultProps} />);

    expect(screen.getByText('Directions')).toBeInTheDocument();
    expect(screen.getByText('7 mins')).toBeInTheDocument();
    expect(screen.getByText('(1.7 mi)')).toBeInTheDocument();
  });

  it('should display turn-by-turn steps', () => {
    render(<DirectionsPanel {...defaultProps} />);

    expect(screen.getByText(/Head north on Main St/i)).toBeInTheDocument();
    expect(screen.getByText(/Turn left onto Broadway/i)).toBeInTheDocument();
  });

  it('should display start and end addresses', () => {
    render(<DirectionsPanel {...defaultProps} />);

    expect(screen.getByText('123 Main St, New York, NY')).toBeInTheDocument();
    expect(screen.getByText('456 Broadway, New York, NY')).toBeInTheDocument();
  });

  it('should render transport mode selector', () => {
    render(<DirectionsPanel {...defaultProps} />);

    expect(screen.getByLabelText('Driving directions')).toBeInTheDocument();
    expect(screen.getByLabelText('Walking directions')).toBeInTheDocument();
    expect(screen.getByLabelText('Public transit directions')).toBeInTheDocument();
    expect(screen.getByLabelText('Bicycling directions')).toBeInTheDocument();
  });

  it('should call onTravelModeChange when mode is changed', () => {
    render(<DirectionsPanel {...defaultProps} />);

    const walkingButton = screen.getByLabelText('Walking directions');
    fireEvent.click(walkingButton);

    expect(defaultProps.onTravelModeChange).toHaveBeenCalledWith(TravelMode.WALKING);
  });

  it('should call onClose when close button is clicked', () => {
    render(<DirectionsPanel {...defaultProps} />);

    const closeButton = screen.getByLabelText('Close directions');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<DirectionsPanel {...defaultProps} loading={true} route={null} />);

    expect(screen.getByText('Directions')).toBeInTheDocument();
    // Loading skeleton should be present
    const panel = screen.getByRole('complementary');
    expect(panel).toBeInTheDocument();
  });

  it('should show error state', () => {
    render(
      <DirectionsPanel {...defaultProps} error="Failed to load directions" route={null} />
    );

    expect(screen.getByText('Failed to load directions')).toBeInTheDocument();
  });

  it('should display business name in header when provided', () => {
    render(<DirectionsPanel {...defaultProps} businessName="Test Business" />);

    expect(screen.getByText('Directions to Test Business')).toBeInTheDocument();
  });

  it('should collapse on mobile when collapse button is clicked', () => {
    render(<DirectionsPanel {...defaultProps} />);

    // The collapse button should be present on mobile
    const collapseButton = screen.getByLabelText(/Collapse directions/i);
    fireEvent.click(collapseButton);

    // After clicking, it should say "Expand"
    expect(screen.getByLabelText(/Expand directions/i)).toBeInTheDocument();
  });
});
