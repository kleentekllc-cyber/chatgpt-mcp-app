/**
 * MCP Context Resource Handler
 * Exposes conversation context as MCP resources for state synchronization
 */

import { getSession } from '../services/conversation-session-service.js';
import { ConversationSession } from '../types/conversation.js';

/**
 * MCP Resource for conversation context
 */
export interface MCPContextResource {
  uri: string;
  mimeType: string;
  text: string;
}

/**
 * MCP Resource Read Result
 */
export interface MCPResourceReadResult {
  contents: MCPContextResource[];
}

/**
 * Get conversation context resource by session ID
 * URI format: conversation://sessions/{sessionId}
 */
export function getConversationContextResource(
  uri: string
): MCPResourceReadResult | null {
  // Parse session ID from URI
  const match = uri.match(/^conversation:\/\/sessions\/([a-f0-9-]+)$/);

  if (!match) {
    console.warn(`[MCP Resource] Invalid URI format: ${uri}`);
    return null;
  }

  const sessionId = match[1];

  // Retrieve session
  const session = getSession(sessionId);

  if (!session) {
    console.warn(`[MCP Resource] Session not found: ${sessionId}`);
    return null;
  }

  // Format session as JSON resource
  const resource: MCPContextResource = {
    uri,
    mimeType: 'application/json',
    text: JSON.stringify(formatSessionForResource(session), null, 2),
  };

  console.log(`[MCP Resource] Retrieved context for session ${sessionId}`);

  return {
    contents: [resource],
  };
}

/**
 * Format session data for MCP resource exposure
 * Includes only essential data to keep payload size manageable
 */
function formatSessionForResource(session: ConversationSession) {
  return {
    sessionId: session.sessionId,
    stateVersion: session.stateVersion,
    lastQueryTimestamp: session.lastQueryTimestamp,
    baseSearch: {
      businessType: session.baseSearch.businessType,
      location: session.baseSearch.location,
      searchCenter: session.baseSearch.searchCenter,
      resultCount: session.baseSearch.baseResults.length,
    },
    currentFilters: session.currentFilters,
    searchHistory: session.searchHistory.map((turn) => ({
      queryText: turn.queryText,
      appliedFilters: turn.appliedFilters,
      resultCount: turn.resultCount,
      timestamp: turn.timestamp,
      isRefinement: turn.isRefinement,
    })),
  };
}

/**
 * List available conversation resources
 * Returns URIs for all active sessions
 */
export function listConversationResources(): string[] {
  // In a production system, this would query active sessions
  // For now, return empty array as sessions are accessed directly by ID
  return [];
}

/**
 * Handle MCP resource read requests
 */
export function handleResourceRead(uri: string): MCPResourceReadResult | null {
  if (uri.startsWith('conversation://sessions/')) {
    return getConversationContextResource(uri);
  }

  console.warn(`[MCP Resource] Unrecognized resource URI: ${uri}`);
  return null;
}
