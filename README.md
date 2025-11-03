# LocalHub - Local Business Discovery

A ChatGPT-integrated application for discovering local businesses using interactive Google Maps.

## Features

- Interactive fullscreen map display within ChatGPT
- Pan and zoom functionality with smooth 60fps performance
- Marker placement system for business locations
- Responsive design for mobile, tablet, and desktop
- Error handling with retry mechanism
- Accessibility features (keyboard navigation, ARIA labels)

## Tech Stack

- **Frontend Framework:** React 19+ with TypeScript
- **Build Tool:** Vite
- **Maps Integration:** Google Maps JavaScript API via @vis.gl/react-google-maps
- **Styling:** Tailwind CSS 4.x
- **Testing:** Vitest with React Testing Library
- **ChatGPT Integration:** OpenAI Apps SDK with MCP protocol

## Prerequisites

- Node.js 18+ and npm
- Google Maps API key ([Get one here](https://console.cloud.google.com/google/maps-apis/))

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Google Maps API Key
# Get your API key from: https://console.cloud.google.com/google/maps-apis/
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important:** Replace `your_actual_api_key_here` with your actual Google Maps API key.

### 3. Enable Required Google Maps APIs

In the Google Cloud Console, enable the following APIs:
- Maps JavaScript API
- Places API (for future business search features)

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI

## Project Structure

```
src/
├── components/
│   └── map/
│       ├── MapContainer.tsx      # Main map wrapper with API initialization
│       ├── MapView.tsx           # Google Maps rendering component
│       ├── Marker.tsx            # Individual marker component
│       ├── MapLoadingSkeleton.tsx # Loading state component
│       ├── MapError.tsx          # Error state component
│       └── *.test.tsx            # Component tests
├── lib/
│   ├── api/
│   │   └── maps.ts               # Google Maps API client
│   └── mcp/
│       └── displayHandler.ts     # ChatGPT MCP communication handler
├── types/
│   └── google-maps.d.ts          # TypeScript type definitions
├── test/
│   └── setup.ts                  # Test configuration
├── App.tsx                       # Root application component
├── main.tsx                      # Application entry point
└── index.css                     # Global styles
```

## Usage

### Basic Map Display

The map automatically loads in fullscreen mode when the app starts. Default view is centered on San Francisco with zoom level 12.

### Pan and Zoom

- **Pan:** Click and drag the map
- **Zoom:** Use mouse scroll wheel, pinch gestures, or the zoom controls
- **Keyboard:** Use arrow keys and +/- keys for navigation

### Error Handling

If the map fails to load:
1. Check that your Google Maps API key is correctly configured in `.env.local`
2. Verify the API key is enabled in Google Cloud Console
3. Click the "Retry" button to attempt reloading
4. Check browser console for detailed error messages

## ChatGPT Integration

This application is designed to work within ChatGPT's fullscreen display mode using the Model Context Protocol (MCP).

### Display Mode

The map renders in fullscreen with the ChatGPT system composer overlay visible at the bottom, allowing users to continue conversational interactions while viewing the map.

### Future Capabilities (Upcoming Specs)

- Search for businesses via conversational prompts
- Update map location through chat commands
- Display business information from search results
- Marker clustering for dense result sets

## Testing

The project includes comprehensive tests covering:
- API configuration and error handling
- Map component lifecycle and cleanup
- Marker rendering and updates
- Loading and error states
- End-to-end integration scenarios

Run tests with:

```bash
npm test
```

## Accessibility

- Semantic HTML elements (main, section)
- ARIA labels for map controls and interactive elements
- Keyboard navigation support
- Sufficient color contrast
- Touch-friendly controls (44x44px minimum)
- Focus management for fullscreen mode transitions

## Performance

- Target: 60fps during pan and zoom operations
- Initial load time: < 3 seconds on 4G connection
- Lazy loading of Google Maps API
- Efficient marker updates without full re-renders
- Proper cleanup to prevent memory leaks

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Android Chrome)

## Troubleshooting

### Map Not Loading

1. Check `.env.local` file exists with valid API key
2. Verify API key has Maps JavaScript API enabled
3. Check browser console for specific error messages
4. Ensure no ad blockers are interfering with Google Maps

### Development Server Issues

1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check Node.js version: `node --version` (should be 18+)

## License

ISC

## Next Steps

See `agent-os/specs/002-business-search-integration/` for upcoming features including:
- Business search functionality
- Search results display with markers
- Business detail popups
- Integration with search APIs
