/**
 * Location Extraction Tests (Task 3.1)
 */

import { describe, it, expect } from 'vitest';
import { extractLocation } from './location-parser.js';

describe('Location Extraction', () => {
  it('should extract explicit location - Seattle', () => {
    const result = extractLocation('coffee shops in Seattle');

    expect(result.type).toBe('explicit');
    expect(result.value.toLowerCase()).toBe('seattle');
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it('should detect relative location phrases - near me', () => {
    const result = extractLocation('find restaurants near me');

    expect(result.type).toBe('relative');
    expect(result.value).toBe('near me');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should parse distance specifications - within 2 miles', () => {
    const result = extractLocation('coffee shops within 2 miles');

    expect(result.type).toBe('relative');
    expect(result.distance).toBeDefined();
    expect(result.distance?.value).toBe(2);
    expect(result.distance?.unit).toBe('miles');
  });

  it('should recognize landmark references - near Times Square', () => {
    const result = extractLocation('restaurants near Times Square');

    expect(result.type).toBe('landmark');
    expect(result.value.toLowerCase()).toContain('times square');
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it('should extract zip codes', () => {
    const result = extractLocation('grocery stores in 98101');

    expect(result.type).toBe('explicit');
    expect(result.value).toBe('98101');
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});
