/**
 * MCP Response Formatter Tests (Task 6.1)
 */

import { describe, it, expect } from 'vitest';
import { formatMCPResponse, formatErrorResponse } from './mcp-response-formatter.js';
import { QueryParseResult } from '../types/query-parser.js';

describe('MCP Response Formatting', () => {
  it('should format successful parse result as MCP response', () => {
    const parseResult: QueryParseResult = {
      businessType: ['coffee_shop'],
      location: {
        type: 'explicit',
        value: 'Seattle',
        confidence: 0.9,
      },
      filters: {
        rating: 4,
      },
      metadata: {
        originalQuery: 'find 4-star coffee shops in Seattle',
        timestamp: Date.now(),
      },
      confidence: 0.85,
    };

    const response = formatMCPResponse(parseResult);

    expect(response.isError).toBeFalsy();
    expect(response.content).toHaveLength(2);
    expect(response.content[0].type).toBe('text');
    expect(response.content[1].type).toBe('resource');
  });

  it('should include text summary in response', () => {
    const parseResult: QueryParseResult = {
      businessType: ['restaurant'],
      location: {
        type: 'relative',
        value: 'near me',
        confidence: 0.9,
      },
      filters: {},
      metadata: {
        originalQuery: 'restaurants near me',
        timestamp: Date.now(),
      },
      confidence: 0.9,
    };

    const response = formatMCPResponse(parseResult);
    const textContent = response.content.find((c) => c.type === 'text');

    expect(textContent?.text).toContain('restaurant');
  });

  it('should include structured data as JSON resource', () => {
    const parseResult: QueryParseResult = {
      businessType: ['cafe'],
      location: {
        type: 'explicit',
        value: 'Portland',
        confidence: 0.8,
      },
      filters: {},
      metadata: {
        originalQuery: 'cafes in Portland',
        timestamp: Date.now(),
      },
      confidence: 0.8,
    };

    const response = formatMCPResponse(parseResult);
    const resourceContent = response.content.find((c) => c.type === 'resource');

    expect(resourceContent?.resource?.mimeType).toBe('application/json');
    expect(resourceContent?.resource?.text).toBeTruthy();
  });

  it('should format error response with isError flag', () => {
    const error = new Error('Query cannot be empty');
    const response = formatErrorResponse(error);

    expect(response.isError).toBe(true);
    expect(response.content[0].type).toBe('text');
    expect(response.content[0].text).toBeTruthy();
  });

  it('should handle low confidence with clarifying question', () => {
    const parseResult: QueryParseResult = {
      businessType: ['business'],
      location: {
        type: 'relative',
        value: '',
        confidence: 0.0,
      },
      filters: {},
      metadata: {
        originalQuery: 'find something',
        timestamp: Date.now(),
      },
      confidence: 0.2,
    };

    const response = formatMCPResponse(parseResult);

    expect(response.isError).toBeFalsy();
    // Should include clarifying question in text
    expect(response.content[0].text).toBeTruthy();
  });
});
