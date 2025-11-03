/**
 * Business Type Extraction Tests (Task 3.1)
 */

import { describe, it, expect } from 'vitest';
import { extractBusinessType } from './business-type-parser.js';

describe('Business Type Extraction', () => {
  it('should extract common business type - coffee shops', () => {
    const result = extractBusinessType('find coffee shops near downtown');

    expect(result.types).toContain('coffee_shop');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should map synonyms correctly - mechanic to auto_repair', () => {
    const result = extractBusinessType('find a mechanic nearby');

    expect(result.types).toContain('auto_repair');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should extract cuisine-specific queries - Italian restaurants', () => {
    const result = extractBusinessType('italian restaurants in Seattle');

    expect(result.types).toContain('restaurant');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should handle multiple business types - coffee shops or bakeries', () => {
    const result = extractBusinessType('coffee shops or bakeries near me');

    expect(result.types.length).toBeGreaterThanOrEqual(2);
    expect(result.types).toEqual(
      expect.arrayContaining(['coffee_shop', 'bakery'])
    );
  });

  it('should default to "business" when no specific type detected', () => {
    const result = extractBusinessType('find something nearby');

    expect(result.types).toContain('business');
    expect(result.confidence).toBeLessThan(0.5);
  });
});
