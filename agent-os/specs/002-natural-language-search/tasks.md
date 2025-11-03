# Task Breakdown: Natural Language Search Processing

## Overview
**Feature:** Natural Language Search Processing (Spec 002)
**Total Task Groups:** 6
**Estimated Duration:** 6-8 days
**Stack:** Node.js, TypeScript, Express/Next.js, OpenAI Apps SDK (MCP), dotenv

**Purpose:** Build an MCP server backend handler that parses conversational search queries into structured parameters (business type, location, filters) for API consumption, enabling users to discover local businesses through natural language within ChatGPT.

## Task List

### Foundation & Type Definitions

#### Task Group 1: TypeScript Types and Interfaces
**Dependencies:** None
**Effort:** S (2-3 hours)

- [x] 1.0 Complete type definitions and interfaces
  - [x] 1.1 Create core type definitions file
    - Create `types/query-parser.ts` or `src/types/query-parser.ts`
    - Define `QueryParseResult` interface with fields: businessType, location, filters, metadata, confidence
    - Define `FilterParams` interface with optional fields: rating, priceLevel, openNow, distance, attributes
    - Define `ConversationContext` interface with sessionId, previousLocations, timestamp
    - Use string literal unions for business type enums (e.g., 'restaurant' | 'coffee_shop' | 'bar')
  - [x] 1.2 Create MCP protocol type definitions
    - Create `types/mcp.ts` file
    - Define `MCPToolDefinition` interface matching OpenAI Apps SDK schema
    - Define `MCPToolRequest` and `MCPToolResponse` interfaces
    - Define `MCPContentItem` type for response content array
    - Include error response types with isError flag
  - [x] 1.3 Define validation and error types
    - Create `AmbiguityDetection` interface with field, detectedValues, question properties
    - Create `ValidationError` type with code, message, field properties
    - Create `ConfidenceScore` type alias for number (0-1 range)
    - Export all types for reuse across modules
  - [x] 1.4 Create business type constants
    - Define `BUSINESS_TYPES` constant with canonical business categories
    - Define `BUSINESS_TYPE_SYNONYMS` map for colloquialism mapping
    - Define `FILTER_KEYWORDS` constant for filter extraction patterns
    - Export constants for parser logic use

**Acceptance Criteria:**
- All TypeScript interfaces properly defined with required and optional fields
- Type definitions align with MCP protocol specification
- Business type enums constrain values to known categories
- Types are exported and reusable across modules

---

### MCP Server Setup & Configuration

#### Task Group 2: MCP Server Infrastructure
**Dependencies:** Task Group 1
**Effort:** M (4-6 hours)

- [x] 2.0 Complete MCP server setup
  - [x] 2.1 Write 2-4 focused tests for MCP server setup
    - Test MCP server initializes with correct capabilities
    - Test list_tools returns search_businesses tool definition
    - Test environment variable loading on startup
    - Do NOT test exhaustive MCP protocol scenarios
  - [x] 2.2 Install and configure dependencies
    - Install OpenAI Apps SDK MCP packages
    - Install express or setup Next.js API routes
    - Install dotenv for environment configuration
    - Install TypeScript strict mode dependencies
    - Update package.json with correct versions
  - [x] 2.3 Create environment configuration
    - Create `.env.example` with placeholders: MCP_PORT, CONFIDENCE_THRESHOLD, SESSION_TIMEOUT
    - Load environment variables with dotenv at server startup
    - Validate required environment variables on startup and fail fast if missing
    - Add .env to .gitignore if not already present
  - [x] 2.4 Implement MCP server initialization
    - Create `server/mcp-server.ts` or `src/mcp/server.ts`
    - Initialize MCP server with Streamable HTTP transport
    - Configure CORS headers for ChatGPT client requests
    - Implement list_tools capability handler
    - Implement call_tool capability handler (route to parser)
    - Add error handling middleware
  - [x] 2.5 Define search_businesses tool schema
    - Create tool definition with name: "search_businesses"
    - Add description: "Use this when the user wants to find local businesses, restaurants, or services in a specific area"
    - Define JSON Schema for inputSchema with businessType (required string), location (required string), filters (optional object)
    - Add parameter descriptions for ChatGPT guidance
    - Include embedded resource metadata pointer for map display
  - [x] 2.6 Ensure MCP server setup tests pass
    - Run ONLY the 2-4 tests written in 2.1
    - Verify server starts without errors
    - Verify list_tools returns correct schema
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-4 tests written in 2.1 pass
- MCP server initializes successfully with required capabilities
- search_businesses tool properly registered with JSON Schema
- Environment variables loaded and validated
- CORS configured for ChatGPT integration

---

### Query Parsing Core Logic

#### Task Group 3: Business Type and Location Extraction
**Dependencies:** Task Groups 1-2
**Effort:** L (8-10 hours)

- [x] 3.0 Complete business type and location extraction
  - [x] 3.1 Write 4-6 focused tests for extraction logic
    - Test common business type extraction (e.g., "coffee shops" -> "coffee_shop")
    - Test synonym mapping (e.g., "mechanic" -> "auto_repair")
    - Test explicit location extraction (e.g., "Seattle" -> "Seattle")
    - Test relative location phrases (e.g., "near me" -> relative location flag)
    - Test distance specification parsing (e.g., "within 2 miles")
    - Do NOT test exhaustive edge cases or malformed queries yet
  - [x] 3.2 Implement business type extraction
    - Create `parsers/business-type-parser.ts`
    - Parse common business categories: restaurants, coffee shops, bars, grocery stores, banks, etc.
    - Handle cuisine-specific queries: Italian restaurants, sushi, pizza places, tacos
    - Parse service-based queries: hair salons, gyms, auto repair, dentists
    - Map synonyms using BUSINESS_TYPE_SYNONYMS constant
    - Default to "business" or "place" when category cannot be determined
    - Extract multiple business types for alternatives (e.g., "coffee shops or bakeries")
    - Return array of business types with confidence scores
  - [x] 3.3 Implement location extraction
    - Create `parsers/location-parser.ts`
    - Extract explicit locations: city names, neighborhoods, street addresses, zip codes
    - Recognize landmark references: "near Times Square", "downtown Seattle"
    - Handle relative location phrases: "near me", "nearby", "close by", "within walking distance"
    - Parse distance specifications: "within 2 miles", "less than 5km away", "10 minute drive"
    - Validate location strings are plausible (non-empty, contain location keywords)
    - Return location object with type (explicit/relative/landmark), value, distance
  - [x] 3.4 Implement location resolution logic
    - Create `parsers/location-resolver.ts`
    - Resolve ambiguous locations using conversation context (to be integrated later)
    - Track certainty level for extracted locations
    - Prepare location strings for geocoding API format
    - Handle missing location with ambiguity detection
  - [x] 3.5 Ensure extraction logic tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify business types correctly extracted and mapped
    - Verify locations parsed with correct type and value
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- Business types correctly extracted from natural language
- Synonyms properly mapped to canonical types
- Location extraction handles explicit, relative, and landmark references
- Confidence scores calculated for extractions

---

#### Task Group 4: Filter Parameter Parsing
**Dependencies:** Task Groups 1-3
**Effort:** M (4-6 hours)

- [x] 4.0 Complete filter parameter parsing
  - [x] 4.1 Write 3-5 focused tests for filter parsing
    - Test rating filter extraction (e.g., "4-star" -> rating: 4)
    - Test temporal filter parsing (e.g., "open now" -> openNow: true)
    - Test price level extraction (e.g., "cheap" -> priceLevel: 1)
    - Test attribute filter recognition (e.g., "with wifi" -> attributes: ['wifi'])
    - Do NOT test all possible filter combinations exhaustively
  - [x] 4.2 Implement rating filter extraction
    - Create `parsers/filter-parser.ts`
    - Parse rating patterns: "4-star", "highly rated", "top rated", "5 stars"
    - Map natural language to numeric rating values (1-5)
    - Handle "good reviews" as rating >= 4
  - [x] 4.3 Implement temporal filter parsing
    - Parse "open now", "open late", "24 hours", "open on Sunday"
    - Map to openNow boolean or specific time constraints
    - Extract hours if specified (e.g., "open after 8pm")
  - [x] 4.4 Implement price level filter extraction
    - Parse price indicators: "cheap", "affordable", "expensive", "fine dining"
    - Parse dollar signs: $, $$, $$$, $$$$ -> priceLevel 1-4
    - Default to no price filter if not specified
  - [x] 4.5 Implement attribute filter parsing
    - Parse attribute keywords: "wifi", "outdoor seating", "delivery", "wheelchair accessible"
    - Use FILTER_KEYWORDS constant for pattern matching
    - Return attributes as string array
  - [x] 4.6 Combine filters into structured object
    - Create filter aggregation logic that combines all filter types
    - Handle multiple filters in single query
    - Ensure type safety with FilterParams interface
    - Return confidence score for filter extraction
  - [x] 4.7 Ensure filter parsing tests pass
    - Run ONLY the 3-5 tests written in 4.1
    - Verify filters correctly extracted and typed
    - Verify multiple filters can be combined
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 4.1 pass
- Rating, temporal, price, and attribute filters correctly extracted
- Natural language mapped to structured filter object
- Multiple filters combined logically
- Type-safe filter structure matches FilterParams interface

---

### Input Validation & Error Handling

#### Task Group 5: Validation, Sanitization, and Error Handling
**Dependencies:** Task Groups 1-4
**Effort:** M (5-7 hours)

- [x] 5.0 Complete validation and error handling
  - [x] 5.1 Write 3-5 focused tests for validation
    - Test empty query rejection
    - Test query length limit enforcement (max 500 chars)
    - Test HTML tag sanitization
    - Test malformed query error response
    - Do NOT test exhaustive injection attack scenarios
  - [x] 5.2 Implement input validation
    - Create `validators/input-validator.ts`
    - Validate query string is non-empty
    - Enforce maximum length limit (500 characters)
    - Check for nonsensical or malformed queries
    - Return ValidationError for invalid inputs
  - [x] 5.3 Implement input sanitization
    - Strip HTML tags from query string
    - Escape special characters to prevent injection
    - Remove excessive whitespace and normalize input
    - Apply sanitization before parsing
  - [x] 5.4 Implement parameter validation
    - Validate extracted business types against allowlist
    - Validate location strings match expected format
    - Validate filter values within acceptable ranges (e.g., rating 1-5)
    - Use allowlist approach for business types and filter values
  - [x] 5.5 Implement ambiguity detection
    - Create `validators/ambiguity-detector.ts`
    - Detect missing critical parameters (no business type or location)
    - Identify ambiguous locations (e.g., "Portland" without state)
    - Generate clarifying questions for ambiguities
    - Set confidence scores below threshold (0.6) for uncertain parameters
    - Return AmbiguityDetection object with suggested follow-up
  - [x] 5.6 Implement error handling infrastructure
    - Create centralized error handler for parsing failures
    - Implement try-catch blocks around extraction logic
    - Return user-friendly error messages (e.g., "I couldn't understand the location")
    - Implement partial result returns when some parameters extracted
    - Provide fallback parsing strategies (keyword matching)
    - Log errors with context (query, stage, error type)
  - [x] 5.7 Implement graceful degradation
    - Return partial results with clear indication of missing parameters
    - Provide default fallback for minor ambiguities
    - Ensure server doesn't crash on malformed input
  - [x] 5.8 Ensure validation tests pass
    - Run ONLY the 3-5 tests written in 5.1
    - Verify invalid inputs properly rejected
    - Verify sanitization removes dangerous content
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 5.1 pass
- Input validation rejects empty, too long, or malformed queries
- Input sanitization prevents injection attacks
- Ambiguity detection identifies missing or unclear parameters
- Error handling provides user-friendly messages
- Partial results returned when possible
- Validation failures logged for monitoring

---

### Integration & Response Formatting

#### Task Group 6: MCP Integration and Response Formatting
**Dependencies:** Task Groups 1-5
**Effort:** M (5-6 hours)

- [x] 6.0 Complete MCP integration and response formatting
  - [x] 6.1 Write 4-6 focused tests for integration
    - Test full query parsing flow returns correct QueryParseResult
    - Test MCP call_tool handler routes to parser correctly
    - Test MCP response format matches protocol specification
    - Test error responses include isError flag
    - Test partial results handled correctly
    - Do NOT test all edge cases or external service integration
  - [x] 6.2 Implement main query parser orchestrator
    - Create `parsers/query-parser.ts` as main entry point
    - Orchestrate calls to business type, location, and filter parsers
    - Combine results into QueryParseResult object
    - Calculate overall confidence score from individual confidences
    - Include original query string for debugging
    - Add metadata with timestamp and parsing context
  - [x] 6.3 Implement conversation context integration
    - Create `context/conversation-context.ts`
    - Access ChatGPT conversation history (via MCP context if available)
    - Track mentioned locations across conversation turns
    - Support pronoun resolution ("near there" -> last mentioned location)
    - Maintain session state with conversation ID
    - Implement 30-minute timeout for stale context
    - Use in-memory storage (Map or lightweight cache), not database
  - [x] 6.4 Integrate parser with MCP call_tool handler
    - Update MCP server call_tool handler to route search_businesses tool
    - Pass tool arguments to query parser
    - Include conversation context in parser call
    - Handle parser errors and convert to MCP error responses
  - [x] 6.5 Implement MCP response formatting
    - Create `formatters/mcp-response-formatter.ts`
    - Format QueryParseResult into MCP content array
    - Include text/plain summary of parsed parameters
    - Add application/json content with structured data
    - Set isError flag for parsing failures
    - Include error messages in user-friendly format
    - Add embedded resource metadata for map display integration
  - [x] 6.6 Implement retry logic for transient failures
    - Add exponential backoff for context retrieval failures
    - Limit retries to 3 attempts maximum
    - Fall back to context-free parsing on persistent failure
  - [x] 6.7 Add comprehensive logging
    - Log successful parse operations with query and result summary
    - Log validation failures with reason
    - Log parsing errors with full context
    - Use structured logging format (JSON) for easier analysis
    - Do NOT log sensitive user data
  - [x] 6.8 Ensure integration tests pass
    - Run ONLY the 4-6 tests written in 6.1
    - Verify end-to-end parsing flow works correctly
    - Verify MCP responses properly formatted
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 6.1 pass
- Query parser orchestrates all extraction components
- Conversation context tracked and utilized
- MCP tool responses properly formatted per protocol
- Error responses include isError flag and helpful messages
- Retry logic handles transient failures
- Logging provides debugging visibility

---

### Testing & Quality Assurance

#### Task Group 7: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-6
**Effort:** S (3-4 hours)

- [x] 7.0 Review existing tests and fill critical gaps only
  - [x] 7.1 Review tests from Task Groups 1-6
    - Review 2-4 tests from MCP server setup (Task 2.1)
    - Review 4-6 tests from extraction logic (Task 3.1)
    - Review 3-5 tests from filter parsing (Task 4.1)
    - Review 3-5 tests from validation (Task 5.1)
    - Review 4-6 tests from integration (Task 6.1)
    - Total existing tests: approximately 16-26 tests
  - [x] 7.2 Analyze test coverage gaps for THIS feature only
    - Identify critical parsing workflows lacking test coverage
    - Focus ONLY on gaps related to natural language search parsing
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end parsing scenarios over unit test gaps
    - Check for missing tests on synonym mapping, multi-type extraction, context resolution
  - [x] 7.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on integration points between parsers
    - Test conversation context pronoun resolution if not covered
    - Test complex queries with multiple filters
    - Test ambiguity detection and clarification generation
    - Do NOT write comprehensive coverage for all edge cases
    - Skip performance tests and load testing
  - [x] 7.4 Run feature-specific tests only
    - Run ONLY tests related to natural language search parsing (from 2.1, 3.1, 4.1, 5.1, 6.1, and 7.3)
    - Expected total: approximately 26-36 tests maximum
    - Do NOT run entire application test suite
    - Verify critical parsing workflows pass
    - Ensure all test mocks are properly isolated (no external API calls)

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 26-36 tests total)
- Critical parsing workflows for this feature are covered
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on natural language search parsing requirements
- Test mocks prevent external dependencies

---

## Execution Order

Recommended implementation sequence:
1. **Foundation & Type Definitions** (Task Group 1) - Define all TypeScript types and interfaces first
2. **MCP Server Setup & Configuration** (Task Group 2) - Set up MCP infrastructure and tool registration
3. **Query Parsing Core Logic** (Task Group 3) - Implement business type and location extraction
4. **Filter Parameter Parsing** (Task Group 4) - Add filter extraction capabilities
5. **Input Validation & Error Handling** (Task Group 5) - Add validation, sanitization, and error handling
6. **Integration & Response Formatting** (Task Group 6) - Orchestrate components and format MCP responses
7. **Testing & Quality Assurance** (Task Group 7) - Review and fill critical test coverage gaps

---

## Integration Notes

**Dependencies on Other Specs:**
- Spec 001 (Map Display Foundation): This spec provides structured output that drives map centering and search parameters
- Spec 003 (Business Search API): Parsed parameters from this spec are consumed by the Business Search API for Places API queries

**Key Integration Points:**
- Parsed `location` string passed to geocoding service in Spec 003
- Parsed `businessType` determines which Places API endpoint to call in Spec 003
- Parsed `filters` object translated to Places API query parameters in Spec 003
- Conversation context enables "near that restaurant" queries to update map view in Spec 001

**MCP Protocol Compliance:**
- Follow OpenAI Apps SDK documentation for MCP server implementation
- Use Streamable HTTP transport as recommended for production
- Ensure JSON Schema in tool definition matches MCP specification
- Return responses as MCP content array with appropriate MIME types

---

## Notes

- **Test Philosophy**: Each task group writes minimal focused tests (2-6 tests) during development, with a final gap analysis adding up to 10 strategic tests maximum
- **Type Safety**: Strict TypeScript types enforce correctness at compile time, reducing runtime validation needs
- **Graceful Degradation**: System should return partial results rather than fail completely when some parameters can't be extracted
- **Conversation Context**: Lightweight in-memory context tracking, no database persistence required
- **Allowlist Approach**: Use allowlists for business types and filter values to prevent unexpected inputs
- **Logging**: Comprehensive structured logging for debugging and monitoring parsing accuracy
- **No External APIs**: This spec focuses on parsing only; actual geocoding and Places API calls are in Spec 003
