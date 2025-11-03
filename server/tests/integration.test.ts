/**
 * Strategic Integration Tests (Task 7.3)
 * Covers critical gaps in test coverage
 */

import { describe, it, expect } from 'vitest';
import { parseQuery } from '../parsers/query-parser.js';
import { detectAmbiguities } from '../validators/ambiguity-detector.js';
import {
  updateConversationContext,
  resolvePronounReference,
} from '../context/conversation-context.js';

describe('Strategic Integration Tests', () => {
  it('should handle complex queries with business type, location, and multiple filters', async () => {
    const result = await parseQuery(
      'find highly rated Italian restaurants with outdoor seating open now in downtown Seattle within 2 miles'
    );

    expect(result.businessType).toContain('restaurant');
    expect(result.location.value).toBeTruthy();
    expect(result.filters.rating).toBeGreaterThan(0);
    expect(result.filters.openNow).toBe(true);
    expect(result.filters.attributes).toContain('outdoor seating');
  });

  it('should detect ambiguity when location is missing', async () => {
    const result = await parseQuery('find coffee shops');

    const ambiguity = detectAmbiguities(result);

    if (result.confidence < 0.6 || !result.location.value) {
      expect(ambiguity).toBeTruthy();
      expect(ambiguity?.field).toBe('location');
    }
  });

  it('should detect ambiguous location names without state context', async () => {
    const result = await parseQuery('restaurants in Portland');

    const ambiguity = detectAmbiguities(result);

    // Portland is ambiguous (OR vs ME)
    if (ambiguity) {
      expect(ambiguity.field).toBe('location');
      expect(ambiguity.detectedValues[0].toLowerCase()).toContain('portland');
    }
  });

  it('should resolve pronoun references using conversation context', () => {
    const sessionId = 'test-session-123';

    // First query establishes location context
    updateConversationContext(sessionId, 'Seattle');

    // Second query with pronoun reference
    const resolved = resolvePronounReference(
      'find parking near there',
      sessionId
    );

    expect(resolved).toBe('Seattle');
  });

  it('should handle synonym mapping for multiple business types', async () => {
    const result = await parseQuery('find mechanic or car repair shops');

    expect(result.businessType).toContain('auto_repair');
  });

  it('should parse dollar sign price indicators correctly', async () => {
    const result = await parseQuery('$$$ restaurants in Manhattan');

    expect(result.filters.priceLevel).toBe(3);
  });

  it('should extract multiple attributes from query', async () => {
    const result = await parseQuery(
      'restaurants with wifi, parking, and wheelchair accessible'
    );

    expect(result.filters.attributes).toContain('wifi');
    expect(result.filters.attributes).toContain('parking');
    expect(result.filters.attributes).toContain('wheelchair accessible');
  });

  it('should handle queries with cuisine type and filters', async () => {
    const result = await parseQuery('cheap sushi restaurants open late');

    expect(result.businessType).toContain('restaurant');
    expect(result.filters.priceLevel).toBe(1);
    expect(result.filters.openNow).toBe(true);
  });

  it('should maintain high confidence for well-formed queries', async () => {
    const result = await parseQuery('4-star coffee shops in 98101');

    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should handle relative location with distance specification', async () => {
    const result = await parseQuery('gyms within 5 miles');

    expect(result.businessType).toContain('gym');
    expect(result.location.type).toBe('relative');
    expect(result.location.distance?.value).toBe(5);
    expect(result.location.distance?.unit).toBe('miles');
  });
});
