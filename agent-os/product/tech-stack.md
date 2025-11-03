# Tech Stack

## Framework & Runtime
- **Application Framework:** OpenAI Apps SDK (MCP-based architecture)
- **Language/Runtime:** Node.js (v18+)
- **Package Manager:** npm or yarn

## Frontend
- **JavaScript Framework:** React 18+ (recommended by OpenAI Apps SDK)
- **Language:** TypeScript 5+ for type safety and better developer experience
- **CSS Framework:** Tailwind CSS for utility-first styling with consistent design system
- **UI Components:** Custom components built on shadcn/ui or Headless UI for accessibility
- **Build Tool:** Vite for fast development and optimized production builds
- **State Management:** React Context API or Zustand for lightweight state management

## Maps & Location Services
- **Maps Display:** Google Maps JavaScript API or Mapbox GL JS for interactive map rendering
- **Geocoding:** Google Geocoding API for address and location resolution
- **Places Data:** Google Places API (New) for business search, details, photos, and reviews
- **Directions:** Google Directions API for routing and navigation between locations
- **Alternative:** Mapbox APIs (if preferring Mapbox over Google Maps ecosystem)

## Backend & API Layer
- **API Framework:** Express.js or Next.js API routes for backend endpoints
- **MCP Server:** OpenAI Apps SDK MCP server implementation for ChatGPT integration
- **HTTP Client:** Axios or native fetch for external API requests
- **Environment Config:** dotenv for managing API keys and configuration

## Natural Language Processing
- **Query Parsing:** Custom NLP utilities leveraging ChatGPT's understanding passed via MCP
- **Context Management:** Session state tracking for conversational continuity
- **Intent Recognition:** Pattern matching and entity extraction for search queries

## Testing & Quality
- **Test Framework:** Vitest or Jest for unit and integration testing
- **Component Testing:** React Testing Library for component behavior tests
- **E2E Testing:** Playwright for end-to-end ChatGPT app flows
- **Linting/Formatting:** ESLint with TypeScript support, Prettier for consistent code style
- **Type Checking:** TypeScript compiler with strict mode enabled

## Development Tools
- **Hot Reload:** Vite HMR for instant feedback during development
- **API Mocking:** MSW (Mock Service Worker) for API testing and development
- **Debugging:** React DevTools and browser developer tools
- **Version Control:** Git with conventional commits

## Deployment & Infrastructure
- **Hosting:** Vercel, Netlify, or Cloudflare Pages for frontend deployment
- **API Hosting:** Vercel serverless functions, AWS Lambda, or dedicated Node.js server
- **CDN:** Automatic via hosting platform for static assets
- **Environment Variables:** Platform-specific environment management (Vercel env, etc.)
- **SSL/HTTPS:** Automatic via hosting platform (required for geolocation features)

## Third-Party Services
- **Maps Provider:** Google Cloud Platform (Maps, Places, Directions APIs) or Mapbox
- **API Key Management:** Environment variables with platform secrets management
- **Error Monitoring:** Sentry for production error tracking and debugging
- **Analytics:** Google Analytics 4 or PostHog for usage insights (privacy-focused)

## Security & Performance
- **API Key Protection:** Backend proxy for API calls to hide keys from client
- **Rate Limiting:** Request throttling to prevent API quota exhaustion
- **Caching:** Browser caching and in-memory cache for repeated searches
- **Bundle Optimization:** Code splitting and lazy loading for faster initial loads
- **CORS Configuration:** Proper CORS setup for ChatGPT app communication

## ChatGPT App Specific
- **Display Mode:** Fullscreen mode for map view (primary) with Picture-in-Picture option
- **MCP Protocol:** OpenAI Model Context Protocol for ChatGPT ↔ app communication
- **OAuth (if needed):** OpenAI OAuth flow for user authentication and personalization
- **App Manifest:** Configuration file defining app capabilities and permissions
- **WebSocket/SSE:** For real-time updates if implementing live search or notifications

## Documentation
- **Code Documentation:** TSDoc comments for TypeScript interfaces and functions
- **API Documentation:** OpenAPI/Swagger spec for backend endpoints
- **Developer Guide:** README with setup, architecture, and contribution guidelines
- **Architecture Diagrams:** Mermaid or similar for visualizing system design
