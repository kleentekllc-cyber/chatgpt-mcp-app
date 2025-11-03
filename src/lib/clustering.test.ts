/**
 * Clustering Tests
 * Task Group 5: Clustering Tests
 */

import { describe, it, expect } from 'vitest';
import {
  shouldActivateClustering,
  getClusterSizeCategory,
  DEFAULT_CLUSTER_CONFIG,
} from './clustering';

describe('Clustering', () => {
  describe('Task 5.1: Clustering Tests', () => {
    it('should activate clustering when 50+ businesses in results', () => {
      expect(shouldActivateClustering(49)).toBe(false);
      expect(shouldActivateClustering(50)).toBe(true);
      expect(shouldActivateClustering(100)).toBe(true);
    });

    it('should not activate clustering for < 50 businesses', () => {
      expect(shouldActivateClustering(10)).toBe(false);
      expect(shouldActivateClustering(25)).toBe(false);
      expect(shouldActivateClustering(49)).toBe(false);
    });

    it('should categorize cluster size by business count', () => {
      expect(getClusterSizeCategory(5)).toBe(0); // Small (< 10)
      expect(getClusterSizeCategory(15)).toBe(1); // Medium (10-29)
      expect(getClusterSizeCategory(35)).toBe(2); // Large (30+)
    });

    it('should have sensible default cluster config', () => {
      expect(DEFAULT_CLUSTER_CONFIG.activateThreshold).toBe(50);
      expect(DEFAULT_CLUSTER_CONFIG.maxBusinesses).toBe(200);
      expect(DEFAULT_CLUSTER_CONFIG.gridSize).toBeGreaterThan(0);
    });
  });
});
