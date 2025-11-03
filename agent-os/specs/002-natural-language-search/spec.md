# Specification: Natural Language Search Processing

## Goal
Build an MCP server backend handler that parses conversational search queries into structured parameters (business type, location, filters) for API consumption, enabling users to discover local businesses through natural language within ChatGPT.

## User Stories
- As a user, I want to say "find coffee shops near downtown" and have the system understand my intent so that I get relevant business results without using structured forms
- As a user, I want to add context like "open now" or "4-star rated" so that results are filtered according to my preferences
- As a system, I want to extract location context from the conversation so that I can provide location-aware results even when users say "nearby" or reference previous locations

## Specific Requirements

**MCP Tool Definition for Business Search**
- Define an MCP tool named `search_businesses` that ChatGPT can invoke during conversation
- Include JSON Schema specifying required parameters: businessType (string), location (string), optional filters (object)
- Provide action-oriented description: "Use this when the user wants to find local businesses, restaurants, or services in a specific area"
- Include parameter descriptions that guide the model on extracting values from natural language
- Annotate tool metadata with embedded resource pointer for map display integration
- Register tool in MCP server's list_tools capability following MCP specification structure

**Business Type Extraction**
- Parse common business categories from natural language: restaurants, coffee shops, bars, grocery stores, banks, pharmacies, gas stations, hotels, etc.
- Support cuisine-specific queries: Italian restaurants, sushi, pizza places, tacos, Thai food
- Handle service-based queries: hair salons, gyms, auto repair, dentists, veterinarians
- Map synonyms and colloquialisms to canonical business types (e.g., "mechanic" to "auto repair", "vet" to "veterinarian")
- Default to generic "business" or "place" type when specific category cannot be determined
- Extract multiple business types when user specifies alternatives (e.g., "coffee shops or bakeries")

**Location Extraction and Resolution**
- Extract explicit locations: city names, neighborhoods, street addresses, zip codes
- Recognize landmark references: "near Times Square", "downtown Seattle", "by Central Park"
- Handle relative location phrases: "near me", "nearby", "close by", "within walking distance"
- Support distance specifications: "within 2 miles", "less than 5km away", "10 minute drive"
- Resolve ambiguous locations by analyzing conversation context and previous mentions
- Validate extracted location strings are plausible (not empty, contain location-relevant keywords)
- Prepare location strings for geocoding API consumption in downstream processing

**Filter Parameter Parsing**
- Extract rating filters: "4-star", "highly rated", "top rated", "5 stars", "good reviews"
- Parse temporal filters: "open now", "open late", "24 hours", "open on Sunday"
- Identify price level preferences: "cheap", "affordable", "expensive", "fine dining", dollar signs ($, $$, $$$)
- Recognize attribute filters: "with wifi", "outdoor seating", "delivery available", "wheelchair accessible"
- Support distance constraints: "within X miles/km", "walking distance", "close by"
- Map natural language filters to structured filter object with typed fields
- Handle multiple filters in a single query and combine them logically

**Structured Output Format**
- Return JSON object with fields: businessType, location, filters (rating, price, openNow, distance, attributes)
- Include confidence scores for each extracted parameter to indicate parsing certainty
- Provide original query string for debugging and fallback reference
- Include metadata field for conversation context (session ID, previous locations, query timestamp)
- Structure filters as nested object with optional fields, ensuring type safety for downstream APIs
- Follow consistent naming conventions: camelCase for field names, strings for location, enums for categories

**Ambiguity Detection and Clarification**
- Detect when critical parameters are missing (e.g., no business type or location specified)
- Identify ambiguous locations that could refer to multiple places (e.g., "Portland" without state)
- Generate clarifying questions as part of tool response when ambiguity is detected
- Return structured ambiguity object with field name, detected values, and suggested follow-up question
- Set confidence scores below threshold (e.g., 0.6) when parameters are uncertain
- Provide default fallback behavior for minor ambiguities to avoid blocking user flow

**Input Validation and Sanitization**
- Validate query string is non-empty and within reasonable length limits (max 500 characters)
- Sanitize input to prevent injection attacks: strip HTML tags, escape special characters
- Check for malformed or nonsensical queries and return error response with helpful message
- Validate extracted parameters match expected formats before returning structured output
- Implement allowlist approach for business types and filter values to prevent unexpected inputs
- Log validation failures for monitoring and improving parsing accuracy over time

**Error Handling and Graceful Degradation**
- Handle parsing failures gracefully with user-friendly error messages ("I couldn't understand the location")
- Implement try-catch blocks around extraction logic to prevent server crashes
- Return partial results when some parameters are successfully extracted but others fail
- Provide fallback parsing strategies when primary extraction methods fail (e.g., keyword matching)
- Log errors with context (query, parsing stage, error type) for debugging
- Implement retry logic with exponential backoff for transient failures in conversation context retrieval

**Conversation Context Integration**
- Access ChatGPT conversation history to extract location context from previous messages
- Track mentioned locations across conversation turns and prioritize recent mentions
- Support pronoun resolution: "find parking near there" references most recent location
- Maintain session state with conversation ID to link queries within same interaction
- Clear stale context after timeout period (e.g., 30 minutes) to prevent incorrect assumptions
- Store context in lightweight in-memory structure or session storage, not persistent database

**MCP Server Endpoint Implementation**
- Implement call_tool handler that receives tool name and arguments from ChatGPT
- Route `search_businesses` tool calls to query parsing logic
- Return MCP-compliant response with content array containing text and optional embedded resource
- Include isError flag and error message in response when parsing fails
- Set appropriate response metadata for ChatGPT to render results and embedded UI
- Implement streamable HTTP transport for MCP protocol as recommended by SDK
- Configure CORS headers to allow ChatGPT client requests

## Visual Design

No visual mockups provided for this backend-focused spec. The Natural Language Search Processing is a server-side feature that:
- Receives conversational input from ChatGPT via MCP protocol
- Processes and parses queries into structured format
- Returns structured JSON for consumption by Business Search API (spec 003)
- Indirectly drives the map display by providing parameters to search and marker placement logic

The output of this spec enables the user-facing map interface built in spec 001.

## Existing Code to Leverage

**OpenAI Apps SDK MCP Server Patterns**
- Follow SDK documentation for implementing MCP server with list_tools and call_tool capabilities
- Use Streamable HTTP transport as recommended over Server-Sent Events for production apps
- Structure tool metadata with name, description, inputSchema (JSON Schema), and optional embedded resources
- Return tool results as MCP content array with text/plain or application/json MIME types
- Reference SDK examples for error response formatting and status code handling

**Map Display Foundation (Spec 001) Integration Points**
- Parsed query output feeds into map center positioning and zoom level calculation
- Business type parameter drives which Places API search endpoint to call
- Location string is passed to geocoding service to get lat/lng coordinates for map centering
- Filter parameters are translated to Places API query parameters in spec 003
- Conversation context from this spec enables "near that restaurant" queries to update map view

**TypeScript Strict Type Safety Patterns**
- Define explicit interfaces for QueryParseResult with businessType, location, filters fields
- Type filter object fields with optional properties and specific types (rating: number, openNow: boolean)
- Use string literal unions for business type enums to constrain values to known categories
- Type MCP tool request and response objects according to protocol specification
- Export types for reuse in Business Search API integration (spec 003)

**Express.js or Next.js API Route Structure**
- Implement MCP endpoint as POST route: `/api/mcp/tools/call`
- Use middleware for JSON body parsing, CORS configuration, and request logging
- Structure route handler with async/await for parsing logic and context retrieval
- Return appropriate HTTP status codes: 200 for success, 400 for validation errors, 500 for server errors
- Apply error handling middleware to catch uncaught exceptions and format error responses

**Environment Configuration with dotenv**
- Store configuration values in .env file: API keys, service URLs, parsing confidence thresholds
- Load environment variables at server startup using dotenv package
- Access configuration via process.env with fallback defaults for optional values
- Never commit .env file to version control, provide .env.example template
- Validate required environment variables are present on server startup and fail fast if missing

## Out of Scope

- Actual geocoding or Places API calls to external services (handled in spec 003)
- Map rendering or marker placement UI logic (handled in spec 001)
- Persistent storage of search history or user preferences in database
- User authentication or session management beyond conversation context tracking
- Machine learning models for advanced NLP (rely on ChatGPT's understanding and simple pattern matching)
- Multi-language support beyond English queries
- Spelling correction or autocomplete suggestions for business types
- Complex geospatial calculations (distance, radius search) beyond basic parameter extraction
- Rate limiting or quota management for API endpoints (basic implementation only)
- Real-time search suggestions or autocomplete as user types
