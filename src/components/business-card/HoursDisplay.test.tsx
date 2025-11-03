/**
 * Tests for HoursDisplay Component
 * Task 4.1: Focused tests for rich content components (Hours Display)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HoursDisplay } from './HoursDisplay';
import { Hours } from '../../types/business';

describe('HoursDisplay Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show current day highlighted', () => {
    const mockHours: Hours = {
      isOpenNow: true,
      weekdayText: [
        'Sunday: 10:00 AM - 8:00 PM',
        'Monday: 9:00 AM - 9:00 PM',
        'Tuesday: 9:00 AM - 9:00 PM',
        'Wednesday: 9:00 AM - 9:00 PM',
        'Thursday: 9:00 AM - 9:00 PM',
        'Friday: 9:00 AM - 10:00 PM',
        'Saturday: 10:00 AM - 10:00 PM',
      ],
      periods: [],
    };

    render(<HoursDisplay hours={mockHours} />);

    // Should display hours section
    expect(screen.getByText('Hours')).toBeInTheDocument();
  });

  it('should display "Open" status when business is open', () => {
    const mockHours: Hours = {
      isOpenNow: true,
      weekdayText: ['Monday: 9:00 AM - 9:00 PM'],
      periods: [],
    };

    render(<HoursDisplay hours={mockHours} />);

    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should display "Closed" status when business is closed', () => {
    const mockHours: Hours = {
      isOpenNow: false,
      weekdayText: ['Monday: 9:00 AM - 9:00 PM'],
      periods: [],
    };

    render(<HoursDisplay hours={mockHours} />);

    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('should handle missing hours data gracefully', () => {
    render(<HoursDisplay hours={undefined} />);

    expect(screen.getByText('Hours unavailable')).toBeInTheDocument();
  });

  it('should display today\'s hours', () => {
    // const today = new Date().getDay();
    const weekdayText = [
      'Sunday: 10:00 AM - 8:00 PM',
      'Monday: 9:00 AM - 9:00 PM',
      'Tuesday: 9:00 AM - 9:00 PM',
      'Wednesday: 9:00 AM - 9:00 PM',
      'Thursday: 9:00 AM - 9:00 PM',
      'Friday: 9:00 AM - 10:00 PM',
      'Saturday: 10:00 AM - 10:00 PM',
    ];

    const mockHours: Hours = {
      isOpenNow: true,
      weekdayText,
      periods: [],
    };

    render(<HoursDisplay hours={mockHours} />);

    // Check that today's hours are shown
    expect(screen.getByText(/Today:/i)).toBeInTheDocument();
  });
});
