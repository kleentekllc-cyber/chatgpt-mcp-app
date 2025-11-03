# Specification: Conversational Search Refinement

## Goal
Enable users to iteratively refine local business searches through natural language follow-up queries while maintaining conversation context, allowing dynamic filtering by ratings, hours, price, distance, and attributes without losing previous search state or requiring complete re-searches.

## User Stories
- As a user, I want to say "show only 4+ stars" after my initial search so that I can filter results to highly-rated businesses without starting over
- As a user, I want to ask "which are open now" so that the system filters current results based on real-time business hours
- As a user, I want the system to remember my previous search context so that I can combine multiple refinements like "under $20 and open now" sequentially

## Specific Requirements

**Conversation State Management Schema**
- Define TypeScript interface for conversation session with sessionId, userId (optional), searchHistory array, currentFilters object, lastQueryTimestamp
- Track original search parameters (businessType, location, baseResults array) separately from applied refinements
- Store active filter state with fields: rating, priceLevel, openNow, distance, attributes array
- Include metadata for each search turn: queryText, appliedFilters, resultCount, timestamp
- Implement 30-minute session timeout with automatic cleanup to prevent stale context
- Structure state to support rollback to previous filter states if user requests "undo" or "show all again"

**MCP Context Resource Implementation**
- Expose conversation context as MCP resource at URI template `conversation://sessions/{sessionId}`
- Implement context persistence using in-memory Map with sessionId as key, or Redis for distributed deployment
- Define read operation for retrieving current conversation state in MCP resource handler
- Return context metadata in tool result responses to keep ChatGPT model synchronized with backend state
- Include context reference in embedded resource metadata so UI can access session data
- Implement context updates as atomic operations to prevent race conditions during concurrent refinements

**Refinement Query Parser**
- Detect refinement intent from phrases: "show only", "filter to", "which are", "just the", "limit to", "only show"
- Parse rating filters from patterns: "4+ stars", "highly rated", "top rated", "5 star", "above 3.5", "at least 4 stars"
- Extract temporal constraints: "open now", "open late", "24 hours", "open on weekends", "closes after 9pm"
- Identify price filters from: "cheap", "under $20", "affordable", "expensive", "fine dining", "$", "$$", "$$$", "$$$$"
- Recognize distance refinements: "within 1 mile", "less than 2km", "walking distance", "nearby", "close by"
- Parse attribute filters: "with parking", "outdoor seating", "delivery", "takeout", "wheelchair accessible", "wifi"
- Return structured RefinementQuery object with filterType enum, filterValue, and confidence score

**Filter Application Logic**
- Implement client-side filtering for immediate response when all required data is already cached
- Apply server-side filtering when refinement requires fresh data (e.g., openNow status needs real-time check)
- Filter rating by comparing business.rating against threshold (e.g., >= 4.0 for "4+ stars")
- Filter price by mapping natural language to numeric price levels 1-4 and comparing against business.priceLevel
- Filter openNow by checking business.currentOpeningHours.openNow boolean from Places API
- Calculate distance filters using Haversine formula between search center and business location
- Support multiple filters simultaneously with AND logic (all conditions must be true)
- Preserve original unfiltered results in session state for ability to relax filters later

**Dynamic Result Update Mechanism**
- Update map markers by removing non-matching businesses and keeping matching ones visible
- Recalculate marker clustering after filter application to adjust cluster boundaries
- Update result count displayed in UI to reflect filtered total
- Animate marker transitions (fade out removed, highlight remaining) for visual continuity
- Recenter map viewport only if filtered results are outside current view, otherwise maintain user's map position
- Send updated business array to frontend via MCP tool result with isUpdate flag
- Trigger re-render of embedded resource component with new filtered dataset

**Context Window and Memory Management**
- Maintain reference to last 10 search turns in conversation history for context resolution
- Store only essential business data in context: place_id, name, location, rating, price, openNow status
- Limit stored results to maximum 200 businesses per session to prevent memory bloat
- Implement pronoun resolution: "show only the expensive ones" refers to businesses in current result set
- Track mentioned business names and IDs so "near that coffee shop" can reference previous results
- Clear context on explicit user reset signals: "start over", "new search", "forget that"
- Implement sliding window eviction for search history older than 30 minutes

**State Synchronization Between Backend and Frontend**
- Emit state change events through MCP tool results with stateUpdate metadata field
- Include version number in state updates to detect and handle out-of-order updates
- Send delta updates (only changed filters) rather than full state when possible for efficiency
- Implement optimistic UI updates on frontend with server confirmation pattern
- Handle state conflicts by treating server state as source of truth and reconciling UI
- Provide state snapshot in each tool result response for debugging and recovery
- Use WebSocket or Server-Sent Events for real-time state sync if latency becomes issue

**Natural Language Understanding for Refinement Patterns**
- Map "show me" to display/filter action, not new search intent
- Recognize comparative language: "cheaper", "closer", "higher rated" to adjust current filters
- Parse combinatory phrases: "and", "also", "plus" to add filters, "or" to create alternative filter branches
- Detect negation patterns: "not expensive", "exclude fast food", "without parking requirements"
- Handle implicit refinements: "what about vegetarian options" implies filter by attribute/cuisine
- Understand temporal context: "now" references current time, "tonight" references evening hours
- Recognize quantity modifiers: "top 5", "best 3", "first 10" to limit result count

**Integration with Natural Language Search (Spec 002)**
- Consume conversation context from spec 002's session tracking to maintain location and business type
- Extend QueryParseResult interface with isRefinement boolean flag to distinguish refinements from new searches
- Reuse filter parameter extraction logic from spec 002 and enhance with refinement-specific patterns
- Pass refinement queries through same MCP call_tool handler with refinement-specific routing
- Leverage spec 002's ambiguity detection to ask clarifying questions for unclear refinement criteria
- Coordinate with spec 002's conversation context integration to resolve pronoun references

**Integration with Business Search API (Spec 003)**
- Retrieve cached search results from spec 003's result cache when applying client-side filters
- Trigger fresh Places API call only when refinement requires updated data (openNow, real-time availability)
- Use spec 003's normalized business data structure for consistent filtering logic
- Leverage spec 003's distance calculation utilities for distance-based refinements
- Coordinate with spec 003's clustering logic to re-cluster markers after filter application
- Reuse spec 003's error handling patterns for graceful degradation when filtering fails

**Performance Optimization**
- Target 500ms maximum latency from refinement query to updated results display
- Implement filter operations as O(n) array filters for predictable performance with up to 200 businesses
- Use memoization for expensive calculations like distance when applying multiple filters sequentially
- Lazy-load business details only for filtered results to reduce data transfer
- Implement request debouncing if user rapidly submits multiple refinements
- Cache filter function results for identical filter criteria to avoid recomputation
- Profile and optimize bottlenecks in filter application and state update paths

## Visual Design

No visual mockups provided for this primarily backend-focused conversational feature. The Conversational Search Refinement operates through:
- Natural language input in ChatGPT composer (existing UI)
- Dynamic updates to map markers and results count without full page refresh
- Smooth transitions as filtered results appear/disappear on map
- Optional visual indicator showing active filters (to be designed in future filter UI spec)
- Maintains existing map display from spec 001 with incremental result updates

## Existing Code to Leverage

**Natural Language Search Processing (Spec 002) - Query Parsing Foundation**
- Reuse filter parameter parsing logic for rating, price, openNow, distance, and attribute extraction
- Extend existing MCP tool handler to detect refinement vs new search based on conversation context
- Leverage conversation context integration patterns for tracking session state across turns
- Build on structured output format (QueryParseResult) by adding RefinementQuery variant
- Apply same input validation and sanitization patterns to refinement queries for security

**Business Search API Integration (Spec 003) - Result Filtering and Caching**
- Use cached search results from spec 003's in-memory cache as base dataset for client-side filtering
- Leverage normalized business data structure (BusinessResult interface) for consistent filter operations
- Reuse distance calculation utilities (Haversine formula) for distance-based refinements
- Apply same marker update and clustering patterns to re-render filtered results on map
- Follow spec 003's error handling and graceful degradation patterns for filter failures

**Map Display Foundation (Spec 001) - Dynamic Marker Updates**
- Use existing marker rendering system to remove/update markers based on filter results
- Leverage marker clustering from spec 001 to re-cluster after filtering without full map reset
- Apply existing state management patterns (useState, useEffect) for managing filtered results in React
- Reuse map instance reference and viewport control to maintain user's view during refinements
- Follow component lifecycle patterns for cleanup when conversation session expires

**MCP Server Patterns from Spec 002 - Context Resource Implementation**
- Follow MCP resource URI template pattern for exposing conversation context as readable resource
- Use existing call_tool handler structure to route refinement queries to filtering logic
- Apply MCP content array response format to return filtered results with embedded resource metadata
- Reuse session tracking approach for linking conversation turns to same context
- Implement error response formatting following established MCP conventions

**TypeScript Strict Type Safety**
- Define ConversationSession interface extending existing session types from spec 002
- Create RefinementQuery type as union of filter-specific query types (RatingRefinement, PriceRefinement, etc.)
- Type filter application functions with strong input/output contracts for predictable behavior
- Export FilterState interface for reuse in future filter UI components (spec 013)
- Apply strict null checking for optional filter fields and business properties

## Out of Scope

- Visual filter UI controls or chips showing active filters (covered in spec 013)
- Saved search filters or filter presets for reuse across sessions
- Undo/redo functionality for filter operations beyond simple "show all" reset
- Advanced filter combinations with OR logic or complex boolean expressions
- Filter suggestions or autocomplete for filter values
- Machine learning-based filter recommendation based on user behavior
- Persistent storage of conversation history across user sessions in database
- Multi-user conversation context or collaborative search refinement
- Real-time collaboration features where multiple users refine same search
- Complex geospatial filters like polygon boundaries or multi-point radius searches
- Historical trend analysis of user refinement patterns for analytics
- A/B testing framework for refinement query parsing strategies
