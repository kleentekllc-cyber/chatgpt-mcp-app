/**
 * Tests for MapError Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapError } from './MapError';

describe('MapError', () => {
  it('should render error message', () => {
    // Arrange
    const message = 'Failed to load map';

    // Act
    render(<MapError message={message} />);

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByText('Unable to Load Map')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    // Arrange
    const onRetry = vi.fn();

    // Act
    render(<MapError message="Error" onRetry={onRetry} />);

    // Assert
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    // Act
    render(<MapError message="Error" />);

    // Assert
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    // Arrange
    const onRetry = vi.fn();

    // Act
    render(<MapError message="Error" onRetry={onRetry} />);
    const retryButton = screen.getByRole('button', { name: /retry/i });
    retryButton.click();

    // Assert
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should have accessible alert role', () => {
    // Act
    render(<MapError message="Test error" />);

    // Assert
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});
