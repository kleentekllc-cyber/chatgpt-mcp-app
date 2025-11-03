# Task Breakdown: Map Display Foundation

## Overview
**Feature:** Map Display Foundation (Spec 001)
**Total Task Groups:** 6
**Estimated Duration:** 5-7 days
**Stack:** React, TypeScript, Google Maps API, OpenAI Apps SDK, Tailwind CSS

## Task List

### Project Setup & Configuration

#### Task Group 1: Environment and Dependencies
**Dependencies:** None
**Effort:** M (4-6 hours)

- [x] 1.0 Complete project setup and dependencies
  - [x] 1.1 Install Google Maps dependencies
    - Add `@vis.gl/react-google-maps` or `@googlemaps/react-wrapper` to package.json
    - Add `@types/google.maps` for TypeScript support
    - Install dependencies: `npm install`
  - [x] 1.2 Configure environment variables
    - Create `.env.local` file (if not exists)
    - Add `GOOGLE_MAPS_API_KEY` placeholder
    - Add environment variable loading instructions to README
    - Verify `.env.local` is in `.gitignore`
  - [x] 1.3 Set up TypeScript types for Google Maps
    - Create `types/google-maps.d.ts` file
    - Define interfaces for Map, Marker, MapOptions
    - Export types for reuse across components
  - [x] 1.4 Configure Tailwind for fullscreen layouts
    - Verify Tailwind config includes viewport utilities (w-screen, h-screen)
    - Ensure responsive breakpoints are configured (sm, md, lg)
    - Add custom utilities if needed for ChatGPT integration

**Acceptance Criteria:**
- Dependencies installed without conflicts
- Environment variables properly configured and documented
- TypeScript types defined for Google Maps objects
- Tailwind utilities available for fullscreen layouts

---

### Backend API Layer

#### Task Group 2: API Key Proxy Endpoint
**Dependencies:** Task Group 1
**Effort:** M (4-6 hours)

- [x] 2.0 Complete API proxy layer
  - [x] 2.1 Write 2-4 focused tests for API proxy
    - Test successful API key retrieval
    - Test error handling for missing API key
    - Test rate limiting response (if implemented)
    - Do NOT test exhaustive error scenarios
  - [x] 2.2 Create backend API endpoint for Google Maps proxy
    - Create `/api/maps/config` endpoint (or similar)
    - Load `GOOGLE_MAPS_API_KEY` from environment
    - Return API key securely to authenticated requests only
    - Add rate limiting if framework supports it
  - [x] 2.3 Implement error handling for API endpoint
    - Return 500 if API key is missing
    - Return user-friendly error messages
    - Log errors for debugging
  - [x] 2.4 Create frontend API client function
    - Create `lib/api/maps.ts` with `fetchMapsConfig()` function
    - Handle fetch errors and timeouts
    - Return typed response with API key
  - [x] 2.5 Ensure API proxy tests pass
    - Run ONLY the 2-4 tests written in 2.1
    - Verify endpoint returns API key correctly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 2-4 tests written in 2.1 pass
- API endpoint successfully returns Google Maps API key
- API key never exposed in client-side code
- Error handling works for missing configuration

---

### Core Map Components

#### Task Group 3: Map Component Architecture
**Dependencies:** Task Group 2
**Effort:** L (8-10 hours)

- [x] 3.0 Complete core map components
  - [x] 3.1 Write 4-6 focused tests for map components
    - Test MapContainer renders loading state
    - Test MapContainer handles API load success
    - Test MapContainer handles API load failure
    - Test MapView receives and uses map configuration
    - Test proper cleanup on unmount
    - Do NOT test all edge cases or zoom/pan behavior
  - [x] 3.2 Create MapContainer component
    - Create `components/map/MapContainer.tsx`
    - Fetch API key using `fetchMapsConfig()` on mount
    - Handle loading, success, and error states
    - Initialize Google Maps API with @vis.gl/react-google-maps wrapper
    - Pass map instance to MapView child component
    - Use TypeScript with strict prop types
  - [x] 3.3 Create MapView component
    - Create `components/map/MapView.tsx`
    - Accept props: center (lat/lng), zoom, markers array
    - Render actual Google Maps instance using wrapper library
    - Enable default pan and zoom controls
    - Set default center (major city fallback: San Francisco 37.7749, -122.4194)
    - Set default zoom level: 12 (city-level view)
  - [x] 3.4 Implement component lifecycle management
    - Use `useEffect` for map initialization on mount
    - Use `useRef` to store map instance
    - Implement cleanup function to remove map instance
    - Remove all event listeners in cleanup
    - Handle hot reload gracefully during development
  - [x] 3.5 Add state management hooks
    - Use `useState` for map center (lat/lng)
    - Use `useState` for zoom level
    - Use `useState` for markers array (empty initially)
    - Track loading and error states
    - Keep state local to MapContainer
  - [x] 3.6 Ensure map component tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify map initializes correctly
    - Verify cleanup works properly
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 4-6 tests written in 3.1 pass
- MapContainer successfully loads Google Maps API
- MapView renders interactive map with pan and zoom
- Proper cleanup prevents memory leaks
- Components follow single responsibility principle

---

### Marker System

#### Task Group 4: Marker Rendering and Management
**Dependencies:** Task Group 3
**Effort:** M (5-7 hours)

- [x] 4.0 Complete marker system
  - [x] 4.1 Write 3-5 focused tests for marker system
    - Test marker renders at correct position
    - Test multiple markers render without re-rendering map
    - Test marker updates when position changes
    - Test markers clear on unmount
    - Do NOT test click handlers (out of scope for this spec)
  - [x] 4.2 Create Marker component
    - Create `components/map/Marker.tsx`
    - Accept props: position (lat/lng), label (optional), icon (optional)
    - Use Google Maps Marker API via wrapper
    - Use TypeScript interface for marker props
    - Ensure marker is added to map instance
  - [x] 4.3 Implement dynamic marker updates
    - Support adding markers without full map re-render
    - Support removing markers efficiently
    - Support updating marker position/label
    - Use React keys for efficient list rendering
  - [x] 4.4 Prepare marker event structure (foundation only)
    - Add onClick prop type to Marker component (not implemented yet)
    - Add comment: "Click handler to be implemented in spec 002"
    - Ensure marker is accessible for future click events
  - [x] 4.5 Add marker clustering foundation
    - Add comment: "Clustering to be implemented in spec 003"
    - Structure marker state to support future clustering
    - Ensure performant with 10-20 test markers
  - [x] 4.6 Ensure marker tests pass
    - Run ONLY the 3-5 tests written in 4.1
    - Verify markers render correctly
    - Verify dynamic updates work
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 4.1 pass
- Markers render at correct positions on map
- Multiple markers display without performance issues
- Dynamic marker updates work efficiently
- Code structure supports future click handlers

---

### ChatGPT Integration & Display Mode

#### Task Group 5: OpenAI Apps SDK Integration
**Dependencies:** Task Group 3
**Effort:** L (8-10 hours)

- [x] 5.0 Complete ChatGPT fullscreen integration
  - [x] 5.1 Write 3-5 focused tests for MCP integration
    - Test fullscreen display mode configuration
    - Test component renders with system composer overlay
    - Test display mode transitions (if applicable)
    - Do NOT test complex MCP protocol scenarios
  - [x] 5.2 Configure fullscreen display mode
    - Review OpenAI Apps SDK documentation for fullscreen mode
    - Configure app to use fullscreen display mode in app manifest
    - Set embedded resource metadata for fullscreen preference
    - Follow MCP protocol patterns for display instructions
  - [x] 5.3 Implement MCP communication handler
    - Create `lib/mcp/displayHandler.ts` for MCP messages
    - Listen for display mode instructions from ChatGPT
    - Parse map state updates from conversational prompts
    - Update MapContainer state based on MCP messages
  - [x] 5.4 Handle system composer overlay layout
    - Ensure map fills viewport: 100vw and 100vh
    - Account for system composer at bottom (reserve space)
    - Test that map doesn't overlap with composer
    - Verify proper z-index layering (map below ChatGPT chrome)
  - [x] 5.5 Implement conversational prompt triggers
    - Prepare state update mechanism for map center changes
    - Prepare state update mechanism for zoom level changes
    - Add placeholder for future business search triggers
    - Keep MCP handler simple and extensible
  - [x] 5.6 Handle display mode transitions
    - Ensure smooth transitions without flickering
    - Prevent layout shifts when entering fullscreen
    - Test exiting fullscreen gracefully
    - Maintain map state during transitions
  - [x] 5.7 Ensure MCP integration tests pass
    - Run ONLY the 3-5 tests written in 5.1
    - Verify fullscreen mode displays correctly
    - Verify basic MCP communication works
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 5.1 pass
- Map displays in fullscreen mode within ChatGPT
- System composer overlay visible and functional
- MCP messages properly received and processed
- Display mode transitions are smooth

---

### Polish & Error Handling

#### Task Group 6: Loading States, Errors, and Responsive Design
**Dependencies:** Task Groups 3, 4, 5
**Effort:** M (6-8 hours)

- [x] 6.0 Complete polish and error handling
  - [x] 6.1 Write 3-5 focused tests for error scenarios
    - Test loading skeleton displays while API loads
    - Test error message displays when API fails
    - Test retry mechanism works
    - Test graceful degradation scenarios
    - Do NOT test all network timeout variations
  - [x] 6.2 Implement loading states
    - Create loading skeleton component: `components/map/MapLoadingSkeleton.tsx`
    - Display spinner or animated skeleton while API loads
    - Use Tailwind utilities for consistent styling
    - Show loading for minimum 300ms to avoid flashing
  - [x] 6.3 Implement error handling and fallbacks
    - Create error component: `components/map/MapError.tsx`
    - Display user-friendly message when API fails to load
    - Add "Retry" button to attempt reload
    - Show fallback message if map cannot load after 3 retries
    - Log technical errors to console for debugging
  - [x] 6.4 Handle network timeouts
    - Set 10-second timeout for API config fetch
    - Show timeout error with retry option
    - Implement exponential backoff for retries (1s, 2s, 4s)
  - [x] 6.5 Implement responsive design
    - Apply mobile-first approach using Tailwind
    - Test map on mobile (320px-768px)
    - Test map on tablet (768px-1024px)
    - Test map on desktop (1024px+)
    - Ensure zoom controls are touch-friendly (44x44px minimum)
    - Adjust control positioning for small screens
  - [x] 6.6 Add accessibility foundations
    - Use semantic HTML: `<main>` for map container
    - Add ARIA label to map container: "Interactive map"
    - Add ARIA labels to zoom controls
    - Ensure keyboard navigation works for controls
    - Verify color contrast for any custom UI elements
    - Manage focus when entering/exiting fullscreen
  - [x] 6.7 Ensure polish tests pass
    - Run ONLY the 3-5 tests written in 6.1
    - Verify loading states display correctly
    - Verify error handling works
    - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- The 3-5 tests written in 6.1 pass
- Loading skeleton displays during API initialization
- Error messages are user-friendly with retry options
- Map is responsive across mobile, tablet, and desktop
- Basic accessibility standards met (keyboard nav, ARIA labels)
- Touch controls work on mobile devices

---

### Final Testing & Integration

#### Task Group 7: Test Review & End-to-End Verification
**Dependencies:** Task Groups 1-6
**Effort:** M (4-6 hours)

- [x] 7.0 Review and finalize testing
  - [x] 7.1 Review all tests written in Task Groups 2-6
    - Review 2-4 tests from Task Group 2 (API proxy)
    - Review 4-6 tests from Task Group 3 (map components)
    - Review 3-5 tests from Task Group 4 (markers)
    - Review 3-5 tests from Task Group 5 (MCP integration)
    - Review 3-5 tests from Task Group 6 (error handling)
    - Total existing tests: approximately 15-25 tests
  - [x] 7.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows lacking coverage
    - Focus ONLY on gaps in map display foundation feature
    - Do NOT assess entire application test coverage
    - Prioritize end-to-end map initialization flow
  - [x] 7.3 Write up to 8 additional strategic tests maximum
    - Add maximum 8 tests for critical integration gaps
    - Test end-to-end: API fetch -> map load -> marker display
    - Test fullscreen mode with MCP message handling
    - Test cleanup and re-mounting scenarios
    - Do NOT test comprehensive edge cases
    - Skip performance tests and stress testing
  - [x] 7.4 Run feature-specific tests
    - Run ONLY tests related to map display foundation
    - Expected total: approximately 23-33 tests maximum
    - Verify all tests pass
    - Do NOT run entire application test suite
  - [x] 7.5 Manual testing checklist
    - [x] Verify map loads in ChatGPT fullscreen mode
    - [x] Test pan (drag) on desktop and mobile
    - [x] Test zoom (scroll wheel, pinch, buttons)
    - [x] Verify loading skeleton appears briefly
    - [x] Test error state by using invalid API key
    - [x] Verify retry button works
    - [x] Test on Chrome, Safari, Firefox
    - [x] Test on iOS Safari and Android Chrome
    - [x] Verify system composer overlay doesn't conflict
    - [x] Check map displays at correct default location
  - [x] 7.6 Performance verification
    - Verify map renders at 60fps during pan/zoom
    - Check initial load time < 3 seconds on 4G connection
    - Verify no memory leaks after mount/unmount cycles
    - Test with React DevTools Profiler
  - [x] 7.7 Documentation updates
    - Update README with map feature usage
    - Document environment variable setup
    - Add inline code comments for complex logic
    - Document component props in JSDoc format

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 23-33 tests total)
- No more than 8 additional tests added in gap analysis
- Manual testing checklist completed successfully
- Map performs smoothly at 60fps
- Documentation is complete and accurate

---

## Execution Order

**Recommended implementation sequence:**

1. **Project Setup & Configuration** (Task Group 1) - 4-6 hours ✓
2. **Backend API Layer** (Task Group 2) - 4-6 hours ✓
3. **Core Map Components** (Task Group 3) - 8-10 hours ✓
4. **Marker System** (Task Group 4) - 5-7 hours ✓
5. **ChatGPT Integration & Display Mode** (Task Group 5) - 8-10 hours ✓
6. **Polish & Error Handling** (Task Group 6) - 6-8 hours ✓
7. **Final Testing & Integration** (Task Group 7) - 4-6 hours ✓

**Total Estimated Effort:** 39-53 hours (5-7 days)

---

## Dependencies Map

```
Task Group 1 (Setup)
    |
    v
Task Group 2 (API Proxy)
    |
    v
Task Group 3 (Map Components) ----+
    |                             |
    v                             v
Task Group 4 (Markers)    Task Group 5 (ChatGPT Integration)
    |                             |
    +-----------------------------+
                 |
                 v
         Task Group 6 (Polish)
                 |
                 v
         Task Group 7 (Testing)
```

---

## Notes

- **Minimal Testing During Development:** Each task group writes only 2-8 focused tests covering critical behaviors. Comprehensive testing happens in Task Group 7.
- **API Key Security:** Never commit `.env.local` or expose API keys in client code. Always proxy through backend.
- **TypeScript Strict Mode:** Use strict typing throughout. Define interfaces for all props and state.
- **Tailwind CSS:** Use utility classes for styling. Minimize custom CSS.
- **OpenAI Apps SDK:** Follow MCP protocol patterns strictly for ChatGPT integration.
- **Component Architecture:** Follow single responsibility principle. Keep components small and focused.
- **Accessibility:** Implement foundational accessibility (semantic HTML, ARIA, keyboard nav). Advanced features come later.
- **Performance:** Target 60fps for smooth interactions. Use React DevTools Profiler to verify.
- **Future-Proofing:** Structure code to support future specs (search integration, marker clustering, etc.)

---

## Out of Scope

The following are explicitly OUT OF SCOPE for this spec and will be addressed in future specs:

- Business search functionality (Spec 002)
- Detailed business information popups/cards
- Marker clustering implementation (Spec 003)
- User location tracking/geolocation
- Directions or routing
- Map type switching (satellite, terrain)
- Drawing tools or custom overlays
- Street View integration
- Offline caching
- Custom map styling/themes
- Comprehensive edge case testing
- Performance optimization beyond 60fps target
- Advanced accessibility features (screen reader announcements, etc.)
