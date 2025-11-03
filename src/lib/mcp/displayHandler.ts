/**
 * MCP Display Handler
 * Manages communication with ChatGPT using Model Context Protocol (MCP)
 * Handles display mode instructions and conversational prompts
 */

import type { MapCenter } from '../../types/google-maps';

export interface MCPDisplayMessage {
  type: 'display_mode' | 'map_update' | 'search_query';
  payload: any;
}

export interface MapUpdatePayload {
  center?: MapCenter;
  zoom?: number;
  searchQuery?: string;
}

/**
 * Parse MCP message from ChatGPT
 * Note: This is a foundation implementation. Full MCP protocol integration
 * will be implemented based on OpenAI Apps SDK specifications.
 *
 * @param message - Raw MCP message
 * @returns Parsed MCP display message
 */
export function parseMCPMessage(message: string): MCPDisplayMessage | null {
  try {
    const parsed = JSON.parse(message);

    if (!parsed.type) {
      console.warn('Invalid MCP message: missing type field');
      return null;
    }

    return parsed as MCPDisplayMessage;
  } catch (error) {
    console.error('Failed to parse MCP message:', error);
    return null;
  }
}

/**
 * Handle display mode instruction from ChatGPT
 * Configures the map to display in fullscreen mode
 *
 * @param message - MCP display mode message
 */
export function handleDisplayMode(message: MCPDisplayMessage): void {
  if (message.type !== 'display_mode') {
    return;
  }

  // Display mode handling logic
  // This will be expanded based on OpenAI Apps SDK requirements
  console.log('Display mode activated:', message.payload);
}

/**
 * Handle map update from conversational prompt
 * Updates map center and zoom based on user's conversation with ChatGPT
 *
 * @param message - MCP map update message
 * @returns Map update payload or null
 */
export function handleMapUpdate(message: MCPDisplayMessage): MapUpdatePayload | null {
  if (message.type !== 'map_update') {
    return null;
  }

  const payload = message.payload as MapUpdatePayload;

  // Validate payload
  if (payload.center && (!payload.center.lat || !payload.center.lng)) {
    console.warn('Invalid map center in MCP message');
    return null;
  }

  if (payload.zoom && (payload.zoom < 1 || payload.zoom > 20)) {
    console.warn('Invalid zoom level in MCP message');
    return null;
  }

  return payload;
}

/**
 * Send map state to ChatGPT via MCP
 * Note: This is a placeholder for future implementation
 *
 * @param center - Current map center
 * @param zoom - Current zoom level
 */
export function sendMapStateToChatGPT(center: MapCenter, zoom: number): void {
  // Placeholder for MCP state synchronization
  // Will be implemented based on OpenAI Apps SDK patterns
  console.log('Map state update:', { center, zoom });
}

/**
 * Initialize MCP communication channel
 * Sets up listeners for messages from ChatGPT
 *
 * @param onMessage - Callback for handling incoming MCP messages
 * @returns Cleanup function to remove listeners
 */
export function initializeMCPChannel(
  onMessage: (message: MCPDisplayMessage) => void
): () => void {
  // Placeholder for MCP channel initialization
  // Will be implemented with OpenAI Apps SDK integration

  const handleMessage = (event: MessageEvent) => {
    const message = parseMCPMessage(event.data);
    if (message) {
      onMessage(message);
    }
  };

  // Listen for postMessage events (example implementation)
  window.addEventListener('message', handleMessage);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}
