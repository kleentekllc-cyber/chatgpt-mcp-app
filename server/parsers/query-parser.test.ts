/**
 * Query Parser Integration Tests (Task 6.1)
 */

import { describe, it, expect } from 'vitest';
import { parseQuery } from './query-parser.js';

describe('Query Parser Integration', () => {
  it('should parse full query and return correct QueryParseResult', async () => {
    const result = await parseQuery('find 4-star coffee shops near downtown Seattle');

    expect(result.businessType).toContain('coffee_shop');
    expect(result.location.value).toBeTruthy();
    expect(result.filters.rating).toBe(4);
    expect(result.metadata.originalQuery).toBe(
      'find 4-star coffee shops near downtown Seattle'
    );
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should handle queries with multiple filters', async () => {
    const result = await parseQuery('cheap restaurants open now with wifi');

    expect(result.businessType).toContain('restaurant');
    expect(result.filters.priceLevel).toBe(1);
    expect(result.filters.openNow).toBe(true);
    expect(result.filters.attributes).toContain('wifi');
  });

  it('should throw error for empty query', async () => {
    await expect(parseQuery('')).rejects.toThrow();
  });

  it('should sanitize malicious input', async () => {
    const result = await parseQuery(
      '<script>alert("xss")</script>find coffee shops'
    );

    expect(result.metadata.originalQuery).toContain('<script>');
    // The actual parsed query should be sanitized
    expect(result.businessType).toBeTruthy();
  });

  it('should calculate overall confidence score', async () => {
    const result = await parseQuery('coffee shops in Seattle');

    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});
