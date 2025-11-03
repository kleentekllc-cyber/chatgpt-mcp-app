/**
 * Tests for Conversation Session Service
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createSession,
  getSession,
  updateSessionFilters,
  appendSearchTurn,
  resetSession,
  deleteSession,
  cleanupStaleSessions,
  clearAllSessions,
  getSessionStats,
} from './conversation-session-service.js';
import { BaseSearchParams, SearchTurn, FilterState } from '../types/conversation.js';

describe('ConversationSessionService', () => {
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

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createSession', () => {
    it('should create a new session with unique ID', () => {
      const session = createSession(mockBaseSearch);

      expect(session.sessionId).toBeDefined();
      expect(session.sessionId).toMatch(/^[0-9a-f-]{36}$/);
      expect(session.baseSearch).toEqual(mockBaseSearch);
      expect(session.currentFilters).toEqual({});
      expect(session.searchHistory).toEqual([]);
      expect(session.stateVersion).toBe(1);
    });

    it('should include userId if provided', () => {
      const session = createSession(mockBaseSearch, 'user123');

      expect(session.userId).toBe('user123');
    });
  });

  describe('getSession', () => {
    it('should retrieve existing session', () => {
      const created = createSession(mockBaseSearch);
      const retrieved = getSession(created.sessionId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.sessionId).toBe(created.sessionId);
    });

    it('should return null for non-existent session', () => {
      const retrieved = getSession('non-existent-id');

      expect(retrieved).toBeNull();
    });

    it('should return null for expired session', () => {
      vi.useFakeTimers();
      const created = createSession(mockBaseSearch);

      // Fast forward 31 minutes
      vi.advanceTimersByTime(31 * 60 * 1000);

      const retrieved = getSession(created.sessionId);

      expect(retrieved).toBeNull();
    });
  });

  describe('updateSessionFilters', () => {
    it('should update filters and increment version', () => {
      const session = createSession(mockBaseSearch);
      const filters: FilterState = { rating: 4.0, openNow: true };

      const updated = updateSessionFilters(session.sessionId, filters);

      expect(updated).toBeDefined();
      expect(updated?.currentFilters).toEqual(filters);
      expect(updated?.stateVersion).toBe(2);
    });

    it('should return null for non-existent session', () => {
      const updated = updateSessionFilters('non-existent', { rating: 4.0 });

      expect(updated).toBeNull();
    });
  });

  describe('appendSearchTurn', () => {
    it('should add turn to history', () => {
      const session = createSession(mockBaseSearch);
      const turn: SearchTurn = {
        queryText: 'show only 4+ stars',
        appliedFilters: { rating: 4.0 },
        resultCount: 5,
        timestamp: Date.now(),
        isRefinement: true,
      };

      const updated = appendSearchTurn(session.sessionId, turn);

      expect(updated?.searchHistory).toHaveLength(1);
      expect(updated?.searchHistory[0]).toEqual(turn);
    });

    it('should limit history to 10 most recent turns', () => {
      const session = createSession(mockBaseSearch);

      // Add 12 turns
      for (let i = 0; i < 12; i++) {
        const turn: SearchTurn = {
          queryText: `query ${i}`,
          appliedFilters: {},
          resultCount: 10,
          timestamp: Date.now(),
          isRefinement: true,
        };
        appendSearchTurn(session.sessionId, turn);
      }

      const retrieved = getSession(session.sessionId);

      expect(retrieved?.searchHistory).toHaveLength(10);
      expect(retrieved?.searchHistory[0].queryText).toBe('query 11');
    });
  });

  describe('resetSession', () => {
    it('should clear filters and add reset turn', () => {
      const session = createSession(mockBaseSearch);
      updateSessionFilters(session.sessionId, { rating: 4.0, openNow: true });

      const reset = resetSession(session.sessionId);

      expect(reset?.currentFilters).toEqual({});
      expect(reset?.searchHistory).toHaveLength(1);
      expect(reset?.searchHistory[0].queryText).toBe('show all');
    });
  });

  describe('cleanupStaleSessions', () => {
    it('should remove expired sessions', () => {
      vi.useFakeTimers();

      const session1 = createSession(mockBaseSearch);
      const session2 = createSession(mockBaseSearch);

      // Fast forward 31 minutes
      vi.advanceTimersByTime(31 * 60 * 1000);

      // Access session2 to refresh it
      getSession(session2.sessionId);

      // Run cleanup
      cleanupStaleSessions();

      // Session1 should be removed, session2 should remain
      expect(getSession(session1.sessionId)).toBeNull();
      expect(getSession(session2.sessionId)).toBeDefined();
    });
  });
});
