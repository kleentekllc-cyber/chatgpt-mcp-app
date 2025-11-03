/**
 * Test Setup Configuration
 * Global test setup for vitest and testing-library
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Google Maps API
(globalThis as any).google = {
  maps: {
    Map: class {
      constructor() {}
      setCenter() {}
      setZoom() {}
      panTo() {}
    },
    Marker: class {
      constructor() {}
      setMap() {}
      setPosition() {}
    },
    LatLng: class {
      constructor(public lat: number, public lng: number) {}
    },
    event: {
      addListener: () => {},
      removeListener: () => {},
      clearInstanceListeners: () => {},
    },
  },
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {}

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
};

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock navigator.share
Object.defineProperty(navigator, 'share', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
});
