/**
 * MCP Response Formatter
 */

import { QueryParseResult } from '../types/query-parser.js';
import { MCPToolResponse, MCPErrorResponse } from '../types/mcp.js';
import { detectAmbiguities } from '../validators/ambiguity-detector.js';

/**
 * Format QueryParseResult into MCP response
 */
export function formatMCPResponse(result: QueryParseResult): MCPToolResponse {
  // Check for ambiguities
  const ambiguity = detectAmbiguities(result);

  // If there's a critical ambiguity, include it in response
  if (ambiguity && ambiguity.confidence < 0.6) {
    return {
      content: [
        {
          type: 'text',
          text: formatPartialResultWithQuestion(result, ambiguity.question),
        },
        {
          type: 'resource',
          resource: {
            uri: 'localhub://search-result',
            mimeType: 'application/json',
            text: JSON.stringify(result, null, 2),
          },
        },
      ],
      isError: false,
    };
  }

  // Format successful response
  const summary = formatResultSummary(result);

  return {
    content: [
      {
        type: 'text',
        text: summary,
      },
      {
        type: 'resource',
        resource: {
          uri: 'localhub://search-result',
          mimeType: 'application/json',
          text: JSON.stringify(result, null, 2),
        },
      },
    ],
    isError: false,
  };
}

/**
 * Format error response
 */
export function formatErrorResponse(error: Error): MCPErrorResponse {
  const message = getUserFriendlyErrorMessage(error);

  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
    isError: true,
  };
}

/**
 * Format result summary as text
 */
function formatResultSummary(result: QueryParseResult): string {
  const parts: string[] = [];

  // Business type
  if (result.businessType.length > 0) {
    const types = result.businessType.join(' or ');
    parts.push(`Looking for: ${types}`);
  }

  // Location
  if (result.location.value) {
    const locationType =
      result.location.type === 'relative' ? 'near you' : result.location.value;
    parts.push(`Location: ${locationType}`);
  }

  // Distance
  if (result.location.distance) {
    parts.push(
      `Distance: within ${result.location.distance.value} ${result.location.distance.unit}`
    );
  }

  // Filters
  if (result.filters.rating) {
    parts.push(`Rating: ${result.filters.rating}+ stars`);
  }

  if (result.filters.priceLevel) {
    const priceSymbols = '$'.repeat(result.filters.priceLevel);
    parts.push(`Price: ${priceSymbols}`);
  }

  if (result.filters.openNow) {
    parts.push('Filter: Open now');
  }

  if (result.filters.attributes && result.filters.attributes.length > 0) {
    parts.push(`Features: ${result.filters.attributes.join(', ')}`);
  }

  return parts.join('\n');
}

/**
 * Format partial result with clarifying question
 */
function formatPartialResultWithQuestion(
  result: QueryParseResult,
  question: string
): string {
  const summary = formatResultSummary(result);

  if (summary.length > 0) {
    return `I found:\n${summary}\n\nHowever, ${question}`;
  }

  return question;
}

/**
 * Convert error to user-friendly message
 */
function getUserFriendlyErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('empty')) {
    return "I couldn't understand your query. Please tell me what you're looking for.";
  }

  if (message.includes('too long')) {
    return 'Your query is too long. Please try to be more concise.';
  }

  if (message.includes('malformed')) {
    return "I couldn't understand that query. Could you rephrase it?";
  }

  if (message.includes('location')) {
    return "I couldn't understand the location. Could you specify where you want to search?";
  }

  // Generic error message
  return 'I encountered an error processing your request. Please try again.';
}
