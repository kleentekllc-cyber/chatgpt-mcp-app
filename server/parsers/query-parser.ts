/**
 * Main Query Parser Orchestrator
 */

import { QueryParseResult } from '../types/query-parser.js';
import { extractBusinessType } from './business-type-parser.js';
import { extractLocation } from './location-parser.js';
import { extractFilters } from './filter-parser.js';
import { validateQuery, sanitizeQuery } from '../validators/input-validator.js';
import {
  getConversationContext,
  updateConversationContext,
  resolvePronounReference,
} from '../context/conversation-context.js';

/**
 * Parse natural language query into structured parameters
 */
export async function parseQuery(
  query: string,
  sessionId?: string
): Promise<QueryParseResult> {
  // Validate input
  const validationError = validateQuery(query);
  if (validationError) {
    throw new Error(validationError.message);
  }

  // Sanitize input
  const sanitizedQuery = sanitizeQuery(query);

  // Check for pronoun references in conversation context
  let effectiveQuery = sanitizedQuery;
  if (sessionId) {
    const resolvedLocation = resolvePronounReference(sanitizedQuery, sessionId);
    if (resolvedLocation) {
      // Replace pronoun with actual location
      effectiveQuery = sanitizedQuery.replace(
        /\b(there|that place|that area)\b/gi,
        resolvedLocation
      );
    }
  }

  // Extract business type
  const businessTypeResult = extractBusinessType(effectiveQuery);

  // Extract location
  const locationResult = extractLocation(effectiveQuery);

  // Extract filters
  const { filters, confidence: filterConfidence } = extractFilters(
    effectiveQuery
  );

  // Calculate overall confidence
  const confidenceScores = [
    businessTypeResult.confidence,
    locationResult.confidence,
  ];

  if (filterConfidence > 0) {
    confidenceScores.push(filterConfidence);
  }

  const overallConfidence =
    confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;

  // Update conversation context with location
  if (sessionId && locationResult.value && locationResult.confidence > 0.6) {
    updateConversationContext(sessionId, locationResult.value);
  }

  // Build result
  const result: QueryParseResult = {
    businessType: businessTypeResult.types,
    location: locationResult,
    filters,
    metadata: {
      originalQuery: query,
      timestamp: Date.now(),
      sessionId,
    },
    confidence: overallConfidence,
  };

  return result;
}

/**
 * Parse query with retry logic for transient failures
 */
export async function parseQueryWithRetry(
  query: string,
  sessionId?: string,
  maxRetries: number = 3
): Promise<QueryParseResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await parseQuery(query, sessionId);
    } catch (error) {
      lastError = error as Error;

      // Only retry on transient errors (context retrieval failures)
      if (!isTransientError(error)) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // If all retries failed, fall back to context-free parsing
  console.warn(
    'All retries failed, falling back to context-free parsing:',
    lastError
  );
  return parseQuery(query, undefined);
}

/**
 * Check if error is transient and retryable
 */
function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('connection')
    );
  }
  return false;
}
