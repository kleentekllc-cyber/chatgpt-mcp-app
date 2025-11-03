/**
 * Tests for Refinement Query Parser
 */

import { describe, it, expect } from 'vitest';
import {
  detectRefinementIntent,
  parseRefinementQuery,
} from './refinement-parser.js';
import { FilterType } from '../types/conversation.js';

describe('RefinementParser', () => {
  describe('detectRefinementIntent', () => {
    it('should detect explicit refinement patterns', () => {
      expect(detectRefinementIntent('show only 4+ stars')).toBe(true);
      expect(detectRefinementIntent('filter to open now')).toBe(true);
      expect(detectRefinementIntent('which are cheap')).toBe(true);
      expect(detectRefinementIntent('just the highly rated ones')).toBe(true);
    });

    it('should detect implicit refinements without location/business type', () => {
      expect(detectRefinementIntent('4+ stars')).toBe(true);
      expect(detectRefinementIntent('open now')).toBe(true);
      expect(detectRefinementIntent('cheap')).toBe(true);
    });

    it('should not detect refinement for new searches', () => {
      expect(detectRefinementIntent('find restaurants near me')).toBe(false);
      expect(detectRefinementIntent('coffee shops in San Francisco')).toBe(false);
    });
  });

  describe('parseRefinementQuery - rating', () => {
    it('should parse numeric rating patterns', () => {
      const result = parseRefinementQuery('show only 4+ stars');

      expect(result.isRefinement).toBe(true);
      expect(result.refinements).toHaveLength(1);
      expect(result.refinements[0].filterType).toBe(FilterType.RATING);
      expect((result.refinements[0] as any).threshold).toBe(4);
    });

    it('should parse "at least" rating pattern', () => {
      const result = parseRefinementQuery('show only at least 4.5 stars');

      expect(result.isRefinement).toBe(true);
      expect((result.refinements[0] as any).threshold).toBe(4.5);
    });

    it('should parse "highly rated" pattern', () => {
      const result = parseRefinementQuery('show only highly rated');

      expect(result.isRefinement).toBe(true);
      expect((result.refinements[0] as any).threshold).toBe(4.0);
    });
  });

  describe('parseRefinementQuery - temporal', () => {
    it('should parse "open now" pattern', () => {
      const result = parseRefinementQuery('which are open now');

      expect(result.isRefinement).toBe(true);
      expect(result.refinements[0].filterType).toBe(FilterType.OPEN_NOW);
      expect((result.refinements[0] as any).openNow).toBe(true);
    });

    it('should parse "24 hours" pattern', () => {
      const result = parseRefinementQuery('show only 24 hours');

      expect(result.isRefinement).toBe(true);
      expect(result.refinements[0].filterType).toBe(FilterType.OPEN_NOW);
    });
  });

  describe('parseRefinementQuery - price', () => {
    it('should parse dollar sign patterns', () => {
      const result1 = parseRefinementQuery('show only $');
      expect((result1.refinements[0] as any).maxLevel).toBe(1);

      const result2 = parseRefinementQuery('filter to $$$');
      expect((result2.refinements[0] as any).maxLevel).toBe(3);
    });

    it('should parse text price patterns', () => {
      const result1 = parseRefinementQuery('show only cheap');
      expect((result1.refinements[0] as any).maxLevel).toBe(1);

      const result2 = parseRefinementQuery('filter to expensive');
      expect((result2.refinements[0] as any).maxLevel).toBe(3);
    });
  });

  describe('parseRefinementQuery - distance', () => {
    it('should parse "within X miles" pattern', () => {
      const result = parseRefinementQuery('show only within 1 mile');

      expect(result.isRefinement).toBe(true);
      expect(result.refinements[0].filterType).toBe(FilterType.DISTANCE);
      expect((result.refinements[0] as any).maxDistance).toBeCloseTo(1609.34, 0);
    });

    it('should parse "nearby" pattern', () => {
      const result = parseRefinementQuery('show only nearby');

      expect(result.isRefinement).toBe(true);
      expect((result.refinements[0] as any).maxDistance).toBeCloseTo(3218.68, 0);
    });
  });

  describe('parseRefinementQuery - attributes', () => {
    it('should parse single attribute', () => {
      const result = parseRefinementQuery('with parking');

      expect(result.isRefinement).toBe(true);
      expect(result.refinements[0].filterType).toBe(FilterType.ATTRIBUTE);
      expect((result.refinements[0] as any).attributes).toContain('parking');
    });

    it('should parse multiple attributes', () => {
      const result = parseRefinementQuery('with wifi and outdoor seating');

      expect(result.isRefinement).toBe(true);
      expect((result.refinements[0] as any).attributes).toContain('wifi');
      expect((result.refinements[0] as any).attributes).toContain('outdoor seating');
    });
  });

  describe('parseRefinementQuery - multiple filters', () => {
    it('should parse multiple refinements in one query', () => {
      const result = parseRefinementQuery('show only 4+ stars and open now');

      expect(result.isRefinement).toBe(true);
      expect(result.refinements.length).toBeGreaterThanOrEqual(2);

      const filterTypes = result.refinements.map((r) => r.filterType);
      expect(filterTypes).toContain(FilterType.RATING);
      expect(filterTypes).toContain(FilterType.OPEN_NOW);
    });
  });
});
