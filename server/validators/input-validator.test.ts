/**
 * Input Validation Tests (Task 5.1)
 */

import { describe, it, expect } from 'vitest';
import { validateQuery, sanitizeQuery } from './input-validator.js';

describe('Input Validation', () => {
  it('should reject empty query', () => {
    const error = validateQuery('');

    expect(error).not.toBeNull();
    expect(error?.code).toBe('EMPTY_QUERY');
  });

  it('should reject query exceeding length limit', () => {
    const longQuery = 'a'.repeat(501);
    const error = validateQuery(longQuery);

    expect(error).not.toBeNull();
    expect(error?.code).toBe('QUERY_TOO_LONG');
  });

  it('should accept valid query', () => {
    const error = validateQuery('find coffee shops near downtown');

    expect(error).toBeNull();
  });

  it('should sanitize HTML tags', () => {
    const sanitized = sanitizeQuery('<script>alert("xss")</script>find coffee');

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
    expect(sanitized).toContain('find coffee');
  });

  it('should reject malformed query with only special characters', () => {
    const error = validateQuery('!@#$%^&*()');

    expect(error).not.toBeNull();
    expect(error?.code).toBe('MALFORMED_QUERY');
  });
});
