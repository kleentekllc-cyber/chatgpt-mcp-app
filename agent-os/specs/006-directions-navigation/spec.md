# Specification: Directions and Navigation

## Goal
Implement routing functionality to calculate and display directions between user location and selected business, supporting multiple transport modes (driving, walking, transit, cycling) with interactive route visualization, turn-by-turn instructions, and accurate time and distance estimates.

## User Stories
- As a user, I want to get directions from my current location to a selected business so that I can navigate there easily
- As a user, I want to choose my preferred transport mode (driving, walking, transit, cycling) so that I receive relevant routing options
- As a user, I want to see the route displayed on the map with turn-by-turn directions so that I can follow the path visually and understand each step

## Specific Requirements

**Google Directions API Integration**
- Use Google Directions API to calculate routes between origin (user location) and destination (business location)
- Proxy all API requests through backend endpoint to protect API key from client exposure
- Request essential route fields: overview_polyline, legs (steps, distance, duration), warnings, waypoints
- Support all transport modes: driving, walking, transit, cycling with mode-specific parameters
- Handle API response with multiple route alternatives when available (up to 3 alternative routes)
- Set request timeout of 5 seconds to prevent hanging requests
- Transform API responses into normalized route data structure for frontend consumption

**User Location Detection**
- Use browser Geolocation API to detect user's current position with high accuracy enabled
- Request location permission with clear user-facing prompt explaining why location is needed
- Cache user location for 5 minutes to reduce repeated permission requests and API calls
- Provide manual location input fallback if geolocation permission is denied or unavailable
- Handle geolocation errors gracefully with user-friendly messages and alternative input options
- Set geolocation timeout of 10 seconds before falling back to manual entry
- Use last known location as fallback if available from previous map interactions

**Backend Directions Endpoint**
- Create RESTful POST endpoint `/api/directions` accepting origin, destination, and travel mode parameters
- Validate origin and destination as valid lat/lng coordinates or place IDs before API call
- Accept travelMode enum: DRIVING, WALKING, TRANSIT, BICYCLING matching Google's API parameters
- Return JSON response with route object containing polyline, steps array, distance, duration, and warnings
- Include appropriate HTTP status codes: 200 for success, 400 for validation errors, 404 for no route found
- Implement request logging for monitoring API usage and debugging routing issues
- Apply CORS configuration to allow requests from ChatGPT client domain

**Route Polyline Rendering**
- Decode Google's encoded polyline format into array of lat/lng coordinates for map display
- Render route path on map using Google Maps Polyline API with 5px stroke width
- Use color coding for route: blue (#4285F4) for selected route, gray (#9E9E9E) for alternatives
- Apply route polyline with z-index above markers but below popups for proper layering
- Update polyline dynamically when user switches transport modes without full page refresh
- Fit map bounds to show entire route from origin to destination with appropriate padding
- Support multiple route alternatives displayed simultaneously with visual distinction

**Turn-by-Turn Directions Panel**
- Create DirectionsPanel component displaying step-by-step navigation instructions in scrollable list
- Parse route steps from Directions API response extracting instruction text, distance, and duration
- Display each step with instruction text (e.g., "Turn left onto Main St"), distance, and maneuver icon
- Include total trip distance and estimated duration at top of panel with prominent typography
- Show departure and arrival addresses clearly labeled at beginning and end of directions list
- Provide step highlighting: when user hovers over step, highlight corresponding segment on map
- Make panel collapsible on mobile to maximize map viewing area with toggle button

**Transport Mode Selector UI**
- Create TransportModeSelector component with icon buttons for each mode: car, walk, transit, bike
- Position mode selector above or beside directions panel for easy access
- Apply active state styling to currently selected mode using color and border distinction
- Trigger immediate route recalculation when user clicks different transport mode
- Disable unavailable modes based on API response (e.g., transit not available in area)
- Use semantic icons that clearly communicate each transport type for accessibility
- Ensure minimum 44x44px touch target size for mobile usability

**Time and Distance Estimates**
- Display total trip duration prominently in directions panel header (e.g., "25 min" or "1 hr 15 min")
- Show total distance in user-appropriate units (miles for US, kilometers for metric regions)
- Include duration range for transit mode accounting for schedule variations (e.g., "30-40 min")
- Update estimates in real-time when user switches transport modes
- Display per-step distance and duration within turn-by-turn directions for detailed planning
- Show traffic-adjusted duration when available from Directions API for driving mode
- Format time estimates clearly: under 1 hour show minutes only, over 1 hour show hours and minutes

**Route Calculation for Multiple Modes**
- Implement separate API calls for each transport mode to retrieve mode-specific routing
- Cache route results per mode to avoid redundant API calls when user switches between modes
- Handle mode-specific routing options: avoid highways for driving, prefer bike paths for cycling
- Support transit-specific data: departure times, transit line names, stops, and transfers
- Calculate walking distance for transit mode including walk to/from transit stops
- Provide alternative routes for driving and cycling modes when available from API
- Handle routes that are not feasible for certain modes (e.g., long distance walking) with warnings

**Directions Trigger from Business Card**
- Add "Get Directions" button to business information card component from spec 004
- Pass business place_id and coordinates to directions component when button is clicked
- Automatically detect user location and calculate route when directions are requested
- Transition map view to show full route with appropriate zoom level and centering
- Maintain business marker visibility on map while displaying route overlay
- Provide "Back to business info" navigation to return from directions view to business card
- Persist business context in URL or state for shareable directions links

**Caching Strategy for Routes**
- Cache calculated routes in memory using Map with composite key: origin, destination, travel mode
- Set cache TTL of 15 minutes for non-transit routes, 5 minutes for transit due to schedule changes
- Implement LRU eviction when cache exceeds 100 entries to prevent memory bloat
- Skip cache for routes with real-time traffic data to ensure accuracy
- Include cache hit/miss metadata in API responses for monitoring effectiveness
- Consider Redis for distributed caching if scaling beyond single server instance

**Error Handling and Edge Cases**
- Display user-friendly message when no route is found: "No route available for this mode. Try a different transport option."
- Handle geolocation permission denial with fallback to manual location entry form
- Show warning when route is excessively long for selected mode (e.g., 20+ mile walk)
- Implement retry logic with exponential backoff for transient Directions API failures
- Provide clear error message when origin and destination are identical
- Handle cases where transit is unavailable in area by disabling transit mode button
- Log all routing errors with context for debugging while showing simple messages to users

## Visual Design

No visual mockups provided for this spec. Follow these design principles:
- Integrate seamlessly with Map Display Foundation (spec 001) fullscreen layout
- Position DirectionsPanel as overlay on map (mobile) or side panel (desktop) using responsive design
- Use Tailwind CSS utility classes for consistent styling with existing map interface
- Apply ChatGPT's minimal visual aesthetic with clean typography and ample white space
- Ensure directions panel is scrollable independently from map for long route instructions
- Use color-coded route polylines that provide clear visual distinction on map
- Maintain minimum 44x44px touch targets for all interactive elements per accessibility standards

## Existing Code to Leverage

**Google Maps JavaScript API from Spec 001**
- Reuse Google Maps instance and initialization patterns from MapView component
- Leverage existing marker rendering system to show origin and destination markers
- Use established API key management through backend proxy for security consistency
- Build on map controls and interaction patterns for zoom, pan during route display
- Apply same error handling and loading state patterns for API operations

**Business Search API and Marker Data from Spec 003**
- Consume business place_id and coordinates from BusinessResult interface for destinations
- Use existing normalized address format for destination display in directions panel
- Leverage marker clustering awareness to handle directions from clustered business sets
- Reuse Places API integration patterns for geocoding manual location inputs
- Apply same backend API architecture with Express.js or Next.js routes

**React Component Architecture from Spec 001**
- Follow established React 18+ patterns with functional components and hooks (useState, useEffect, useRef)
- Use TypeScript with strict typing for all component props, state, and API responses
- Apply single responsibility principle separating DirectionsRoute, DirectionsPanel, TransportModeSelector
- Implement proper component lifecycle with cleanup functions in useEffect for API calls
- Leverage existing Tailwind CSS configuration and responsive breakpoint patterns

**MCP Protocol Integration from Previous Specs**
- Use MCP tool result format to return directions data to ChatGPT conversational interface
- Enable conversational triggers for directions requests through MCP message handling
- Support ChatGPT system composer overlay in fullscreen display mode during directions view
- Maintain z-index layering consistency with MCP UI chrome from spec 001
- Handle display mode transitions when showing/hiding directions panel

**Geolocation and Browser APIs**
- Implement browser Geolocation API following web standards with permission handling
- Use navigator.geolocation.getCurrentPosition with high accuracy and timeout options
- Handle permission states (prompt, granted, denied) with appropriate UI feedback
- Cache location data in sessionStorage for performance across component remounts
- Provide manual override for users who prefer not to share precise location

## Out of Scope

- Real-time traffic updates or live route recalculation based on traffic conditions
- Multi-stop routing or waypoint addition beyond origin and destination
- Route customization options like avoid tolls, avoid highways (basic defaults only)
- Voice-guided navigation or audio turn-by-turn directions
- Offline route caching or progressive web app offline functionality
- Integration with native mobile navigation apps (Google Maps, Apple Maps)
- Sharing routes via SMS, email, or social media
- Saving favorite routes or route history in user profile
- Street View integration for visual preview of turns
- Parking information or points of interest along route
