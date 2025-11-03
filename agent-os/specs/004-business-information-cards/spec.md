# Specification: Business Information Cards

## Goal
Create a comprehensive business detail card component that displays rich business information including photos, hours, ratings, and reviews, with smooth transitions from map markers and mobile-responsive design for an optimal user experience within ChatGPT.

## User Stories
- As a user, I want to click a map marker to see detailed business information so that I can make informed decisions about visiting
- As a user, I want to see business photos, hours, ratings, and reviews in an organized layout so that I can quickly assess if the business meets my needs
- As a user, I want smooth transitions between map view and detail view so that the experience feels polished and native

## Specific Requirements

**BusinessCard React Component Structure**
- Create BusinessCard as main functional component accepting business data props with TypeScript interface
- Implement component composition with sub-components: BusinessHeader, PhotoGallery, InfoSection, HoursDisplay, ReviewsSection, ActionButtons
- Use React hooks (useState, useEffect, useRef) for local state management and lifecycle handling
- Apply single responsibility principle with each sub-component handling one distinct UI concern
- Export TypeScript interface BusinessCardProps for type safety and reusability across application
- Keep component encapsulated with internal state for photo carousel position, expanded sections, and loading states
- Follow functional component patterns consistent with MapView and MapContainer from spec 001

**Business Data Structure and Props Interface**
- Define BusinessData interface extending from BusinessResult interface in spec 003
- Include fields: place_id, name, address (structured), phone, website, rating, reviewCount, priceLevel, photos array, hours (structured), reviews array, businessStatus
- Type photos as array of objects with photoReference, width, height, attributions
- Structure hours as object with weekdayText array, periods array with open/close times, isOpenNow boolean
- Type reviews as array with author, rating, text, relativeTime, profilePhoto
- Include optional fields with proper null handling for missing data (e.g., website may be null)
- Add metadata fields: distance from search center, category, lastUpdated timestamp

**Smooth Transition Animations from Map View**
- Implement slide-up animation using CSS transitions when card opens from marker click (300ms duration)
- Use transform translateY for performant GPU-accelerated animations instead of position changes
- Apply ease-out timing function for natural feel on card entrance
- Fade in card content with opacity transition staggered 100ms after slide animation begins
- Add backdrop overlay with fade-in animation (200ms) to focus attention on card
- Implement exit animation with reverse sequence: fade out content, slide down card, remove backdrop
- Use React transition hooks or Framer Motion library for declarative animation state management
- Ensure animations respect user's prefers-reduced-motion accessibility setting

**Mobile-First Responsive Layout Design**
- Start with mobile layout (320px minimum width) using full viewport width for card
- Apply Tailwind breakpoints: sm (640px) for small tablets, md (768px) for tablets, lg (1024px) for desktop
- On mobile: full-screen card overlay with close button, single column layout, stacked sections
- On tablet: modal-style card with max width 600px, centered with backdrop, two-column info grid
- On desktop: side panel card (400px width) alongside map, or modal with max width 800px
- Use Tailwind flex and grid utilities for responsive section layouts (flex-col on mobile, grid-cols-2 on desktop)
- Ensure touch targets minimum 44x44px on mobile for buttons and interactive elements
- Test layouts at breakpoint boundaries to prevent layout shifts or content overflow

**Google Places Details API Integration**
- Call Google Places API (New) Details endpoint when marker is clicked using place_id from spec 003
- Request fields: displayName, formattedAddress, internationalPhoneNumber, websiteUri, rating, userRatingCount, priceLevel, photos, openingHours, reviews, businessStatus
- Proxy API calls through backend endpoint POST /api/places/details to protect API key
- Implement request caching with 1-hour TTL in memory to reduce API quota usage for repeat views
- Set 3-second timeout for API calls with fallback to cached or partial data if timeout occurs
- Transform API response to BusinessData interface format with consistent field naming
- Handle API errors gracefully by showing card with available data from marker popup (spec 003) and error indicator

**Photo Gallery and Carousel Component**
- Implement hero image section at top of card displaying primary business photo at 16:9 aspect ratio
- Create horizontal scrollable photo carousel with thumbnails below hero image (max 10 photos)
- Use Intersection Observer API for lazy loading of carousel images as user scrolls
- Implement touch gestures for swipe navigation on mobile using touch event handlers
- Add navigation arrows on desktop (prev/next buttons) with keyboard support (arrow keys)
- Display photo attributions as overlay on hover/tap following Google Places API requirements
- Optimize photo loading with progressive JPEG and appropriate size parameters (800px width for hero, 200px for thumbnails)
- Show placeholder skeleton while photos load to prevent layout shift

**Operating Hours Display Logic and UI**
- Parse openingHours.weekdayText array from Places API into structured format by day
- Highlight current day in hours list with different background color (Tailwind bg-blue-50)
- Display isOpenNow status prominently with colored indicator (green for open, red for closed, yellow for closing soon)
- Implement "closing soon" logic: check if current time is within 1 hour of closing time
- Add expandable section for full weekly hours (collapsed by default on mobile, expanded on desktop)
- Format times in user's local timezone and 12-hour format (e.g., "9:00 AM - 9:00 PM")
- Handle special hours cases: "Open 24 hours", "Closed", "Hours unavailable"
- Show next opening time when business is currently closed (e.g., "Opens tomorrow at 9:00 AM")

**Rating and Review Display Component**
- Display aggregate rating as large number (e.g., "4.5") with star icons (filled/half-filled/empty) using visual representation
- Show total review count next to rating (e.g., "4.5 stars (234 reviews)")
- Render review snippets in scrollable section with max 3 reviews visible initially
- For each review show: author name, author avatar (circular), star rating, relative time, review text excerpt
- Implement "Read more" expansion for long review text (truncate at 200 characters on mobile, 300 on desktop)
- Add "See all reviews" button linking to Google Maps review page with proper attribution
- Handle missing reviews gracefully with message "No reviews yet" and hide section if no rating data
- Include Google review attribution footer as required by Places API terms of service

**Action Buttons and External Links**
- Create action button row at bottom of card with primary CTAs: Directions, Call, Website
- Style Directions button as primary action (Tailwind bg-blue-600 text-white) with icon
- Implement Call button with tel: protocol link that triggers phone dialer on mobile devices
- Add Website button opening business website in new tab with proper rel="noopener noreferrer"
- Show Share button allowing users to copy business link or share via native share API
- Include "Save to list" button for future feature integration (spec 008 - Location Memory)
- Disable buttons gracefully when data unavailable (e.g., no phone number, no website) with tooltip explanation
- Ensure buttons are accessible via keyboard navigation with proper focus indicators and ARIA labels

**Card Layout Sections and Visual Hierarchy**
- Organize card into clear sections with visual separation using Tailwind border utilities
- Header section: business name (h2), category badge, favorite button (icon only)
- Hero photo section: full-width image with photo count indicator (e.g., "1 / 8")
- Info grid section: address with map icon, phone with phone icon, price level, distance from user
- Hours section: current status badge, today's hours, expandable full schedule
- Ratings section: star rating display, review count, review snippets
- Actions section: button row with primary and secondary actions
- Use consistent spacing with Tailwind spacing scale (p-4 for sections, gap-3 for items)

**Loading States and Skeleton Screens**
- Show skeleton loader while Places Details API call is in progress (200-500ms typical)
- Implement pulsing animation on skeleton elements using Tailwind animate-pulse
- Display skeletons matching final layout: rectangular blocks for photos, lines for text content
- Show action buttons in disabled state during loading to maintain layout stability
- Transition from skeleton to real content with subtle fade-in animation (150ms)
- Handle partial data loading: show available fields immediately, update as more data loads
- Display loading spinner in photo gallery while images are being fetched

**Error Handling and Fallback States**
- Handle Places Details API failure by showing card with data from marker popup (spec 003 basic info)
- Display error banner at top of card when full details unavailable: "Some details couldn't be loaded"
- Provide retry button in error banner to attempt API call again
- Show placeholder image when business photos fail to load (generic storefront illustration)
- Handle missing data gracefully with "Not available" text in muted color for empty fields
- Log errors to console with context (place_id, error type) for debugging without exposing to user
- Implement graceful degradation: show partial card content rather than failing completely

**Accessibility and Keyboard Navigation**
- Use semantic HTML elements: nav for action buttons, article for card container, section for major areas
- Provide descriptive ARIA labels for all interactive elements (buttons, links, expandable sections)
- Ensure proper heading hierarchy: h2 for business name, h3 for section headings
- Implement keyboard navigation: Tab to navigate, Enter/Space to activate, Escape to close card
- Manage focus appropriately: set focus to card heading when opened, return to marker when closed
- Add skip link to jump past photo carousel for keyboard users
- Ensure color contrast ratios meet WCAG AA standards (4.5:1 for text, 3:1 for UI components)
- Provide text alternatives for star ratings and status indicators for screen readers

**State Management and MCP Integration**
- Track selected business place_id in parent component state to coordinate map marker and card display
- Emit custom events when card actions are triggered (directions clicked, call clicked) for MCP tool calls
- Store card open/closed state in component to control animation and visibility
- Sync card state with conversation context via MCP embedded resource updates
- Handle card updates when user refines search from conversation without full page reload
- Persist expanded section states (hours, reviews) during user session using React state
- Clear card state when user closes card or starts new search query

## Visual Design

No visual mockups provided for this spec. Follow OpenAI Apps SDK inline card and fullscreen display guidelines:

**OpenAI Apps SDK Card Design Patterns**
- Use inline card display mode for compact card shown in conversation flow
- Implement expand button to open fullscreen mode for detailed exploration with map alongside
- Follow ChatGPT's minimal visual style with system-defined colors and native fonts
- Apply consistent spacing and padding using standard Tailwind spacing scale (4, 6, 8 units)
- Use SF Pro font on iOS, Roboto on Android, system font stack on web
- Avoid custom gradients or decorative elements that conflict with ChatGPT aesthetic
- Maintain clear visual hierarchy with appropriate font sizes (text-2xl for name, text-base for body)
- Use subtle shadows and borders (shadow-lg, border-gray-200) for card elevation

## Existing Code to Leverage

**BusinessResult Interface from Spec 003**
- Extend BusinessResult interface defined in Business Search API Integration with additional detail fields
- Reuse normalized data structure for place_id, name, location, rating, address fields
- Leverage photo reference and URL construction patterns from marker popup implementation
- Apply same data transformation approach for price level and rating formatting
- Build on existing backend proxy endpoint structure to add Places Details API call

**MapView Component from Spec 001**
- Integrate card open/close logic with marker click handlers in MapView component
- Use same Google Maps API instance and initialization patterns for consistent behavior
- Apply marker selection state to highlight active marker when card is open
- Coordinate InfoWindow closing when transitioning to full detail card
- Reuse event listener patterns and cleanup logic for memory leak prevention

**Tailwind CSS Responsive Patterns**
- Use established Tailwind breakpoints (sm, md, lg) consistent with map component
- Apply mobile-first utility classes following same approach as spec 001 (flex-col, grid-cols-1)
- Leverage Tailwind's spacing scale and design tokens defined in project configuration
- Use Tailwind animation utilities (transition, duration, ease-out) for smooth interactions
- Follow Tailwind color palette for consistent brand colors (blue-600, gray-700, green-500)

**React 18+ Component Patterns**
- Use functional components with hooks following patterns from MapContainer and MapView
- Apply useState for photo carousel index, expanded sections, and loading states
- Implement useEffect for Places Details API calls when card opens with place_id dependency
- Use useRef for DOM references (carousel container, scroll position tracking)
- Follow React 18 concurrent rendering best practices for smooth UI updates

**MCP Embedded Resource Metadata**
- Structure card as embedded resource linked to search_businesses tool result from spec 002
- Include component description metadata for ChatGPT in-conversation discovery
- Handle tool call responses for action buttons (directions triggers directions tool from spec 006)
- Update embedded resource state when user interacts with card to maintain conversation context

## Out of Scope

- Directions routing functionality and turn-by-turn navigation (covered in spec 006)
- User reviews submission or business claiming features
- Persistent storage of favorite or saved businesses (covered in spec 008)
- Multiple business comparison view or side-by-side cards
- Advanced photo editing or filtering in gallery
- Business hour editing or reporting incorrect information
- Integration with calendar for booking or reservations
- Social sharing beyond basic URL sharing
- Offline caching of business details for progressive web app
- Custom map styles or themes in card header map thumbnail
