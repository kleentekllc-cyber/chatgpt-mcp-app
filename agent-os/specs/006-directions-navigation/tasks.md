# Task Breakdown: Directions and Navigation

## Overview
Total Tasks: 58 sub-tasks across 6 task groups
Estimated Effort: 3-4 weeks
Dependencies: Spec 001 (Map Display), Spec 004 (Business Cards)

## Task List

### Backend API Layer

#### Task Group 1: Google Directions API Integration & Backend Endpoint
**Dependencies:** None (requires existing backend from Spec 001)
**Effort:** L (Large)

- [x] 1.0 Complete backend Directions API integration
  - [x] 1.1 Write 2-8 focused tests for backend directions endpoint
    - Test successful route calculation with valid origin/destination
    - Test validation errors for invalid coordinates
    - Test transport mode parameter handling (DRIVING, WALKING, TRANSIT, BICYCLING)
    - Test error handling for API failures
    - Test cache hit/miss behavior
    - Mock Google Directions API responses
  - [x] 1.2 Set up Google Directions API configuration
    - Add Directions API key to environment variables (reuse from Spec 001 if same key)
    - Configure API client with 5-second timeout
    - Set up request parameters for essential fields: overview_polyline, legs (steps, distance, duration), warnings
    - Configure to request up to 3 alternative routes
  - [x] 1.3 Create POST `/api/directions` endpoint
    - Accept JSON payload: { origin: {lat, lng}, destination: {lat, lng}, travelMode: enum }
    - Follow RESTful conventions from @agent-os/standards/backend/api.md
    - Apply CORS configuration for ChatGPT client domain
    - Implement request logging for monitoring and debugging
  - [x] 1.4 Implement request validation
    - Validate origin as valid lat/lng coordinates or place ID
    - Validate destination as valid lat/lng coordinates or place ID
    - Validate travelMode enum: DRIVING, WALKING, TRANSIT, BICYCLING
    - Return 400 status with clear error messages for validation failures
  - [x] 1.5 Implement Google Directions API proxy call
    - Make server-side request to Google Directions API to protect API key
    - Pass validated origin, destination, and travelMode parameters
    - Include mode-specific parameters: avoid highways for driving, prefer bike paths for cycling
    - Handle transit-specific parameters: departure times when applicable
  - [x] 1.6 Transform API response to normalized route structure
    - Parse API response into frontend-friendly format
    - Extract polyline, steps array, distance, duration, warnings
    - Include alternative routes if available (up to 3)
    - Add metadata: cache status, request timestamp
  - [x] 1.7 Implement response handling and status codes
    - Return 200 with route data for successful requests
    - Return 404 when no route found with message: "No route available for this mode"
    - Return 400 for validation errors with specific field errors
    - Return 500 for server/API errors with generic user message
    - Log errors with full context while showing simplified messages to client
  - [x] 1.8 Implement route caching strategy
    - Create in-memory cache using Map with composite key: `{origin}-{destination}-{travelMode}`
    - Set cache TTL: 15 minutes for non-transit routes, 5 minutes for transit routes
    - Implement LRU eviction when cache exceeds 100 entries
    - Skip cache for routes with real-time traffic data
    - Include cache hit/miss in response metadata
  - [x] 1.9 Add error handling for edge cases
    - Handle identical origin and destination with clear message
    - Implement retry logic with exponential backoff for transient API failures
    - Handle API rate limiting with appropriate error response
    - Log all errors with context for debugging
  - [x] 1.10 Ensure backend endpoint tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify all transport modes work correctly
    - Verify caching behavior
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- POST `/api/directions` endpoint accepts origin, destination, travelMode
- All four transport modes (DRIVING, WALKING, TRANSIT, BICYCLING) return valid routes
- Validation errors return 400 with clear messages
- API key remains hidden from client (server-side proxy)
- Route caching works with appropriate TTL
- The 2-8 tests written in 1.1 pass

---

### Geolocation & Location Services

#### Task Group 2: User Location Detection
**Dependencies:** None
**Effort:** M (Medium)

- [x] 2.0 Complete user location detection system
  - [x] 2.1 Write 2-8 focused tests for geolocation functionality
    - Test successful location detection
    - Test geolocation permission denial handling
    - Test geolocation timeout (10 seconds)
    - Test fallback to manual location entry
    - Test location caching (5-minute TTL)
    - Mock browser Geolocation API
  - [x] 2.2 Implement browser Geolocation API integration
    - Use `navigator.geolocation.getCurrentPosition`
    - Enable high accuracy mode: `enableHighAccuracy: true`
    - Set timeout to 10 seconds: `timeout: 10000`
    - Handle permission states: prompt, granted, denied
  - [x] 2.3 Create clear permission request UI
    - Display user-facing prompt explaining why location is needed
    - Example: "We need your location to provide directions to nearby businesses"
    - Show before triggering browser's native permission dialog
    - Follow accessibility standards from @agent-os/standards/frontend/accessibility.md
  - [x] 2.4 Implement location caching
    - Cache detected location in sessionStorage
    - Set cache TTL of 5 minutes to reduce repeated permission requests
    - Include timestamp with cached location
    - Validate cached location hasn't expired before use
  - [x] 2.5 Create manual location input fallback component
    - Build form with address/location text input
    - Use Google Places Autocomplete API for suggestions (reuse from Spec 003)
    - Convert address to lat/lng coordinates via Places API
    - Show fallback automatically if geolocation permission denied or unavailable
  - [x] 2.6 Implement geolocation error handling
    - Handle PERMISSION_DENIED: show manual input fallback
    - Handle POSITION_UNAVAILABLE: show error message with manual fallback
    - Handle TIMEOUT: retry once, then show manual fallback
    - Use last known location from map interactions if available (from Spec 001)
    - Display user-friendly error messages per @agent-os/standards/global/error-handling.md
  - [x] 2.7 Create location state management
    - Use React useState/useContext to manage current user location
    - Track location detection status: idle, loading, success, error
    - Provide location to DirectionsPanel and route calculation components
    - Update location when user manually changes it
  - [x] 2.8 Ensure geolocation tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify permission handling works correctly
    - Verify caching and fallback work
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- Browser geolocation successfully detects user location with high accuracy
- Clear permission prompt explains why location is needed
- Location cached for 5 minutes to reduce repeated requests
- Manual location input fallback works when geolocation denied/unavailable
- User-friendly error messages for all geolocation failure scenarios
- The 2-8 tests written in 2.1 pass

---

### Route Rendering & Map Integration

#### Task Group 3: Route Polyline Rendering on Map
**Dependencies:** Task Group 1 (backend API)
**Effort:** M (Medium)

- [x] 3.0 Complete route polyline rendering
  - [x] 3.1 Write 2-8 focused tests for route rendering
    - Test polyline decoding from encoded format
    - Test route rendering on map with correct styling
    - Test multiple alternative routes display
    - Test map bounds fitting to show full route
    - Test route color coding (blue for selected, gray for alternatives)
    - Test route update when transport mode changes
  - [x] 3.2 Implement polyline decoder utility
    - Create function to decode Google's encoded polyline format
    - Convert encoded string to array of lat/lng coordinates
    - Handle empty or invalid polyline strings gracefully
    - Reference Google's polyline encoding algorithm documentation
  - [x] 3.3 Create RoutePolyline component
    - Accept route data prop with polyline, color, selected state
    - Use Google Maps Polyline API (from Spec 001 integration)
    - Apply styling: 5px stroke width, appropriate color
    - Set z-index above markers but below popups for proper layering
    - Implement proper cleanup in useEffect return function
  - [x] 3.4 Implement route color coding
    - Selected/primary route: blue (#4285F4)
    - Alternative routes: gray (#9E9E9E)
    - Allow user to click alternative route to make it selected
    - Update color and styling when selection changes
  - [x] 3.5 Implement multiple alternative routes display
    - Render up to 3 alternative routes from API response
    - Display all routes simultaneously on map
    - Make alternative routes slightly thinner or semi-transparent for visual hierarchy
    - Allow clicking alternative route to switch to it
  - [x] 3.6 Implement map bounds fitting
    - Calculate bounds from route origin and destination coordinates
    - Use Google Maps fitBounds() to show entire route (from Spec 001)
    - Add appropriate padding: 50px on desktop, 20px on mobile
    - Preserve aspect ratio and don't over-zoom for short routes
  - [x] 3.7 Add origin and destination markers
    - Reuse marker system from Spec 001
    - Show green marker at origin (user location)
    - Keep business marker at destination (from Spec 004)
    - Ensure markers remain visible when route is displayed
    - Apply proper z-index layering
  - [x] 3.8 Implement dynamic route updates
    - Update polyline when user switches transport modes
    - Fetch new route from backend API
    - Clear old polyline before rendering new one
    - Show loading state during route recalculation
    - Don't trigger full page refresh
  - [x] 3.9 Ensure route rendering tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify polyline displays correctly on map
    - Verify color coding and alternative routes work
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- Encoded polyline successfully decoded to lat/lng coordinates
- Route path renders on map with 5px blue stroke
- Alternative routes display in gray
- Map bounds automatically fit to show full route with padding
- Route updates dynamically when transport mode changes
- Origin and destination markers remain visible
- The 2-8 tests written in 3.1 pass

---

### UI Components Layer

#### Task Group 4: Directions Panel & Transport Mode UI
**Dependencies:** Task Groups 1-3 (backend API, geolocation, route rendering)
**Effort:** L (Large)

- [x] 4.0 Complete directions UI components
  - [x] 4.1 Write 2-8 focused tests for directions UI
    - Test DirectionsPanel renders with route data
    - Test turn-by-turn steps display correctly
    - Test TransportModeSelector mode switching
    - Test panel collapsible behavior on mobile
    - Test step hover highlighting on map
    - Test total distance/duration display
  - [x] 4.2 Create DirectionsPanel component structure
    - Build React functional component with TypeScript
    - Accept props: route data, transport mode, onClose callback
    - Follow component standards from @agent-os/standards/frontend/components.md
    - Use Tailwind CSS for styling
    - Implement responsive design: side panel on desktop (300-400px width), overlay on mobile
  - [x] 4.3 Implement directions panel header
    - Display total trip duration prominently (e.g., "25 min" or "1 hr 15 min")
    - Show total distance in miles or kilometers (default to miles for US)
    - Format time: under 1 hour show minutes only, over 1 hour show hours and minutes
    - Include duration range for transit mode (e.g., "30-40 min")
    - Add close/back button to return to business info view
    - Use prominent typography for readability
  - [x] 4.4 Display departure and arrival addresses
    - Show origin address/coordinates at top: "From: [location]"
    - Show destination address at bottom: "To: [business name, address]"
    - Use clear labeling and visual separation
    - Truncate long addresses with ellipsis and tooltip on hover
  - [x] 4.5 Implement turn-by-turn directions list
    - Parse route steps from API response
    - Display each step with: instruction text, distance, maneuver icon
    - Show steps in scrollable list with proper spacing
    - Include step numbering: 1, 2, 3...
    - Display per-step distance and duration
    - Apply semantic HTML: use ordered list `<ol>` for accessibility
  - [x] 4.6 Add maneuver icons to directions steps
    - Use icon library or SVG icons for: turn left, turn right, straight, merge, etc.
    - Map Google Directions API maneuver types to appropriate icons
    - Size icons: 24x24px with consistent styling
    - Ensure icons are decorative only (no critical information without text)
    - Apply proper ARIA labels
  - [x] 4.7 Implement step hover highlighting
    - Add hover state to each direction step
    - When user hovers over step, highlight corresponding route segment on map
    - Use visual feedback: background color change, slight elevation
    - Clear highlight when hover ends
    - Ensure hover works on desktop, tap-to-highlight on mobile
  - [x] 4.8 Create TransportModeSelector component
    - Build icon button group for modes: car (driving), walk, transit, bike
    - Position above or beside directions panel
    - Use semantic icons that clearly communicate transport type
    - Ensure minimum 44x44px touch target size per @agent-os/standards/frontend/responsive.md
    - Apply active state styling: color and border distinction for selected mode
  - [x] 4.9 Implement transport mode switching
    - Trigger route recalculation when user clicks different mode
    - Show loading state during route fetch
    - Update DirectionsPanel with new route data
    - Update map polyline with new route
    - Disable unavailable modes (e.g., transit not available) with visual indicator
  - [x] 4.10 Handle transit-specific data display
    - Show transit line names and numbers (e.g., "Bus 42", "Red Line")
    - Display transit stops and transfer points
    - Show walking distance to/from transit stops
    - Include departure times and schedule information
    - Show number of transfers if applicable
  - [x] 4.11 Implement mobile collapsible panel
    - Add toggle button to collapse/expand panel on mobile
    - Use slide animation for smooth transition
    - Show mini summary when collapsed: duration and distance only
    - Maximize map viewing area when panel is collapsed
    - Persist panel state in component state
  - [x] 4.12 Apply responsive design
    - Desktop (1024px+): side panel 300-400px width, fixed position
    - Tablet (768px-1024px): overlay panel, partial screen width
    - Mobile (320px-768px): full-width overlay, collapsible
    - Test across all breakpoints per @agent-os/standards/frontend/responsive.md
    - Ensure readable typography on all screen sizes
  - [x] 4.13 Implement scrollable directions list
    - Make step list independently scrollable from map
    - Add scrollbar styling (thin, unobtrusive)
    - Ensure long route instructions don't break layout
    - Use proper overflow handling
    - Add scroll-to-top button for very long routes
  - [x] 4.14 Add loading and error states
    - Show skeleton loader while route is being calculated
    - Display error message if route calculation fails
    - Provide retry button for transient failures
    - Show warning for excessively long routes (e.g., 20+ mile walk)
    - Follow error handling standards from @agent-os/standards/global/error-handling.md
  - [x] 4.15 Ensure directions UI tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify all components render correctly
    - Verify mode switching and interactivity work
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- DirectionsPanel displays turn-by-turn instructions in scrollable list
- Total trip duration and distance shown prominently
- Departure and arrival addresses clearly labeled
- Each step shows instruction text, distance, duration, and maneuver icon
- TransportModeSelector switches between 4 modes: driving, walking, transit, cycling
- Active mode has distinct styling
- Panel is collapsible on mobile with toggle button
- Step hover highlights corresponding segment on map
- Transit-specific data (lines, stops, transfers) displays correctly
- Responsive design works on mobile, tablet, desktop
- The 2-8 tests written in 4.1 pass

---

### Integration Layer

#### Task Group 5: Business Card Integration & Directions Trigger
**Dependencies:** Task Groups 1-4 (all previous groups)
**Effort:** M (Medium)

- [x] 5.0 Complete business card integration
  - [x] 5.1 Write 2-8 focused tests for integration
    - Test "Get Directions" button appears on business card
    - Test clicking button triggers directions view
    - Test business context passed to directions component
    - Test map transition to show full route
    - Test "Back to business info" navigation
    - Test URL/state persistence for shareable links
  - [x] 5.2 Add "Get Directions" button to BusinessCard component
    - Add button to business information card from Spec 004
    - Position button prominently: below business info, above other actions
    - Use clear label: "Get Directions" or "Directions"
    - Apply primary button styling for visual prominence
    - Ensure 44x44px minimum touch target
  - [x] 5.3 Implement directions trigger handler
    - Create click handler that passes business place_id and coordinates
    - Trigger user location detection (from Task Group 2)
    - Show loading state while location is being detected
    - Handle location detection errors gracefully
    - Start route calculation automatically once origin and destination known
  - [x] 5.4 Implement view state management
    - Add application state: business info view vs directions view
    - Use React Router or state management to track current view
    - Transition from business card to directions panel smoothly
    - Maintain business context when switching views
    - Implement proper component mounting/unmounting
  - [x] 5.5 Implement map transition for directions view
    - Zoom out and pan to show full route when directions triggered
    - Keep business marker visible on map
    - Add origin marker for user location
    - Render route polyline overlay
    - Animate transition smoothly (300-500ms duration)
  - [x] 5.6 Add "Back to business info" navigation
    - Add back button in DirectionsPanel header
    - Return to business information card view
    - Remove route polyline from map
    - Remove origin marker
    - Re-center map on business location
    - Maintain business selection state
  - [x] 5.7 Implement URL/state persistence
    - Add route parameters to URL: business ID, directions mode
    - Enable shareable directions links
    - Restore directions view from URL on page load
    - Use query parameters for transport mode preference
    - Handle invalid or missing business IDs gracefully
  - [x] 5.8 Add business context to DirectionsPanel
    - Display business name in destination address
    - Show business address in arrival location
    - Include business phone/hours for reference
    - Provide quick link back to full business info
  - [x] 5.9 Ensure integration tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify end-to-end flow from business card to directions
    - Verify navigation and state management work
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- "Get Directions" button appears on business information card
- Clicking button automatically detects user location and calculates route
- Map transitions smoothly to show full route with appropriate zoom
- Business marker remains visible during directions view
- "Back to business info" button returns to business card view
- Directions view is shareable via URL with business and mode parameters
- Business name and address appear in DirectionsPanel destination
- The 2-8 tests written in 5.1 pass

---

### Testing & Quality Assurance

#### Task Group 6: Test Review, Gap Analysis & End-to-End Testing
**Dependencies:** Task Groups 1-5 (all previous task groups)
**Effort:** M (Medium)

- [ ] 6.0 Review existing tests and fill critical gaps only
  - [ ] 6.1 Review tests from Task Groups 1-5
    - Review backend API tests (Task 1.1)
    - Review geolocation tests (Task 2.1)
    - Review route rendering tests (Task 3.1)
    - Review UI component tests (Task 4.1)
    - Review integration tests (Task 5.1)
    - Total existing tests: approximately 10-40 tests
  - [ ] 6.2 Analyze test coverage gaps for Directions & Navigation feature only
    - Identify critical user workflows that lack test coverage
    - Focus on end-to-end scenarios: user clicks directions button → sees route
    - Check coverage for all 4 transport modes: driving, walking, transit, cycling
    - Identify gaps in error handling: API failures, no route found, permission denied
    - Focus ONLY on gaps related to this spec's feature requirements
    - Do NOT assess entire application test coverage
    - Prioritize integration tests over additional unit tests
  - [ ] 6.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on end-to-end user workflows:
      - User gets directions from business card to destination
      - User switches between transport modes and sees updated routes
      - User handles geolocation permission denial and uses manual input
      - API returns no route and user sees clear error message
    - Test cross-component integration points
    - Test caching behavior for repeated route requests
    - Mock external dependencies (Google APIs, geolocation)
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases unless business-critical
  - [ ] 6.4 Run feature-specific tests only
    - Run ONLY tests related to Directions & Navigation feature
    - Expected total: approximately 20-50 tests maximum
    - Verify all critical user workflows pass
    - Verify all 4 transport modes work correctly
    - Verify error handling scenarios
    - Do NOT run the entire application test suite
  - [ ] 6.5 Perform manual testing across scenarios
    - Test successful directions flow for all 4 transport modes
    - Test with various distances: short (< 1 mile), medium (1-10 miles), long (> 10 miles)
    - Test geolocation permission granted and denied scenarios
    - Test with no route available (e.g., transit in rural area)
    - Test alternative routes selection
    - Test navigation between business info and directions views
    - Test shareable URL with directions parameters
  - [ ] 6.6 Test responsive behavior across devices
    - Test on mobile (320px-768px): collapsible panel, touch interactions
    - Test on tablet (768px-1024px): overlay panel, responsive layout
    - Test on desktop (1024px+): side panel, hover interactions
    - Verify minimum 44x44px touch targets on mobile
    - Ensure readable typography on all screen sizes
    - Test landscape and portrait orientations on mobile
  - [ ] 6.7 Test accessibility compliance
    - Test keyboard navigation: tab through mode selector, directions steps
    - Test with screen reader: NVDA or VoiceOver
    - Verify semantic HTML: proper heading levels, list elements
    - Check color contrast ratios meet 4.5:1 minimum
    - Verify ARIA labels on icons and interactive elements
    - Test focus indicators are visible on all interactive elements
  - [ ] 6.8 Test edge cases and error scenarios
    - Test with identical origin and destination (should show error)
    - Test with extremely long routes (e.g., 100+ miles walking)
    - Test with API timeout or failure (should show error and retry option)
    - Test with no internet connection (graceful degradation)
    - Test with expired cached location (should request new location)
    - Test route calculation interruption (user cancels or navigates away)
  - [ ] 6.9 Verify performance and caching
    - Test route caching: same route requested twice should use cache
    - Verify cache TTL: 15 min for driving/walking/cycling, 5 min for transit
    - Test cache eviction: LRU when 100+ entries
    - Verify API timeout: 5 seconds for Directions API
    - Check geolocation timeout: 10 seconds before fallback
    - Measure page load time impact of directions feature
  - [ ] 6.10 Document known issues and limitations
    - Document any out-of-scope features from spec (lines 159-171)
    - Note any browser compatibility issues
    - Document any API limitations (e.g., rate limits, quota)
    - List any performance bottlenecks identified
    - Note any accessibility improvements needed in future iterations

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 20-50 tests total)
- Critical user workflows for Directions & Navigation are covered
- No more than 10 additional tests added when filling in testing gaps
- All 4 transport modes work correctly: driving, walking, transit, cycling
- Geolocation permission handling works in all scenarios
- Responsive design verified on mobile, tablet, desktop
- Accessibility standards met per @agent-os/standards/frontend/accessibility.md
- Error handling tested for all major failure scenarios
- Route caching works correctly with appropriate TTL
- Manual testing completed across all scenarios
- Known issues and limitations documented

---

## Execution Order

Recommended implementation sequence:

1. **Backend API Layer** (Task Group 1) - Establish data layer first
2. **Geolocation** (Task Group 2) - Can be done in parallel with Task Group 1
3. **Route Rendering** (Task Group 3) - Depends on Task Group 1
4. **UI Components** (Task Group 4) - Depends on Task Groups 1-3
5. **Integration** (Task Group 5) - Depends on Task Groups 1-4
6. **Testing & QA** (Task Group 6) - Final validation after all groups complete

### Parallel Execution Opportunities

- Task Groups 1 and 2 can be developed in parallel (independent)
- Task Group 3 can start once Task Group 1 is complete
- Task Group 4 can start once Task Group 3 has basic route rendering
- Task Group 5 requires all previous groups to be substantially complete

---

## Key Dependencies & Integration Points

### External APIs
- **Google Directions API**: Core routing functionality (Task Group 1)
- **Google Places API**: Manual location input geocoding (Task Group 2, reuse from Spec 003)
- **Google Maps JavaScript API**: Map display and polyline rendering (Task Group 3, reuse from Spec 001)
- **Browser Geolocation API**: User location detection (Task Group 2)

### Existing Components to Integrate
- **MapView component** (Spec 001): Reuse for route display
- **BusinessCard component** (Spec 004): Add "Get Directions" button
- **Marker system** (Spec 001): Reuse for origin/destination markers
- **Backend API architecture**: Follow patterns from Specs 001-003

### Data Flow
1. User clicks "Get Directions" on BusinessCard
2. System detects user location via Geolocation API
3. Frontend calls POST `/api/directions` with origin, destination, mode
4. Backend proxies request to Google Directions API
5. Backend caches and returns normalized route data
6. Frontend decodes polyline and renders route on map
7. Frontend displays turn-by-turn directions in DirectionsPanel
8. User can switch transport modes, triggering steps 3-7 again

---

## Testing Strategy

### Test Distribution
- **Task Group 1** (Backend): 2-8 tests for API endpoint, validation, caching
- **Task Group 2** (Geolocation): 2-8 tests for location detection, permissions, fallback
- **Task Group 3** (Route Rendering): 2-8 tests for polyline rendering, map integration
- **Task Group 4** (UI Components): 2-8 tests for DirectionsPanel, TransportModeSelector
- **Task Group 5** (Integration): 2-8 tests for end-to-end flow, navigation
- **Task Group 6** (Gap Analysis): Up to 10 additional strategic tests
- **Total**: ~20-50 focused tests covering critical workflows

### Testing Focus
- Test behavior, not implementation
- Mock external APIs (Google Directions, Geolocation)
- Focus on critical user workflows: get directions, switch modes, handle errors
- Test integration points between components
- Skip exhaustive edge case testing during development
- Defer performance and accessibility deep-dives to Task Group 6

---

## Effort Estimates

- **XS (Extra Small)**: 1-2 hours
- **S (Small)**: 2-4 hours
- **M (Medium)**: 4-8 hours (1 day)
- **L (Large)**: 8-16 hours (2+ days)

### Task Group Estimates
- Task Group 1: **L** (Large) - 2-3 days
- Task Group 2: **M** (Medium) - 1 day
- Task Group 3: **M** (Medium) - 1 day
- Task Group 4: **L** (Large) - 2-3 days
- Task Group 5: **M** (Medium) - 1 day
- Task Group 6: **M** (Medium) - 1-2 days

**Total Estimated Effort**: 8-12 days (2-3 weeks with testing and iteration)

---

## Notes

- **API Key Security**: All Google API calls must be proxied through backend to protect API key
- **Caching**: Different TTL for transit (5 min) vs other modes (15 min) due to schedule changes
- **Mobile-First**: Design DirectionsPanel for mobile first, then enhance for desktop
- **Accessibility**: Follow WCAG 2.1 AA standards, test with keyboard and screen readers
- **Performance**: Monitor API quota usage, implement rate limiting if needed
- **Error Messages**: User-friendly messages per @agent-os/standards/global/error-handling.md
- **Out of Scope**: Multi-stop routing, route customization, voice navigation, offline caching (see spec lines 159-171)

---

## Success Metrics

- All 4 transport modes (driving, walking, transit, cycling) work correctly
- Route calculation completes within 5 seconds
- Geolocation detection completes within 10 seconds
- 95%+ successful route calculations (excluding legitimately unavailable routes)
- Route caching reduces API calls by 30-40% for repeat requests
- Mobile collapsible panel improves map viewing area by 60%+
- Zero API key exposures in client-side code
- Accessibility score of 90+ on Lighthouse audit
