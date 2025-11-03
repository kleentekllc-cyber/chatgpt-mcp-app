/**
 * Tests for MCP Context Resource Handler
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getConversationContextResource,
  handleResourceRead,
} from './mcp-context-resource.js';
import {
  createSession,
  updateSessionFilters,
  clearAllSessions,
} from '../services/conversation-session-service.js';
import { BaseSearchParams } from '../types/conversation.js';

describe('MCPContextResource', () => {
  const mockBaseSearch: BaseSearchParams = {
    businessType: ['restaurant'],
    location: 'San Francisco, CA',
    searchCenter: { lat: 37.7749, lng: -122.4194 },
    baseResults: [
      {
        place_id: '1',
        name: 'Test Restaurant',
        location: { lat: 37.7749, lng: -122.4194 },
        rating: 4.5,
        address: { city: 'San Francisco' },
        formatted_address: '123 Test St',
        photos: [],
        business_status: 'OPERATIONAL',
      },
    ],
  };

  beforeEach(() => {
    clearAllSessions();
  });

  describe('getConversationContextResource', () => {
    it('should retrieve context resource for valid session ID', () => {
      const session = createSession(mockBaseSearch);
      const uri = `conversation://sessions/${session.sessionId}`;

      const resource = getConversationContextResource(uri);

      expect(resource).toBeDefined();
      expect(resource?.contents).toHaveLength(1);
      expect(resource?.contents[0].uri).toBe(uri);
      expect(resource?.contents[0].mimeType).toBe('application/json');
    });

    it('should return null for invalid URI format', () => {
      const resource = getConversationContextResource('invalid://uri');

      expect(resource).toBeNull();
    });

    it('should return null for non-existent session', () => {
      const uri = 'conversation://sessions/non-existent-id';
      const resource = getConversationContextResource(uri);

      expect(resource).toBeNull();
    });

    it('should include session state in resource text', () => {
      const session = createSession(mockBaseSearch);
      updateSessionFilters(session.sessionId, { rating: 4.0, openNow: true });

      const uri = `conversation://sessions/${session.sessionId}`;
      const resource = getConversationContextResource(uri);

      expect(resource).toBeDefined();
      const data = JSON.parse(resource!.contents[0].text);

      expect(data.sessionId).toBe(session.sessionId);
      expect(data.stateVersion).toBe(2); // Initial + 1 update
      expect(data.currentFilters).toEqual({ rating: 4.0, openNow: true });
    });
  });

  describe('handleResourceRead', () => {
    it('should handle conversation resource URIs', () => {
      const session = createSession(mockBaseSearch);
      const uri = `conversation://sessions/${session.sessionId}`;

      const resource = handleResourceRead(uri);

      expect(resource).toBeDefined();
      expect(resource?.contents[0].uri).toBe(uri);
    });

    it('should return null for unrecognized URIs', () => {
      const resource = handleResourceRead('unknown://resource');

      expect(resource).toBeNull();
    });
  });
});
