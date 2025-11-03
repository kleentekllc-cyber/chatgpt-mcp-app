/**
 * MCP Context Metadata Helper
 * Adds context metadata to MCP tool responses for state synchronization
 */

import { ConversationSession, FilterState } from '../types/conversation.js';

/**
 * Context metadata included in MCP responses
 */
export interface MCPContextMetadata {
  contextReference: string;
  stateVersion: number;
  activeFilters: FilterState;
  resultCount: number;
  lastUpdated: number;
}

/**
 * State update metadata for delta updates
 */
export interface MCPStateUpdate {
  type: 'full' | 'delta';
  version: number;
  changes?: {
    filters?: FilterState;
    resultCount?: number;
  };
  snapshot: MCPContextMetadata;
}

/**
 * Create context metadata from session
 */
export function createContextMetadata(
  session: ConversationSession,
  resultCount: number
): MCPContextMetadata {
  return {
    contextReference: `conversation://sessions/${session.sessionId}`,
    stateVersion: session.stateVersion,
    activeFilters: session.currentFilters,
    resultCount,
    lastUpdated: session.lastQueryTimestamp,
  };
}

/**
 * Create state update metadata
 */
export function createStateUpdate(
  session: ConversationSession,
  resultCount: number,
  previousVersion?: number
): MCPStateUpdate {
  const metadata = createContextMetadata(session, resultCount);

  // If we have a previous version, create a delta update
  if (previousVersion && previousVersion < session.stateVersion) {
    return {
      type: 'delta',
      version: session.stateVersion,
      changes: {
        filters: session.currentFilters,
        resultCount,
      },
      snapshot: metadata,
    };
  }

  // Otherwise, create a full update
  return {
    type: 'full',
    version: session.stateVersion,
    snapshot: metadata,
  };
}

/**
 * Format state update for MCP response metadata field
 */
export function formatStateUpdateForResponse(
  stateUpdate: MCPStateUpdate
): Record<string, any> {
  return {
    stateUpdate: {
      type: stateUpdate.type,
      version: stateUpdate.version,
      ...(stateUpdate.changes && { changes: stateUpdate.changes }),
      snapshot: stateUpdate.snapshot,
    },
  };
}
