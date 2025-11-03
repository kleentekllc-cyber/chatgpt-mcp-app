/**
 * Filter Parsing Tests (Task 4.1)
 */

import { describe, it, expect } from 'vitest';
import { extractFilters } from './filter-parser.js';

describe('Filter Parameter Parsing', () => {
  it('should extract rating filter - 4-star', () => {
    const result = extractFilters('find 4-star restaurants');

    expect(result.filters.rating).toBe(4);
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should parse temporal filter - open now', () => {
    const result = extractFilters('coffee shops open now');

    expect(result.filters.openNow).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('should extract price level - cheap', () => {
    const result = extractFilters('cheap restaurants nearby');

    expect(result.filters.priceLevel).toBe(1);
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should recognize attribute filters - with wifi', () => {
    const result = extractFilters('cafes with wifi');

    expect(result.filters.attributes).toContain('wifi');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should combine multiple filters', () => {
    const result = extractFilters('4-star restaurants open now with parking');

    expect(result.filters.rating).toBe(4);
    expect(result.filters.openNow).toBe(true);
    expect(result.filters.attributes).toContain('parking');
  });
});
