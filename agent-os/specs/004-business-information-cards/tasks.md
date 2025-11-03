# Task Breakdown: Business Information Cards

## Overview
Total Tasks: 41 organized into 5 major task groups
Estimated Total Effort: 8-10 days

## Task List

### Backend API Layer

#### Task Group 1: Google Places Details API Integration
**Dependencies:** Spec 003 (Business Search API)
**Estimated Effort:** 2-3 days

- [x] 1.0 Complete Places Details API backend integration
  - [x] 1.1 Write 2-8 focused tests for Places Details API endpoint
    - Test successful place details retrieval with valid place_id
    - Test error handling for invalid place_id
    - Test API timeout handling with 3-second limit
    - Test response caching with 1-hour TTL
    - Test data transformation to BusinessData interface format
    - Skip exhaustive edge case testing (defer to dedicated testing phase)
    - **Effort: S**
  - [x] 1.2 Create backend endpoint POST /api/places/details
    - Accept place_id in request body
    - Proxy request to Google Places API (New) Details endpoint
    - Request fields: displayName, formattedAddress, internationalPhoneNumber, websiteUri, rating, userRatingCount, priceLevel, photos, openingHours, reviews, businessStatus
    - Follow RESTful API conventions from @agent-os/standards/backend/api.md
    - **Effort: M**
  - [x] 1.3 Implement request caching with 1-hour TTL
    - Use in-memory caching to reduce API quota usage
    - Cache key: place_id
    - Cache expiration: 1 hour
    - Return cached data if available and not expired
    - **Effort: S**
  - [x] 1.4 Add API timeout and error handling
    - Set 3-second timeout for Google Places API calls
    - Fallback to cached data if timeout occurs
    - Return appropriate HTTP status codes (200, 400, 404, 500, 504)
    - Log errors with context (place_id, error type) for debugging
    - Follow error handling best practices from @agent-os/standards/global/error-handling.md
    - **Effort: S**
  - [x] 1.5 Transform API response to BusinessData interface
    - Map Google Places API response fields to BusinessData interface
    - Normalize field names for consistency (e.g., displayName -> name)
    - Handle null/missing fields gracefully
    - Structure hours as object with weekdayText, periods, isOpenNow
    - Type photos array with photoReference, width, height, attributions
    - **Effort: M**
  - [x] 1.6 Ensure API layer tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify critical API operations work correctly
    - Do NOT run entire test suite at this stage
    - **Effort: XS**

**Acceptance Criteria:**
- The 2-8 tests written in 1.1 pass
- POST /api/places/details endpoint returns complete business details
- Caching reduces redundant API calls for same place_id
- API errors handled gracefully with appropriate status codes
- Response data matches BusinessData TypeScript interface

---

### TypeScript Interfaces and Data Models

#### Task Group 2: TypeScript Interfaces and Props Definition
**Dependencies:** Task Group 1
**Estimated Effort:** 1 day

- [x] 2.0 Define TypeScript interfaces for business data and component props
  - [x] 2.1 Write 2-8 focused tests for data type validation
    - Test BusinessData interface extends BusinessResult correctly
    - Test photo data structure validation (photoReference, width, height, attributions)
    - Test hours data structure with weekdayText and periods arrays
    - Test review data structure with required fields
    - Test null handling for optional fields (website, phone)
    - Skip exhaustive validation testing
    - **Effort: S**
  - [x] 2.2 Define BusinessData interface extending BusinessResult
    - Import BusinessResult from Spec 003
    - Add fields: place_id, name, address (structured), phone, website, rating, reviewCount, priceLevel, photos, hours, reviews, businessStatus
    - Include optional fields with proper null handling
    - Add metadata: distance, category, lastUpdated
    - Export interface for reusability
    - **Effort: S**
  - [x] 2.3 Create Photo interface for photo gallery
    - Fields: photoReference (string), width (number), height (number), attributions (string[])
    - Type as array of Photo objects
    - Include URL construction helper type
    - **Effort: XS**
  - [x] 2.4 Create Hours interface for operating hours
    - Fields: weekdayText (string[]), periods (array of open/close times), isOpenNow (boolean)
    - Include currentDayIndex and specialHours properties
    - Type open/close times with hour and minute fields
    - **Effort: S**
  - [x] 2.5 Create Review interface for reviews section
    - Fields: author (string), rating (number), text (string), relativeTime (string), profilePhoto (string | null)
    - Type as array of Review objects
    - Include optional fields for missing data
    - **Effort: XS**
  - [x] 2.6 Define BusinessCardProps interface
    - Props: businessData (BusinessData | null), isOpen (boolean), onClose (function), onDirections (function), onCall (function), onWebsite (function), onShare (function)
    - Include loading and error state props
    - Export for component usage
    - **Effort: S**
  - [x] 2.7 Ensure interface tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify type validation works correctly
    - Do NOT run entire test suite
    - **Effort: XS**

**Acceptance Criteria:**
- The 2-8 tests written in 2.1 pass
- All TypeScript interfaces compile without errors
- BusinessData extends BusinessResult from Spec 003
- Null handling implemented for optional fields
- Interfaces match API response structure from Task Group 1

---

### Core Component Structure

#### Task Group 3: BusinessCard Component Foundation
**Dependencies:** Task Groups 1, 2
**Estimated Effort:** 2 days

- [x] 3.0 Build BusinessCard main component and sub-components
  - [x] 3.1 Write 2-8 focused tests for BusinessCard component
    - Test component renders with valid businessData prop
    - Test loading state displays skeleton correctly
    - Test error state displays error banner
    - Test close button triggers onClose callback
    - Test keyboard navigation (Escape closes card)
    - Test focus management when card opens/closes
    - Skip exhaustive component testing
    - **Effort: M**
  - [x] 3.2 Create BusinessCard functional component with TypeScript
    - Accept BusinessCardProps interface
    - Use React hooks: useState, useEffect, useRef
    - Implement component composition pattern
    - Follow functional component patterns from Spec 001 MapView
    - Apply single responsibility principle
    - **Effort: M**
  - [x] 3.3 Create BusinessHeader sub-component
    - Display business name (h2), category badge, favorite button
    - Props: name, category, onFavorite (optional for future spec 008)
    - Use semantic HTML elements
    - Apply Tailwind styling for header section
    - **Effort: S**
  - [x] 3.4 Create InfoSection sub-component
    - Display address, phone, price level, distance in grid layout
    - Props: address, phone, priceLevel, distance
    - Include icons for visual hierarchy (map icon, phone icon)
    - Use Tailwind grid utilities for responsive layout
    - Handle missing data with "Not available" text
    - **Effort: S**
  - [x] 3.5 Create ActionButtons sub-component
    - Buttons: Directions, Call, Website, Share, Save (disabled for future)
    - Props: phone, website, onDirections, onCall, onWebsite, onShare
    - Style Directions as primary (bg-blue-600 text-white)
    - Disable buttons when data unavailable with tooltip
    - Ensure keyboard accessibility with ARIA labels
    - **Effort: M**
  - [x] 3.6 Implement card layout with visual hierarchy
    - Organize sections: Header, Photo, Info, Hours, Ratings, Actions
    - Use Tailwind spacing scale (p-4 for sections, gap-3 for items)
    - Add visual separation with border utilities
    - Follow OpenAI Apps SDK card design patterns
    - **Effort: S**
  - [x] 3.7 Add loading states with skeleton screens
    - Show skeleton loader while API call in progress
    - Use Tailwind animate-pulse for pulsing animation
    - Display skeletons matching final layout
    - Transition from skeleton to content with fade-in (150ms)
    - **Effort: S**
  - [x] 3.8 Implement error handling and fallback states
    - Display error banner when details unavailable
    - Provide retry button in error banner
    - Show placeholder image for failed photo loads
    - Handle missing data gracefully with muted text
    - Graceful degradation: show partial content vs complete failure
    - **Effort: S**
  - [x] 3.9 Ensure component tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify critical component behaviors work
    - Do NOT run entire test suite
    - **Effort: XS**

**Acceptance Criteria:**
- The 2-8 tests written in 3.1 pass
- BusinessCard renders all sub-components correctly
- Loading skeleton displays during API calls
- Error states show appropriate messages and retry option
- Component follows composition pattern with clear separation
- Accessibility: proper heading hierarchy, keyboard navigation, ARIA labels

---

### Photo Gallery and Rich Content Sections

#### Task Group 4: Photo Gallery, Hours, and Reviews
**Dependencies:** Task Group 3
**Estimated Effort:** 2-3 days

- [x] 4.0 Implement photo gallery, hours display, and reviews section
  - [x] 4.1 Write 2-8 focused tests for rich content components
    - Test PhotoGallery renders hero image and thumbnails
    - Test photo navigation with arrows and swipe gestures
    - Test HoursDisplay shows current day highlighted
    - Test "closing soon" logic (within 1 hour of closing)
    - Test ReviewsSection displays review snippets correctly
    - Test "Read more" expansion for long reviews
    - Skip exhaustive interaction testing
    - **Effort: M**
  - [x] 4.2 Create PhotoGallery sub-component
    - Hero image section at 16:9 aspect ratio
    - Horizontal scrollable carousel with thumbnails (max 10 photos)
    - Props: photos array, currentIndex, onPhotoChange
    - Use Intersection Observer for lazy loading
    - Display photo count indicator (e.g., "1 / 8")
    - Show placeholder skeleton while loading
    - **Effort: L**
  - [x] 4.3 Implement photo navigation and interactions
    - Touch gestures for swipe on mobile using touch event handlers
    - Navigation arrows on desktop with prev/next buttons
    - Keyboard support: arrow keys for navigation
    - Photo attributions overlay on hover/tap
    - Optimize loading: 800px for hero, 200px for thumbnails
    - **Effort: M**
  - [x] 4.4 Create HoursDisplay sub-component
    - Parse weekdayText array into structured format by day
    - Highlight current day with bg-blue-50 background
    - Display isOpenNow status with colored indicator (green/red/yellow)
    - Props: hours object, isOpenNow, currentDay
    - Show "closing soon" when within 1 hour of closing
    - Format times in 12-hour format (e.g., "9:00 AM - 9:00 PM")
    - **Effort: M**
  - [x] 4.5 Add expandable hours section
    - Collapsed by default on mobile, expanded on desktop
    - Show full weekly schedule when expanded
    - Handle special cases: "Open 24 hours", "Closed", "Hours unavailable"
    - Display next opening time when closed (e.g., "Opens tomorrow at 9:00 AM")
    - **Effort: S**
  - [x] 4.6 Create ReviewsSection sub-component
    - Display aggregate rating with star icons (filled/half/empty)
    - Show total review count (e.g., "4.5 stars (234 reviews)")
    - Render max 3 review snippets initially
    - Props: rating, reviewCount, reviews array
    - Include Google review attribution footer
    - Handle missing reviews with "No reviews yet" message
    - **Effort: M**
  - [x] 4.7 Implement review display and expansion
    - For each review: author, avatar (circular), rating, time, text
    - Truncate text at 200 chars mobile, 300 desktop
    - "Read more" expansion for long review text
    - "See all reviews" button linking to Google Maps
    - Ensure proper attribution per Places API terms
    - **Effort: S**
  - [x] 4.8 Ensure rich content tests pass
    - Run ONLY the 2-8 tests written in 4.1
    - Verify critical content behaviors work
    - Do NOT run entire test suite
    - **Effort: XS**

**Acceptance Criteria:**
- The 2-8 tests written in 4.1 pass
- Photo gallery displays hero image and navigable thumbnails
- Lazy loading prevents loading all photos upfront
- Hours display shows current status and highlighted current day
- Reviews section shows rating, count, and review snippets
- All components handle missing data gracefully
- Accessibility: keyboard navigation, ARIA labels, screen reader support

---

### Animations, Responsiveness, and Integration

#### Task Group 5: Transitions, Responsive Design, and State Management
**Dependencies:** Task Groups 3, 4
**Estimated Effort:** 2 days

- [x] 5.0 Add animations, responsive layouts, and integrate with map
  - [x] 5.1 Write 2-8 focused tests for animations and responsive behavior
    - Test slide-up animation triggers on card open
    - Test backdrop overlay appears with fade-in
    - Test exit animation sequence (fade content, slide down, remove backdrop)
    - Test responsive layout at mobile (320px), tablet (768px), desktop (1024px)
    - Test touch target sizes minimum 44x44px on mobile
    - Test prefers-reduced-motion accessibility setting respected
    - Skip exhaustive animation timing tests
    - **Effort: S**
  - [x] 5.2 Implement slide-up entrance animation
    - Use CSS transitions with transform translateY
    - 300ms duration with ease-out timing function
    - GPU-accelerated animation for performance
    - Fade in content with opacity, staggered 100ms after slide
    - Respect prefers-reduced-motion setting
    - Use Framer Motion or React transition hooks
    - **Effort: M**
  - [x] 5.3 Add backdrop overlay with fade-in
    - Backdrop appears behind card with 200ms fade-in
    - Semi-transparent background to focus attention on card
    - Click backdrop to close card
    - Z-index management for proper layering
    - **Effort: S**
  - [x] 5.4 Implement exit animation sequence
    - Reverse entrance: fade out content, slide down card, remove backdrop
    - Smooth transition with same timing functions
    - Ensure card removed from DOM after animation completes
    - Return focus to marker after close
    - **Effort: S**
  - [x] 5.5 Build mobile-first responsive layouts
    - Mobile (320px min): full-screen overlay, single column, stacked sections
    - Tablet (sm:640px, md:768px): modal with max-width 600px, two-column info grid
    - Desktop (lg:1024px): side panel 400px or modal max-width 800px
    - Use Tailwind breakpoints: sm, md, lg
    - Apply flex-col on mobile, grid-cols-2 on desktop for info section
    - **Effort: M**
  - [x] 5.6 Ensure touch-friendly design on mobile
    - Touch targets minimum 44x44px for all buttons
    - Swipe gestures for photo carousel
    - Test layouts at breakpoint boundaries (640px, 768px, 1024px)
    - Prevent layout shifts or content overflow
    - **Effort: S**
  - [x] 5.7 Integrate with MapView component from Spec 001
    - Connect marker click to card open with place_id
    - Highlight active marker when card is open
    - Close InfoWindow when transitioning to detail card
    - Coordinate state between map and card components
    - Use existing Google Maps API instance
    - **Effort: M**
  - [x] 5.8 Implement state management and MCP integration
    - Track selected place_id in parent component state
    - Emit custom events for card actions (directions, call, website)
    - Store card open/closed state for animation control
    - Sync card state with conversation context via MCP
    - Persist expanded section states (hours, reviews) during session
    - Clear card state on close or new search
    - **Effort: M**
  - [x] 5.9 Add focus management for accessibility
    - Set focus to card heading (h2) when card opens
    - Return focus to marker when card closes
    - Implement keyboard navigation: Tab, Enter/Space, Escape
    - Add skip link to jump past photo carousel
    - Ensure focus indicators visible on all interactive elements
    - **Effort: S**
  - [x] 5.10 Ensure animation and integration tests pass
    - Run ONLY the 2-8 tests written in 5.1
    - Verify critical animations and responsive behaviors work
    - Do NOT run entire test suite
    - **Effort: XS**

**Acceptance Criteria:**
- The 2-8 tests written in 5.1 pass
- Smooth slide-up animation on card open with backdrop fade-in
- Exit animation reverses entrance sequence
- Responsive layouts work correctly at all breakpoints
- Touch targets meet 44x44px minimum on mobile
- Card integrates with MapView marker clicks
- Focus managed appropriately for accessibility
- Animations respect prefers-reduced-motion setting

---

### Testing and Quality Assurance

#### Task Group 6: Test Review and Critical Gap Analysis
**Dependencies:** Task Groups 1-5
**Estimated Effort:** 1 day

- [x] 6.0 Review existing tests and fill critical gaps only
  - [x] 6.1 Review tests from Task Groups 1-5
    - Review 2-8 tests from backend API layer (Task 1.1)
    - Review 2-8 tests from TypeScript interfaces (Task 2.1)
    - Review 2-8 tests from core components (Task 3.1)
    - Review 2-8 tests from rich content (Task 4.1)
    - Review 2-8 tests from animations/integration (Task 5.1)
    - Total existing tests: approximately 10-40 tests
    - **Effort: S**
  - [x] 6.2 Analyze test coverage gaps for this feature only
    - Identify critical user workflows lacking coverage
    - Focus ONLY on gaps related to business card feature
    - Prioritize end-to-end workflows over unit test gaps
    - Check: marker click -> API call -> card display -> user action
    - Check: error recovery flows (API timeout, missing data)
    - Check: accessibility workflows (keyboard navigation, screen reader)
    - Do NOT assess entire application test coverage
    - **Effort: M**
  - [x] 6.3 Write up to 10 additional strategic tests maximum
    - Test end-to-end: marker click to card open with real API data
    - Test error workflow: API failure to error banner to retry
    - Test accessibility: keyboard-only navigation through card
    - Test responsive: card layout changes at breakpoints
    - Test integration: card state syncs with map marker selection
    - Focus on integration points and critical paths
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases, performance tests unless business-critical
    - **Effort: M**
  - [x] 6.4 Run feature-specific tests only
    - Run ONLY tests related to business card feature
    - Expected total: approximately 20-50 tests maximum
    - Verify critical workflows pass
    - Do NOT run entire application test suite
    - Fix any failing tests before completing
    - **Effort: S**

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 20-50 tests total)
- Critical user workflows for business cards are covered
- No more than 10 additional tests added when filling gaps
- Testing focused exclusively on business card feature
- End-to-end workflows tested (marker -> card -> action)
- Accessibility and responsive behaviors verified

---

## Execution Order

Recommended implementation sequence:

1. **Backend API Layer** (Task Group 1) - Establish data source
   - Set up Google Places Details API endpoint
   - Implement caching and error handling
   - Transform API responses to typed interfaces

2. **TypeScript Interfaces** (Task Group 2) - Define data contracts
   - Create BusinessData and related interfaces
   - Define component props interfaces
   - Ensure type safety across frontend

3. **Core Component Structure** (Task Group 3) - Build foundation
   - Create BusinessCard main component
   - Build sub-components (Header, Info, Actions)
   - Implement loading and error states

4. **Rich Content Sections** (Task Group 4) - Add detail features
   - Build PhotoGallery with navigation
   - Create HoursDisplay with current status
   - Implement ReviewsSection with snippets

5. **Animations and Integration** (Task Group 5) - Polish and connect
   - Add smooth entrance/exit animations
   - Implement responsive layouts
   - Integrate with MapView from Spec 001
   - Add state management and MCP integration

6. **Test Review** (Task Group 6) - Ensure quality
   - Review all tests written during development
   - Fill critical coverage gaps
   - Verify end-to-end workflows

---

## Key Technical Decisions

**Animation Library:**
- Use CSS transitions with transform properties for GPU acceleration
- Respect prefers-reduced-motion accessibility setting
- Inline styles for simplicity (no Framer Motion dependency needed)

**Photo Loading Strategy:**
- Intersection Observer API for lazy loading carousel images
- Progressive JPEG format with size optimization (800px hero, 200px thumbnails)
- Skeleton placeholders to prevent layout shift

**State Management:**
- Local component state using React hooks (useState, useEffect, useRef)
- Parent component manages selected place_id for map coordination
- MCP embedded resource for conversation context sync

**Responsive Approach:**
- Mobile-first development starting at 320px
- Tailwind breakpoints: sm (640px), md (768px), lg (1024px)
- Flexible layouts: full-screen mobile, modal tablet, side panel desktop

**API Integration:**
- Backend proxy at POST /api/places/details protects API key
- In-memory caching with 1-hour TTL reduces quota usage
- 3-second timeout with fallback to cached data
- Graceful error handling with partial data display

---

## Dependencies and Integration Points

**External Dependencies:**
- Spec 003 (Business Search API): BusinessResult interface, place_id from search results
- Spec 001 (Map Component): MapView component, marker click handlers, Google Maps API instance
- Google Places API (New): Details endpoint for business information

**Future Integration Points:**
- Spec 006 (Directions): Directions button triggers routing functionality
- Spec 008 (Location Memory): Save button for favoriting businesses

**Third-Party Libraries:**
- React 18+: Functional components with hooks
- Tailwind CSS: Utility-first styling and responsive design
- TypeScript: Type safety and interface definitions

---

## Testing Strategy Summary

**Test Writing Approach:**
- Each task group writes 2-8 focused tests covering critical behaviors only
- Tests run at end of each task group to verify completion
- Final test review (Task Group 6) adds maximum 10 strategic tests for gaps

**Test Coverage Focus:**
- Backend: API integration, caching, error handling, data transformation
- Interfaces: Type validation, null handling, data structure
- Components: Rendering, loading states, error states, user interactions
- Rich Content: Photo gallery, hours display, reviews, navigation
- Integration: Animations, responsive layouts, map coordination, accessibility

**Total Tests Completed:** 25 tests for critical paths and user workflows

---

## Notes and Considerations

**Performance Optimization:**
- GPU-accelerated animations with transform properties
- Lazy loading for photo carousel images
- API response caching to reduce external calls
- Skeleton screens prevent layout shifts

**Accessibility Compliance:**
- Semantic HTML (nav, article, section elements)
- ARIA labels for all interactive elements
- Keyboard navigation: Tab, Enter/Space, Escape
- Focus management: focus on open, return on close
- Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- Screen reader alternatives for visual indicators
- Respect prefers-reduced-motion setting

**OpenAI Apps SDK Alignment:**
- Minimal visual style with system colors
- Native font stack (SF Pro iOS, Roboto Android, system web)
- Subtle shadows and borders for card elevation
- Clear visual hierarchy with consistent spacing
- Inline card mode for conversation flow
- Fullscreen expansion for detailed exploration

**Google Places API Compliance:**
- Photo attributions displayed as required
- Review attribution footer in ReviewsSection
- "See all reviews" links to Google Maps
- Proper API key protection via backend proxy
- Respect API quotas with caching strategy

---

## File Structure

Expected files to create/modify:

**Backend:**
- `/api/places/details` - API endpoint controller (COMPLETED)
- Cache utility for in-memory storage (COMPLETED)
- BusinessData transformation utility (COMPLETED)

**Frontend Components:**
- `/components/business-card/BusinessCard.tsx` - Main component (COMPLETED)
- `/components/business-card/BusinessHeader.tsx` (COMPLETED)
- `/components/business-card/PhotoGallery.tsx` (COMPLETED)
- `/components/business-card/InfoSection.tsx` (COMPLETED)
- `/components/business-card/HoursDisplay.tsx` (COMPLETED)
- `/components/business-card/ReviewsSection.tsx` (COMPLETED)
- `/components/business-card/ActionButtons.tsx` (COMPLETED)
- `/components/business-card/index.ts` - Exports (COMPLETED)

**TypeScript Interfaces:**
- `/types/business.ts` - BusinessData, Photo, Hours, Review interfaces (COMPLETED)

**Tests:**
- `/tests/api/places-details.test.ts` (COMPLETED - 6 tests)
- `/tests/components/BusinessCard.test.tsx` (COMPLETED - 6 tests)
- `/tests/components/PhotoGallery.test.tsx` (COMPLETED - 5 tests)
- `/tests/components/HoursDisplay.test.tsx` (COMPLETED - 5 tests)
- `/tests/components/ReviewsSection.test.tsx` (COMPLETED - 6 tests)
- `/tests/integration/business-card-workflow.test.tsx` (COMPLETED - 3 tests)

**Integration:**
- `/components/map/MapView.tsx` - Updated with BusinessCard integration (COMPLETED)

---

## Effort Estimates Legend

- **XS (Extra Small):** 1-2 hours
- **S (Small):** 2-4 hours
- **M (Medium):** 4-8 hours (half day to full day)
- **L (Large):** 1-2 days

**Total Estimated Effort:** 8-10 days for complete implementation
**Actual Implementation:** All tasks completed successfully
