# Specification: Business Search API Integration

## Goal
Integrate Google Places API to search for local businesses based on structured query parameters from Natural Language Search, returning formatted results as map markers with clustering for dense result sets and basic business information in popups.

## User Stories
- As a user, I want to see businesses on the map matching my search criteria so that I can visually explore nearby options
- As a user, I want dense result sets to be automatically clustered so that the map remains readable and not overwhelming
- As a system, I want to handle API rate limits and failures gracefully so that users receive reliable service even under constraints

## Specific Requirements

**Google Places API Integration**
- Use Google Places API (New) with Text Search and Nearby Search endpoints for business discovery
- Implement backend proxy endpoint to protect API key from client exposure
- Configure API to return essential fields: name, location (lat/lng), rating, address, photos, business status
- Use place_id as unique identifier for all business records returned from API
- Handle API response pagination to retrieve all relevant results up to reasonable limit (100 businesses max)
- Transform API responses into normalized business data structure for frontend consumption
- Set appropriate request timeouts (5 seconds) to prevent hanging requests

**Backend API Endpoint Design**
- Create RESTful POST endpoint `/api/search/businesses` accepting JSON payload with structured search parameters
- Accept businessType (string), location (string), filters (object with rating, price, openNow, distance, attributes)
- Validate all input parameters on server side before forwarding to Google Places API
- Return JSON response with array of business objects and metadata (total count, query parameters, cache status)
- Include appropriate HTTP status codes: 200 for success, 400 for validation errors, 503 for API failures
- Implement request logging for debugging and monitoring API usage patterns
- Apply CORS configuration to allow requests from ChatGPT client

**Result Formatting and Normalization**
- Transform Google Places API response into consistent business object schema with typed fields
- Normalize address formats to consistent structure (street, city, state, postal code, country)
- Convert price level from Places API numeric scale (0-4) to dollar sign representation ($-$$$$)
- Extract primary photo reference and construct photo URL with appropriate size parameters (400x300px)
- Calculate distance from search center point to each business location using Haversine formula
- Round ratings to one decimal place and include total review count when available
- Handle missing or null fields gracefully with sensible defaults (e.g., "No rating" for missing ratings)

**Map Marker Data Structure**
- Define TypeScript interface for marker objects with position (lat/lng), id (place_id), label, icon type
- Include business category in marker data to enable future custom icon support
- Add z-index hints based on rating to render higher-rated businesses above others when overlapping
- Include minimal popup data: business name, rating with stars, street address, open/closed status
- Structure marker array for efficient rendering with React (stable keys using place_id)
- Prepare marker data format compatible with Google Maps Marker API used in spec 001

**Clustering Algorithm for Dense Results**
- Implement marker clustering when search returns 50 or more businesses within viewport
- Use @googlemaps/markerclusterer library for performant clustering on Google Maps
- Configure cluster appearance: show business count in cluster icon, use color coding by density
- Set zoom levels for cluster breakpoints: expand clusters at zoom 15+ for detailed viewing
- Preserve individual marker interactivity when zoomed in sufficiently to show unclustered markers
- Optimize clustering performance by limiting max businesses processed to 200 per search
- Allow users to click clusters to zoom into that geographic area

**Basic Popup Data Structure**
- Create popup content object with business name as heading, rating stars as visual indicator
- Include street address as single line, business status (open now / closed), primary category
- Add thumbnail photo if available from Places API photo reference (200x150px)
- Structure popup HTML as simple semantic markup for accessibility (headings, lists)
- Keep popup content minimal and focused to support future expansion to full detail cards (spec 004)
- Define TypeScript interface for popup data matching the MapView component expectations from spec 001

**Rate Limiting Strategy**
- Track API requests per minute using in-memory counter with sliding window algorithm
- Implement request queuing when approaching Google Places API quota limits (configurable threshold)
- Return cached results when rate limit is reached rather than failing requests
- Include rate limit status in API response headers (X-RateLimit-Remaining, X-RateLimit-Reset)
- Log rate limit warnings for monitoring and alerting on approaching quota exhaustion
- Configure per-user rate limits if OAuth is implemented to prevent abuse

**Caching Implementation**
- Cache search results in memory using Node.js Map with TTL of 15 minutes for repeat queries
- Generate cache keys from normalized query parameters (businessType, location, filters sorted)
- Implement LRU eviction policy when cache size exceeds 500 entries to prevent memory bloat
- Include cache hit/miss metadata in API responses for monitoring cache effectiveness
- Skip cache for queries with openNow filter to ensure real-time business status accuracy
- Consider Redis for distributed caching if scaling beyond single server instance

**Error Handling and Fallbacks**
- Catch Google Places API errors and return user-friendly messages without exposing API details
- Implement retry logic with exponential backoff (3 attempts) for transient API failures
- Return partial results if some API calls succeed but others fail during pagination
- Provide fallback error message when no businesses found: "No results found. Try adjusting your search."
- Log all API errors with context (query, error type, status code) for debugging
- Handle geocoding failures for ambiguous locations by requesting clarification through MCP response

## Visual Design

No visual mockups provided for this backend-focused spec. The Business Search API Integration is primarily a server-side feature that:
- Receives structured search parameters from Natural Language Search Processing (spec 002)
- Calls Google Places API and processes responses
- Returns formatted marker and popup data for Map Display Foundation (spec 001) to render
- Enables the visual map interface with clustered markers and basic business information

The output of this spec drives the map markers and popups displayed in the fullscreen map view built in spec 001.

## Existing Code to Leverage

**Google Maps JavaScript API from Spec 001**
- Marker rendering capability already implemented in MapView component accepts position and label
- Reuse marker component structure and extend with popup data binding for InfoWindow API
- Leverage existing Google Maps API initialization and error handling patterns
- Use same API key management approach (backend proxy) established for Maps display
- Build on marker placement system foundation to add clustering and popup interactions

**MCP Server Patterns from Spec 002**
- Follow established MCP tool result format to return business search data to ChatGPT
- Use same Express.js or Next.js API route structure for consistent backend architecture
- Leverage existing environment configuration patterns with dotenv for Places API key management
- Reuse structured output format approach with typed TypeScript interfaces
- Apply same input validation and sanitization patterns for security consistency

**Structured Query Parameters from Spec 002**
- Consume QueryParseResult interface output from Natural Language Search Processing
- Map businessType field directly to Google Places API type parameter
- Use location field for geocoding to get lat/lng center point for Nearby Search
- Transform filter parameters (rating, price, openNow) to Places API query parameters
- Leverage conversation context metadata for potential result personalization

**TypeScript Strict Type Safety**
- Define BusinessResult interface with all normalized fields from Places API response
- Create SearchRequest and SearchResponse interfaces for API endpoint contract
- Use Places API TypeScript definitions from @types/google.maps for type safety
- Export all types for reuse in Business Information Cards component (spec 004)
- Apply strict null checking for optional fields like photos and ratings

**React 18+ and Tailwind CSS**
- Prepare marker popup HTML using Tailwind utility classes for consistent styling with map UI
- Structure popup components for future extraction into dedicated React components
- Use semantic HTML in popup content for accessibility (h3 for business name, etc.)
- Apply mobile-first responsive classes for popup sizing on different screen sizes
- Follow existing Tailwind configuration and design tokens from spec 001

## Out of Scope

- Detailed business information cards or full business profile views (covered in spec 004)
- User location tracking or geolocation services for "near me" queries
- Directions or routing between locations (covered in spec 006)
- Multiple search result views (list view, grid view) beyond map markers
- Filtering UI controls or visual filter indicators (covered in spec 013)
- Persistent storage of search results or business data in database
- Real-time business data updates or live availability checking
- User authentication or personalized search results based on preferences
- Advanced search features like multi-location search or comparison tools
- Business claiming, reviews, or user-generated content features
