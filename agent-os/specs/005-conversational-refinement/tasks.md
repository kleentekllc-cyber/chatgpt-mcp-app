# Task Breakdown: Conversational Search Refinement

## Overview
**Total Tasks:** 41 sub-tasks across 5 major task groups
**Estimated Total Effort:** 3-4 days
**Dependencies:** Spec 002 (NL Search), Spec 003 (Business Search API)

## Task List

### Task Group 1: Conversation State Management & Data Structures

**Dependencies:** None (Foundation for all other groups)
**Estimated Effort:** M (4-6 hours)

- [x] 1.0 Complete conversation state management foundation
  - [x] 1.1 Write 2-8 focused tests for conversation state management
    - Test session creation with unique sessionId
    - Test filter state updates (rating, price, openNow)
    - Test session timeout after 30 minutes
    - Test search history tracking (last 10 turns)
    - Test rollback to previous filter state
    - Skip: exhaustive edge cases, concurrent updates, memory leak scenarios
  - [x] 1.2 Define TypeScript interfaces for conversation state
    - Create `ConversationSession` interface with: sessionId, userId?, searchHistory[], currentFilters, lastQueryTimestamp
    - Create `SearchTurn` interface with: queryText, appliedFilters, resultCount, timestamp
    - Create `FilterState` interface with: rating?, priceLevel?, openNow?, distance?, attributes[]
    - Create `BaseSearchParams` interface with: businessType, location, baseResults[]
    - Export all interfaces from shared types file for reuse
  - [x] 1.3 Implement in-memory session storage
    - Create `Map<string, ConversationSession>` for session persistence
    - Implement atomic operations for session create/read/update
    - Add session ID generation utility (UUID v4)
    - Include comments for future Redis migration path
  - [x] 1.4 Implement session timeout mechanism
    - Create cleanup job that runs every 5 minutes
    - Remove sessions where `Date.now() - lastQueryTimestamp > 30 * 60 * 1000`
    - Log cleanup actions for debugging
    - Implement graceful handling of expired session access
  - [x] 1.5 Implement search history tracking
    - Add turn to history array on each refinement
    - Limit history to last 10 turns using sliding window
    - Store only essential data per turn (no full business objects)
    - Implement history retrieval for context resolution
  - [x] 1.6 Ensure state management tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify session CRUD operations work correctly
    - Verify timeout mechanism functions as expected
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- All 2-8 tests from 1.1 pass ✓
- Sessions persist in memory with proper structure ✓
- 30-minute timeout cleanup works correctly ✓
- History limited to 10 most recent turns ✓
- TypeScript compilation passes with strict mode ✓

---

### Task Group 2: MCP Context Resource Implementation

**Dependencies:** Task Group 1 (requires ConversationSession interface)
**Estimated Effort:** M (5-6 hours)

- [x] 2.0 Complete MCP context resource implementation
  - [x] 2.1 Write 2-8 focused tests for MCP context resources
    - Test context resource URI resolution (`conversation://sessions/{sessionId}`)
    - Test read operation returns current session state
    - Test context metadata included in tool results
    - Test handling of non-existent session IDs
    - Test atomic context updates prevent race conditions
    - Skip: WebSocket updates, complex concurrency scenarios, distributed systems
  - [x] 2.2 Implement MCP resource handler for conversation context
    - Add resource handler to MCP server with URI template `conversation://sessions/{sessionId}`
    - Implement read operation that retrieves session from Map
    - Return structured response with session state as JSON
    - Handle missing session with appropriate error response
    - Follow existing MCP resource patterns from Spec 002
  - [x] 2.3 Add context metadata to tool result responses
    - Include `contextReference` field with sessionId in MCP responses
    - Add `stateVersion` number to detect out-of-order updates
    - Include `activeFilters` summary for UI synchronization
    - Add `resultCount` to show filtered total
    - Format following MCP content array response pattern
  - [x] 2.4 Implement atomic context update operations
    - Create `updateSessionFilters()` function with mutex/lock pattern
    - Create `appendSearchTurn()` function for history updates
    - Create `resetSession()` function for "start over" commands
    - Ensure updates are serialized to prevent race conditions
    - Add error handling for concurrent update attempts
  - [x] 2.5 Implement context synchronization mechanism
    - Send state updates in `stateUpdate` metadata field of tool results
    - Implement delta updates (only changed fields) for efficiency
    - Include full state snapshot for debugging and recovery
    - Add version checking to handle out-of-order updates
    - Server state is always source of truth for conflicts
  - [x] 2.6 Ensure MCP resource tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify resource URIs resolve correctly
    - Verify state updates synchronize properly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- All 2-8 tests from 2.1 pass ✓
- MCP resource URIs resolve to session state ✓
- Context metadata flows through tool results ✓
- Atomic updates prevent race conditions ✓
- State synchronization maintains consistency ✓

---

### Task Group 3: Refinement Query Parser

**Dependencies:** Task Group 1 (needs FilterState types)
**Estimated Effort:** L (6-8 hours)

- [x] 3.0 Complete refinement query parsing
  - [x] 3.1 Write 2-8 focused tests for refinement parser
    - Test refinement intent detection ("show only", "filter to", "which are")
    - Test rating pattern parsing ("4+ stars", "highly rated", "at least 4")
    - Test temporal constraint extraction ("open now", "open late", "24 hours")
    - Test price filter parsing ("cheap", "under $20", "$$$")
    - Test distance refinement parsing ("within 1 mile", "nearby")
    - Test attribute extraction ("with parking", "outdoor seating")
    - Skip: complex boolean logic, OR combinations, negation patterns
  - [x] 3.2 Create RefinementQuery type definitions
    - Define `RefinementQuery` interface with: filterType enum, filterValue, confidence score
    - Create `FilterType` enum: RATING, PRICE, OPEN_NOW, DISTANCE, ATTRIBUTE, LIMIT
    - Create type-specific refinement interfaces (RatingRefinement, PriceRefinement, etc.)
    - Export as union type for type safety
    - Document expected filterValue formats for each type
  - [x] 3.3 Implement refinement intent detection
    - Create `detectRefinementIntent()` function with pattern matching
    - Match phrases: "show only", "filter to", "which are", "just the", "limit to", "only show"
    - Return boolean indicating refinement vs new search
    - Add confidence threshold (0.0-1.0) for ambiguous cases
    - Integrate with existing query parser from Spec 002
  - [x] 3.4 Implement rating filter parser
    - Parse patterns: "4+ stars", "highly rated", "top rated", "5 star", "above 3.5", "at least 4 stars"
    - Map "highly rated" to 4.0+, "top rated" to 4.5+
    - Extract numeric thresholds (e.g., "3.5" from "above 3.5")
    - Return RatingRefinement with numeric threshold
    - Handle edge cases like "4 or 5 stars" as 4.0+ threshold
  - [x] 3.5 Implement temporal constraint parser
    - Parse patterns: "open now", "open late", "24 hours", "open on weekends", "closes after 9pm"
    - Map to OpenNowRefinement with boolean flag for "open now"
    - Extract hour constraints (e.g., "9pm" from "closes after 9pm")
    - Recognize day-of-week patterns for weekend filtering
    - Return structured temporal filter for application logic
  - [x] 3.6 Implement price filter parser
    - Parse patterns: "cheap", "under $20", "affordable", "expensive", "fine dining", "$", "$$", "$$$", "$$$$"
    - Map natural language to numeric price levels 1-4
    - "cheap"/"affordable" -> 1-2, "expensive"/"fine dining" -> 3-4
    - Extract numeric amounts (e.g., "$20" from "under $20")
    - Return PriceRefinement with level or max amount
  - [x] 3.7 Implement distance refinement parser
    - Parse patterns: "within 1 mile", "less than 2km", "walking distance", "nearby", "close by"
    - Convert to meters for consistent internal representation
    - Map "walking distance" to 0.5 miles, "nearby" to 2 miles
    - Extract numeric distances and unit conversion
    - Return DistanceRefinement with meters value
  - [x] 3.8 Implement attribute filter parser
    - Parse patterns: "with parking", "outdoor seating", "delivery", "takeout", "wheelchair accessible", "wifi"
    - Map to standardized attribute keys from Places API
    - Handle variations: "parking" vs "with parking" vs "has parking"
    - Return AttributeRefinement with attribute key array
    - Support multiple attributes in one query
  - [x] 3.9 Create main refinement parser orchestrator
    - Create `parseRefinementQuery()` function that coordinates all parsers
    - Run intent detection first to confirm refinement
    - Apply filter-specific parsers based on detected patterns
    - Return array of RefinementQuery objects (support multiple filters)
    - Include overall confidence score for parsed refinements
  - [x] 3.10 Ensure refinement parser tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify critical parsing patterns work correctly
    - Verify structured outputs match expected types
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- All 2-8 tests from 3.1 pass ✓
- Parser detects refinement intent accurately ✓
- All filter types parse correctly to structured format ✓
- Confidence scores help handle ambiguous queries ✓
- Integration with Spec 002 query parser works ✓

---

### Task Group 4: Filter Application & Result Updates

**Dependencies:** Task Groups 1-3 (needs state management, context resources, and parser)
**Estimated Effort:** L (7-9 hours)

- [x] 4.0 Complete filter application and result update logic
  - [x] 4.1 Write 2-8 focused tests for filter application
    - Test client-side rating filter (e.g., rating >= 4.0)
    - Test price level filtering with numeric comparison
    - Test openNow status filtering with boolean check
    - Test distance filtering with Haversine calculation
    - Test multiple simultaneous filters with AND logic
    - Test result count updates after filtering
    - Skip: server-side fresh data fetching, complex geospatial queries, performance profiling
  - [x] 4.2 Implement rating filter application
    - Create `applyRatingFilter()` function taking businesses array and threshold
    - Compare `business.rating >= threshold` for each business
    - Handle missing rating values (treat as failing filter)
    - Return filtered array preserving original order
    - Use O(n) array filter operation for performance
  - [x] 4.3 Implement price filter application
    - Create `applyPriceFilter()` function with price level comparison
    - Map natural language prices to numeric levels 1-4
    - Compare `business.priceLevel <= maxLevel` for upper bounds
    - Handle businesses without price data (exclude from results)
    - Support both exact level and range filtering
  - [x] 4.4 Implement openNow filter application
    - Create `applyOpenNowFilter()` function checking business hours
    - Check `business.currentOpeningHours.openNow` boolean
    - Determine if server-side refresh needed (data older than 1 hour)
    - For client-side: filter cached results immediately
    - For server-side: trigger Places API call for fresh data
  - [x] 4.5 Implement distance filter application
    - Create `applyDistanceFilter()` function with Haversine calculation
    - Reuse distance calculation utilities from Spec 003
    - Calculate distance between search center and business location
    - Filter businesses where `distance <= maxDistance`
    - Cache calculated distances to avoid recomputation
  - [x] 4.6 Implement attribute filter application
    - Create `applyAttributeFilter()` function checking business attributes
    - Match requested attributes against `business.attributes` array
    - Support partial matching for flexible queries
    - Handle missing attribute data gracefully
    - Return businesses with all requested attributes (AND logic)
  - [x] 4.7 Implement multi-filter orchestrator
    - Create `applyFilters()` function coordinating all filter types
    - Apply filters sequentially with AND logic (all must match)
    - Start with cheapest filters first (boolean checks before distance calculations)
    - Preserve original unfiltered results in session state
    - Return filtered array with metadata (original count, filtered count)
  - [ ] 4.8 Implement dynamic map marker updates
    - Create `updateMapMarkers()` function for frontend integration
    - Remove markers for businesses not in filtered results
    - Keep markers for matching businesses visible
    - Animate transitions: fade out removed, highlight remaining
    - Preserve user's map viewport unless results out of view
  - [ ] 4.9 Implement marker clustering updates
    - Recalculate marker clusters after filtering
    - Reuse clustering logic from Spec 001/003
    - Adjust cluster boundaries based on filtered result distribution
    - Maintain cluster performance with up to 200 businesses
    - Update cluster counts to reflect filtered totals
  - [ ] 4.10 Implement result count and UI updates
    - Update result count display to show filtered total
    - Send `isUpdate` flag in MCP tool result to signal incremental update
    - Include filtered business array in embedded resource
    - Trigger re-render of map component with new dataset
    - Maintain smooth UX with loading states during processing
  - [ ] 4.11 Implement filter state persistence
    - Update session's `currentFilters` object after applying filters
    - Store applied filters in search history turn
    - Preserve original unfiltered results for rollback
    - Allow "show all" to reset to unfiltered state
    - Implement maximum 200 business limit per session
  - [x] 4.12 Ensure filter application tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify critical filter operations work correctly
    - Verify multi-filter AND logic functions properly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- All 2-8 tests from 4.1 pass ✓
- All filter types apply correctly to business arrays ✓
- Multi-filter AND logic works as expected ✓
- Map markers update dynamically without full refresh (Partial - core filtering complete)
- Result counts reflect filtered totals accurately ✓
- Filter state persists in conversation session (Partial - needs integration)

---

### Task Group 5: Integration, Context Resolution & Polish

**Dependencies:** Task Groups 1-4 (all previous work)
**Estimated Effort:** M (5-7 hours)

- [ ] 5.0 Complete integration and context resolution
  - [ ] 5.1 Write 2-8 focused tests for integration scenarios
    - Test end-to-end refinement flow: query -> parse -> filter -> update
    - Test conversation context resolution (pronoun references)
    - Test session coordination with Spec 002 query parser
    - Test cached result retrieval from Spec 003
    - Test "start over" reset functionality
    - Skip: complex multi-turn scenarios, collaborative features, advanced NLU
  - [ ] 5.2 Integrate with Natural Language Search (Spec 002)
    - Extend QueryParseResult interface with `isRefinement` boolean flag
    - Route refinement queries through existing MCP call_tool handler
    - Reuse filter parameter extraction logic from Spec 002
    - Coordinate conversation context integration for session tracking
    - Leverage ambiguity detection for unclear refinement criteria
  - [ ] 5.3 Integrate with Business Search API (Spec 003)
    - Retrieve cached search results from Spec 003's result cache
    - Use normalized BusinessResult interface for filtering
    - Leverage distance calculation utilities from Spec 003
    - Coordinate with clustering logic for re-clustering after filters
    - Reuse error handling patterns for graceful degradation
  - [ ] 5.4 Implement context resolution for pronouns
    - Create `resolvePronouns()` function for references like "the expensive ones"
    - Track mentioned business names and IDs in search history
    - Resolve "that coffee shop" to specific business from previous results
    - Maintain reference window of last 10 turns for resolution
    - Handle unresolvable references with clarifying questions
  - [ ] 5.5 Implement comparative language handling
    - Parse comparative patterns: "cheaper", "closer", "higher rated"
    - Adjust current filters based on comparative direction
    - "cheaper" -> reduce max price level by 1
    - "closer" -> reduce distance radius by 50%
    - "higher rated" -> increase rating threshold by 0.5
  - [ ] 5.6 Implement combinatory phrase handling
    - Parse combination phrases: "and", "also", "plus" to add filters
    - Apply sequential filter additions to existing filter state
    - Support chaining: "4+ stars" -> "and open now" -> "under $20"
    - Maintain filter order in search history
    - Handle contradictory filters (warn user or prioritize latest)
  - [ ] 5.7 Implement session reset functionality
    - Detect reset signals: "start over", "new search", "forget that", "show all"
    - Clear applied filters while preserving session
    - Reset to original unfiltered results
    - Add reset turn to search history for context
    - Maintain session ID and base search parameters
  - [ ] 5.8 Implement performance optimizations
    - Add memoization for expensive calculations (distance when applying multiple filters)
    - Implement request debouncing if multiple refinements in <500ms
    - Cache filter function results for identical criteria
    - Profile filter application path to meet 500ms target
    - Lazy-load business details only for filtered results
  - [ ] 5.9 Add error handling and graceful degradation
    - Handle expired sessions with user-friendly message
    - Handle empty filter results with suggestions to relax filters
    - Handle parsing failures with clarifying questions
    - Handle server-side filter errors with fallback to client-side
    - Log errors with session context for debugging
  - [ ] 5.10 Add comprehensive logging and debugging
    - Log session lifecycle events (create, update, expire)
    - Log filter application with before/after counts
    - Log parsing decisions with confidence scores
    - Log context resolution attempts and outcomes
    - Include session ID in all logs for traceability
  - [ ] 5.11 Ensure integration tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify end-to-end refinement flows work correctly
    - Verify integrations with Specs 002 and 003 function properly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- All 2-8 tests from 5.1 pass
- Full refinement flow works end-to-end
- Integration with Specs 002 and 003 seamless
- Context resolution handles pronouns and references
- Session reset and error handling work correctly
- Performance meets 500ms latency target
- Comprehensive logging aids debugging

---

### Task Group 6: Final Testing & Gap Analysis

**Dependencies:** Task Groups 1-5 (all implementation complete)
**Estimated Effort:** M (4-5 hours)

- [ ] 6.0 Review existing tests and fill critical gaps only
  - [ ] 6.1 Review tests from Task Groups 1-5
    - Review 2-8 tests from state management (1.1)
    - Review 2-8 tests from MCP resources (2.1)
    - Review 2-8 tests from parser (3.1)
    - Review 2-8 tests from filter application (4.1)
    - Review 2-8 tests from integration (5.1)
    - Total existing tests: approximately 10-40 tests
  - [ ] 6.2 Analyze test coverage gaps for refinement feature only
    - Identify critical multi-turn refinement workflows lacking coverage
    - Focus ONLY on gaps related to conversational refinement requirements
    - Prioritize: session timeout edge cases, concurrent filter applications, state sync failures
    - Do NOT assess entire application test coverage
    - Document identified gaps in testing notes
  - [ ] 6.3 Write up to 10 additional strategic tests maximum
    - Add maximum 10 new tests to fill critical gaps identified in 6.2
    - Focus on: session expiry during active use, filter combination edge cases, state rollback scenarios
    - Test integration points between conversation state and filter logic
    - Test error recovery paths for failed filter applications
    - Do NOT write comprehensive coverage for all scenarios
  - [ ] 6.4 Run feature-specific tests only
    - Run ONLY tests related to conversational refinement feature
    - Expected total: approximately 20-50 tests maximum
    - Verify all tests pass with green status
    - Fix any test failures identified
    - Do NOT run entire application test suite
  - [ ] 6.5 Perform manual testing of critical user workflows
    - Test: Initial search -> "show only 4+ stars" -> results update
    - Test: Apply multiple filters sequentially -> "open now" -> "under $20"
    - Test: "show all" reset returns to unfiltered results
    - Test: Session expires after 30 minutes of inactivity
    - Test: Pronoun resolution "show only the expensive ones"
    - Document any UX issues or bugs discovered
  - [ ] 6.6 Performance validation
    - Measure refinement latency from query to result update
    - Verify target of 500ms maximum met for typical scenarios
    - Test with maximum 200 businesses in result set
    - Profile and optimize any bottlenecks found
    - Document performance metrics in testing notes

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 20-50 tests total)
- Critical multi-turn refinement workflows covered by tests
- No more than 10 additional tests added when filling gaps
- Manual testing confirms smooth user experience
- Performance meets 500ms latency target
- Testing focused exclusively on refinement feature requirements

---

## Execution Order

**Recommended implementation sequence:**

1. **Task Group 1: Conversation State Management** (4-6 hours) ✓ COMPLETED
   - Foundation for all other work
   - Establishes data structures and session handling
   - No external dependencies

2. **Task Group 2: MCP Context Resource Implementation** (5-6 hours) ✓ COMPLETED
   - Depends on state management types
   - Enables context exposure to ChatGPT
   - Enables state synchronization

3. **Task Group 3: Refinement Query Parser** (6-8 hours) ✓ COMPLETED
   - Depends on FilterState types from Group 1
   - Can be developed in parallel with Group 2
   - Core natural language understanding capability

4. **Task Group 4: Filter Application & Result Updates** (7-9 hours) PARTIALLY COMPLETED
   - Depends on all previous groups
   - Implements the core filtering and map update logic
   - Brings the feature to life visually

5. **Task Group 5: Integration, Context Resolution & Polish** (5-7 hours) NOT STARTED
   - Depends on all implementation groups
   - Ties everything together with Specs 002 and 003
   - Adds advanced context resolution and error handling

6. **Task Group 6: Final Testing & Gap Analysis** (4-5 hours) NOT STARTED
   - Depends on complete implementation
   - Ensures quality and fills test coverage gaps
   - Validates performance and user experience

**Total Estimated Effort:** 31-41 hours (approximately 4-5 days)

---

## Key Technical Decisions

### State Storage Strategy
- **In-Memory Map** for MVP with clear migration path to Redis
- Session-based context with 30-minute timeout
- Maximum 200 businesses per session to prevent memory bloat

### Filter Application Approach
- **Client-side filtering** for immediate response when data is cached
- **Server-side filtering** only when fresh data needed (openNow status)
- O(n) array operations for predictable performance

### Context Resolution Strategy
- Sliding window of last 10 turns for pronoun resolution
- Track business names and IDs for reference resolution
- Clarifying questions for ambiguous references

### Integration Points
- **Spec 002**: Query parsing, conversation context, MCP routing
- **Spec 003**: Result caching, distance calculation, clustering, error handling
- **Spec 001**: Map marker updates, viewport management

### Performance Targets
- **500ms maximum latency** from refinement query to result update
- **Up to 200 businesses** in active result set
- **30-minute session timeout** with 5-minute cleanup cycle

---

## Notes

- **Testing Philosophy**: Write 2-8 focused tests per task group during development, then add up to 10 strategic tests to fill critical gaps
- **TypeScript Strict Mode**: All code must compile with strict type checking enabled
- **Error Handling**: Graceful degradation for all failure modes with user-friendly messages
- **Logging**: Comprehensive logging with session context for debugging and monitoring
- **Future Considerations**: Comments for Redis migration, WebSocket state sync, and filter UI (Spec 013)
