# Specification: Map Display Foundation

## Goal
Implement a fullscreen interactive map component that serves as the foundation for displaying local business search results within ChatGPT, providing smooth pan, zoom, and marker placement functionality with proper initialization and cleanup.

## User Stories
- As a user, I want to see an interactive map in fullscreen within ChatGPT so that I can visually explore local business locations
- As a user, I want to pan and zoom the map naturally so that I can focus on areas of interest
- As a developer, I want the map component to properly initialize and clean up so that there are no memory leaks or performance issues

## Specific Requirements

**Google Maps JavaScript API Integration**
- Initialize Google Maps JavaScript API with secure API key loaded from environment variables
- Use @googlemaps/react-wrapper or @vis.gl/react-google-maps for React integration
- Configure API to load only required libraries (maps, marker) to minimize bundle size
- Implement error handling for API load failures with user-friendly fallback messages
- Proxy API requests through backend to protect API key from client exposure
- Handle API quota and rate limiting scenarios gracefully

**React Component Architecture**
- Create MapContainer component as the main wrapper handling API initialization and MCP communication
- Create MapView component for rendering the actual map instance with controls
- Implement proper component lifecycle with useEffect for mount, unmount, and cleanup
- Use TypeScript with strict typing for all component props and state
- Follow single responsibility principle with separate concerns for MCP handling vs map rendering
- Keep state management local to components using useState, lift only when needed by parent
- Ensure components are reusable and configurable through clear, well-documented props

**ChatGPT Fullscreen Display Mode Integration**
- Configure component to render in fullscreen display mode as defined in OpenAI Apps SDK
- Integrate with MCP protocol to receive display mode instructions from ChatGPT
- Handle system composer overlay that remains visible in fullscreen mode
- Ensure proper z-index layering so map doesn't conflict with ChatGPT UI chrome
- Implement proper spacing and layout that works with the system composer at bottom
- Support conversational prompts that can trigger updates to map state
- Handle display mode transitions smoothly without flickering or layout shifts

**Pan and Zoom Functionality**
- Enable default Google Maps pan controls (drag to pan)
- Enable default Google Maps zoom controls (scroll wheel, pinch gestures, zoom buttons)
- Set sensible default zoom level (city-level view, approximately zoom 12-14)
- Set sensible default center point (user's location if available, fallback to major city)
- Maintain smooth 60fps performance during pan and zoom operations
- Support both mouse/trackpad and touch gestures for mobile devices
- Implement zoom constraints to prevent excessive zoom in/out beyond useful ranges

**Marker Placement System**
- Implement marker rendering capability using Google Maps Marker API
- Create reusable marker component that accepts position, label, and optional icon
- Support dynamic marker updates (add, remove, update) without full map re-render
- Prepare marker click event handling structure (to be used in future specs)
- Ensure markers are visible and performant even with multiple instances
- Use efficient marker clustering approach for future dense result sets (foundation only)

**Component Lifecycle and Cleanup**
- Implement proper useEffect cleanup functions to remove map instance on unmount
- Remove all event listeners attached to map instance during cleanup
- Clear any timers, intervals, or async operations on component unmount
- Prevent memory leaks by properly disposing of Google Maps objects
- Test component mount/unmount cycles to ensure no retained references
- Handle rapid component re-mounting gracefully (e.g., during development hot reload)

**Responsive Design**
- Implement mobile-first approach starting with mobile layout
- Use Tailwind CSS utility classes for styling with minimal custom CSS
- Ensure map fills available viewport space in fullscreen mode (100vw, 100vh minus composer)
- Make map controls touch-friendly with minimum 44x44px tap targets
- Test across mobile, tablet, and desktop screen sizes for consistent experience
- Adapt control positioning based on screen size (e.g., zoom controls placement)
- Ensure readable map labels and controls on small mobile screens

**Error Handling and Loading States**
- Display loading skeleton or spinner while Google Maps API loads
- Show clear error message if API fails to load with retry option
- Handle network timeout scenarios with user-friendly messaging
- Implement graceful degradation if geolocation permission is denied
- Log errors to console for debugging while showing simple messages to users
- Provide fallback static map or text message if interactive map cannot load

**State Management**
- Track map center position in component state for future persistence
- Track zoom level in component state for future persistence
- Track array of markers to display (empty initially, used in future specs)
- Use React Context or props for sharing map instance with potential child components
- Prepare state structure that can be synchronized with MCP messages
- Keep state minimal and focused only on what needs to be tracked

**Accessibility Foundations**
- Use semantic HTML elements where applicable (main, section)
- Ensure keyboard navigation works for map controls
- Provide ARIA labels for map controls and interactive elements
- Ensure sufficient color contrast for any custom UI overlays
- Manage focus appropriately when entering/exiting fullscreen mode
- Prepare for screen reader announcements for map updates (future enhancement)

## Visual Design

No visual mockups provided for this spec. Follow OpenAI Apps SDK fullscreen display mode guidelines:
- Use system-defined colors for any custom controls
- Maintain ChatGPT's minimal visual style
- Ensure map fills fullscreen space with system composer overlay visible
- Use platform-native fonts (SF Pro on iOS, Roboto on Android)
- Apply consistent spacing using Tailwind's spacing scale
- Avoid custom gradients or patterns that conflict with ChatGPT's aesthetic

## Existing Code to Leverage

**OpenAI Apps SDK Fullscreen Display Pattern**
- Reference SDK documentation for fullscreen mode implementation with system composer overlay
- Follow MCP protocol patterns for receiving display mode instructions
- Use embedded resource metadata to specify fullscreen display preference
- Maintain conversational context alongside fullscreen surface as documented
- Handle chat sheet and response patterns for composer interactions

**Tailwind CSS Framework**
- Use established Tailwind utility classes for responsive design (sm, md, lg breakpoints)
- Leverage Tailwind's spacing scale for consistent margins and padding
- Apply Tailwind's flexbox utilities for layout management
- Use Tailwind's responsive utilities for mobile-first development
- Follow project's Tailwind configuration for design tokens

**React 18+ Patterns**
- Use modern React hooks (useState, useEffect, useRef, useMemo) for state and lifecycle
- Implement functional components with TypeScript for type safety
- Follow React 18 concurrent rendering best practices
- Use StrictMode compatible patterns for double-render safety
- Leverage React's built-in error boundaries for error handling

**Google Maps JavaScript API Best Practices**
- Follow Google's recommended patterns for React integration
- Use official @googlemaps/react-wrapper or community @vis.gl/react-google-maps
- Implement lazy loading of map API to improve initial page load
- Use Google's marker and info window APIs according to documentation
- Follow Google's performance recommendations for map rendering

**TypeScript Strict Mode**
- Define explicit interfaces for all component props using TypeScript
- Type all state variables with proper TypeScript types
- Use strict null checks and avoid any types
- Define types for Google Maps API objects and events
- Export types for reuse in future components

## Out of Scope

- Business search functionality (search API integration happens in spec 002)
- Detailed business information popups or cards on marker clicks
- Marker clustering for dense result sets (foundation only, clustering in spec 003)
- User location tracking or geolocation services integration
- Directions or routing functionality between locations
- Multiple map layers or map type switching (satellite, terrain)
- Drawing tools or custom overlays on the map
- Street View integration or panorama views
- Offline map caching or progressive web app features
- Advanced map customization (custom map styles, themes)
