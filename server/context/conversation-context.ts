/**
 * Conversation Context Management
 */

import { ConversationContext } from '../types/query-parser.js';

const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '1800000', 10); // 30 minutes default

/**
 * In-memory context storage
 */
const contextStore = new Map<
  string,
  {
    context: ConversationContext;
    lastAccessed: number;
  }
>();

/**
 * Get conversation context for a session
 */
export function getConversationContext(
  sessionId: string
): ConversationContext | null {
  const stored = contextStore.get(sessionId);

  if (!stored) {
    return null;
  }

  // Check if context is stale
  const now = Date.now();
  if (now - stored.lastAccessed > SESSION_TIMEOUT) {
    // Clear stale context
    contextStore.delete(sessionId);
    return null;
  }

  // Update last accessed time
  stored.lastAccessed = now;

  return stored.context;
}

/**
 * Update conversation context with new location mention
 */
export function updateConversationContext(
  sessionId: string,
  location: string
): void {
  const existing = contextStore.get(sessionId);

  if (existing) {
    // Add new location to beginning of array (most recent first)
    existing.context.previousLocations.unshift(location);

    // Keep only last 5 locations
    if (existing.context.previousLocations.length > 5) {
      existing.context.previousLocations = existing.context.previousLocations.slice(
        0,
        5
      );
    }

    existing.context.timestamp = Date.now();
    existing.lastAccessed = Date.now();
  } else {
    // Create new context
    contextStore.set(sessionId, {
      context: {
        sessionId,
        previousLocations: [location],
        timestamp: Date.now(),
      },
      lastAccessed: Date.now(),
    });
  }
}

/**
 * Resolve pronoun references using conversation context
 */
export function resolvePronounReference(
  query: string,
  sessionId?: string
): string | null {
  if (!sessionId) {
    return null;
  }

  const context = getConversationContext(sessionId);
  if (!context || context.previousLocations.length === 0) {
    return null;
  }

  const normalizedQuery = query.toLowerCase();

  // Check for pronoun references
  if (
    normalizedQuery.includes('there') ||
    normalizedQuery.includes('that place') ||
    normalizedQuery.includes('that area')
  ) {
    // Return most recent location
    return context.previousLocations[0];
  }

  return null;
}

/**
 * Clean up stale contexts (should be called periodically)
 */
export function cleanupStaleContexts(): void {
  const now = Date.now();

  for (const [sessionId, stored] of contextStore.entries()) {
    if (now - stored.lastAccessed > SESSION_TIMEOUT) {
      contextStore.delete(sessionId);
    }
  }
}

// Run cleanup every 10 minutes
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupStaleContexts, 600000);
}
