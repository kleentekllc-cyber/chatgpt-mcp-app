/**
 * MCP Server Setup Tests (Task 2.1)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { SEARCH_BUSINESSES_TOOL } from './mcp-server.js';

describe('MCP Server Setup', () => {
  beforeAll(() => {
    // Ensure environment variables are set for testing
    process.env.MCP_PORT = '3001';
    process.env.CONFIDENCE_THRESHOLD = '0.6';
    process.env.SESSION_TIMEOUT = '1800000';
  });

  it('should define search_businesses tool with correct structure', () => {
    expect(SEARCH_BUSINESSES_TOOL).toBeDefined();
    expect(SEARCH_BUSINESSES_TOOL.name).toBe('search_businesses');
    expect(SEARCH_BUSINESSES_TOOL.description).toBeTruthy();
    expect(SEARCH_BUSINESSES_TOOL.inputSchema).toBeDefined();
  });

  it('should have correct input schema for search_businesses tool', () => {
    const schema = SEARCH_BUSINESSES_TOOL.inputSchema;

    expect(schema.type).toBe('object');
    expect(schema.properties).toBeDefined();
    expect(schema.properties?.query).toBeDefined();
    expect(schema.required).toContain('query');
  });

  it('should include embedded resource metadata', () => {
    expect(SEARCH_BUSINESSES_TOOL._meta).toBeDefined();
    expect(SEARCH_BUSINESSES_TOOL._meta?.embeddedResource).toBeDefined();
    expect(SEARCH_BUSINESSES_TOOL._meta?.embeddedResource?.uri).toBe(
      'localhub://map'
    );
  });

  it('should load environment variables correctly', () => {
    expect(process.env.MCP_PORT).toBe('3001');
    expect(process.env.CONFIDENCE_THRESHOLD).toBe('0.6');
    expect(process.env.SESSION_TIMEOUT).toBe('1800000');
  });
});
