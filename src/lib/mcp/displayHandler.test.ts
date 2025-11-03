/**
 * Tests for MCP Display Handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseMCPMessage,
  handleMapUpdate,
  initializeMCPChannel,
} from './displayHandler';

describe('MCP Display Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseMCPMessage', () => {
    it('should parse valid MCP message', () => {
      // Arrange
      const messageStr = JSON.stringify({
        type: 'display_mode',
        payload: { mode: 'fullscreen' },
      });

      // Act
      const result = parseMCPMessage(messageStr);

      // Assert
      expect(result).toEqual({
        type: 'display_mode',
        payload: { mode: 'fullscreen' },
      });
    });

    it('should return null for invalid JSON', () => {
      // Arrange
      const invalidMessage = 'not valid json';

      // Act
      const result = parseMCPMessage(invalidMessage);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for message without type', () => {
      // Arrange
      const messageStr = JSON.stringify({ payload: { data: 'test' } });

      // Act
      const result = parseMCPMessage(messageStr);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('handleMapUpdate', () => {
    it('should handle valid map update message', () => {
      // Arrange
      const message = {
        type: 'map_update' as const,
        payload: {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 14,
        },
      };

      // Act
      const result = handleMapUpdate(message);

      // Assert
      expect(result).toEqual({
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 14,
      });
    });

    it('should return null for non-map-update message', () => {
      // Arrange
      const message = {
        type: 'display_mode' as const,
        payload: {},
      };

      // Act
      const result = handleMapUpdate(message);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for invalid zoom level', () => {
      // Arrange
      const message = {
        type: 'map_update' as const,
        payload: {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 25, // Invalid zoom level
        },
      };

      // Act
      const result = handleMapUpdate(message);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('initializeMCPChannel', () => {
    let cleanup: (() => void) | undefined;

    afterEach(() => {
      // Cleanup after each test to prevent memory leaks
      if (cleanup) {
        cleanup();
        cleanup = undefined;
      }
    });

    it('should setup message listener and cleanup properly', async () => {
      // Arrange
      const onMessage = vi.fn();
      cleanup = initializeMCPChannel(onMessage);

      const validMessage = {
        type: 'display_mode',
        payload: { mode: 'fullscreen' },
      };

      // Act
      window.postMessage(JSON.stringify(validMessage), '*');

      // Wait for async message processing
      await new Promise(resolve => setTimeout(resolve, 50));

      // Assert
      expect(onMessage).toHaveBeenCalled();

      // Cleanup
      cleanup();
      cleanup = undefined;
    });
  });
});
