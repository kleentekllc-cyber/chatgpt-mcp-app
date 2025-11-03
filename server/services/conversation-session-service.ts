/**
 * Conversation Session Management Service
 * Handles session storage, CRUD operations, and timeout management
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ConversationSession,
  SessionStoreEntry,
  BaseSearchParams,
  FilterState,
  SearchTurn,
} from '../types/conversation.js';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_HISTORY_LENGTH = 10;
const MAX_RESULTS_PER_SESSION = 200;

/**
 * In-memory session storage
 * For production, this could be migrated to Redis for distributed deployment
 */
const sessionStore = new Map<string, SessionStoreEntry>();

/**
 * Create a new conversation session
 */
export function createSession(
  baseSearch: BaseSearchParams,
  userId?: string
): ConversationSession {
  const sessionId = uuidv4();
  const now = Date.now();

  // Limit base results to prevent memory bloat
  const limitedResults = baseSearch.baseResults.slice(0, MAX_RESULTS_PER_SESSION);

  const session: ConversationSession = {
    sessionId,
    userId,
    baseSearch: {
      ...baseSearch,
      baseResults: limitedResults,
    },
    currentFilters: {},
    searchHistory: [],
    lastQueryTimestamp: now,
    stateVersion: 1,
  };

  const entry: SessionStoreEntry = {
    session,
    lastAccessed: now,
  };

  sessionStore.set(sessionId, entry);

  console.log(
    `[Session] Created session ${sessionId} with ${limitedResults.length} base results`
  );

  return session;
}

/**
 * Get session by ID
 */
export function getSession(sessionId: string): ConversationSession | null {
  const entry = sessionStore.get(sessionId);

  if (!entry) {
    return null;
  }

  // Check if session is expired
  const now = Date.now();
  if (now - entry.lastAccessed > SESSION_TIMEOUT) {
    sessionStore.delete(sessionId);
    console.log(`[Session] Session ${sessionId} expired and removed`);
    return null;
  }

  // Update last accessed time
  entry.lastAccessed = now;
  sessionStore.set(sessionId, entry);

  return entry.session;
}

/**
 * Update session filters atomically
 */
export function updateSessionFilters(
  sessionId: string,
  filters: FilterState
): ConversationSession | null {
  const entry = sessionStore.get(sessionId);

  if (!entry) {
    console.warn(`[Session] Session ${sessionId} not found for filter update`);
    return null;
  }

  // Atomic update
  entry.session.currentFilters = { ...filters };
  entry.session.lastQueryTimestamp = Date.now();
  entry.session.stateVersion += 1;
  entry.lastAccessed = Date.now();

  sessionStore.set(sessionId, entry);

  console.log(
    `[Session] Updated filters for session ${sessionId}, version ${entry.session.stateVersion}`
  );

  return entry.session;
}

/**
 * Append search turn to history
 */
export function appendSearchTurn(
  sessionId: string,
  turn: SearchTurn
): ConversationSession | null {
  const entry = sessionStore.get(sessionId);

  if (!entry) {
    console.warn(`[Session] Session ${sessionId} not found for history update`);
    return null;
  }

  // Add turn to beginning (most recent first)
  entry.session.searchHistory.unshift(turn);

  // Maintain sliding window of last N turns
  if (entry.session.searchHistory.length > MAX_HISTORY_LENGTH) {
    entry.session.searchHistory = entry.session.searchHistory.slice(
      0,
      MAX_HISTORY_LENGTH
    );
  }

  entry.session.lastQueryTimestamp = Date.now();
  entry.session.stateVersion += 1;
  entry.lastAccessed = Date.now();

  sessionStore.set(sessionId, entry);

  console.log(
    `[Session] Added search turn to session ${sessionId}, history length: ${entry.session.searchHistory.length}`
  );

  return entry.session;
}

/**
 * Reset session filters (for "show all" commands)
 */
export function resetSession(
  sessionId: string
): ConversationSession | null {
  const entry = sessionStore.get(sessionId);

  if (!entry) {
    console.warn(`[Session] Session ${sessionId} not found for reset`);
    return null;
  }

  // Clear filters while preserving session and base search
  entry.session.currentFilters = {};
  entry.session.lastQueryTimestamp = Date.now();
  entry.session.stateVersion += 1;
  entry.lastAccessed = Date.now();

  // Add reset turn to history
  const resetTurn: SearchTurn = {
    queryText: 'show all',
    appliedFilters: {},
    resultCount: entry.session.baseSearch.baseResults.length,
    timestamp: Date.now(),
    isRefinement: true,
  };

  entry.session.searchHistory.unshift(resetTurn);
  if (entry.session.searchHistory.length > MAX_HISTORY_LENGTH) {
    entry.session.searchHistory = entry.session.searchHistory.slice(
      0,
      MAX_HISTORY_LENGTH
    );
  }

  sessionStore.set(sessionId, entry);

  console.log(`[Session] Reset filters for session ${sessionId}`);

  return entry.session;
}

/**
 * Delete session
 */
export function deleteSession(sessionId: string): boolean {
  const result = sessionStore.delete(sessionId);

  if (result) {
    console.log(`[Session] Deleted session ${sessionId}`);
  }

  return result;
}

/**
 * Clean up stale sessions (expired sessions)
 */
export function cleanupStaleSessions(): void {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [sessionId, entry] of sessionStore.entries()) {
    if (now - entry.lastAccessed > SESSION_TIMEOUT) {
      sessionStore.delete(sessionId);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`[Session] Cleaned up ${cleanedCount} stale sessions`);
  }
}

/**
 * Get session statistics (for monitoring)
 */
export function getSessionStats() {
  return {
    activeSessions: sessionStore.size,
    timeout: SESSION_TIMEOUT,
    maxHistoryLength: MAX_HISTORY_LENGTH,
    maxResultsPerSession: MAX_RESULTS_PER_SESSION,
  };
}

/**
 * Clear all sessions (for testing)
 */
export function clearAllSessions(): void {
  sessionStore.clear();
  console.log('[Session] Cleared all sessions');
}

// Run cleanup job every 5 minutes
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupStaleSessions, CLEANUP_INTERVAL);
  console.log('[Session] Session cleanup job started');
}
