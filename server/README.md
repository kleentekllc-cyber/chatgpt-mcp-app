# LocalHub MCP Server - Natural Language Search Processing

This directory contains the MCP (Model Context Protocol) server implementation for LocalHub's natural language search processing feature. The server parses conversational search queries from ChatGPT into structured parameters for business search API consumption.

## Architecture

### Directory Structure

```
server/
├── constants/           # Business type definitions and synonyms
│   └── business-types.ts
├── context/            # Conversation context management
│   └── conversation-context.ts
├── formatters/         # MCP response formatting
│   └── mcp-response-formatter.ts
├── parsers/            # Query parsing logic
│   ├── business-type-parser.ts
│   ├── filter-parser.ts
│   ├── location-parser.ts
│   └── query-parser.ts
├── types/              # TypeScript type definitions
│   ├── mcp.ts
│   └── query-parser.ts
├── validators/         # Input validation and sanitization
│   ├── ambiguity-detector.ts
│   └── input-validator.ts
├── tests/              # Strategic integration tests
│   └── integration.test.ts
└── mcp-server.ts       # Main MCP server entry point
```

## Features

### Natural Language Query Parsing

The server extracts structured parameters from conversational queries:

- **Business Types**: Recognizes 25+ business categories and maps synonyms (e.g., "mechanic" → "auto_repair")
- **Location Extraction**: Handles explicit locations, landmarks, relative phrases, and distance specifications
- **Filter Parsing**: Extracts ratings, price levels, temporal filters, and attributes
- **Conversation Context**: Tracks location mentions and resolves pronoun references

### MCP Protocol Compliance

- Implements `list_tools` and `call_tool` capabilities
- Returns responses as MCP content arrays with proper MIME types
- Includes embedded resource metadata for map display integration
- Provides user-friendly error messages with `isError` flag

### Input Validation & Security

- Validates query length (max 500 characters)
- Sanitizes HTML tags and special characters
- Detects malformed or nonsensical queries
- Validates extracted parameters against allowlists

### Ambiguity Detection

- Identifies missing critical parameters
- Detects ambiguous location names (e.g., "Portland" without state)
- Generates clarifying questions for low-confidence extractions
- Returns partial results with confidence scores

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# MCP Server Configuration
MCP_PORT=3001
CONFIDENCE_THRESHOLD=0.6
SESSION_TIMEOUT=1800000  # 30 minutes in milliseconds
```

## API Endpoints

### POST /api/mcp/tools/list

Returns available MCP tools.

**Response:**
```json
{
  "tools": [
    {
      "name": "search_businesses",
      "description": "Use this when the user wants to find local businesses...",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": { "type": "string" },
          "sessionId": { "type": "string" }
        },
        "required": ["query"]
      }
    }
  ]
}
```

### POST /api/mcp/tools/call

Executes the search_businesses tool.

**Request:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "search_businesses",
    "arguments": {
      "query": "find 4-star coffee shops near downtown Seattle",
      "sessionId": "optional-session-id"
    }
  }
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Looking for: coffee_shop\nLocation: downtown seattle\nRating: 4+ stars"
    },
    {
      "type": "resource",
      "resource": {
        "uri": "localhub://search-result",
        "mimeType": "application/json",
        "text": "{...parsed query result...}"
      }
    }
  ],
  "isError": false
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T08:00:00.000Z"
}
```

## Query Parsing Examples

### Business Type Extraction

```typescript
// Input: "find Italian restaurants"
// Output: { types: ['restaurant'], confidence: 0.9 }

// Input: "mechanic or auto repair shop"
// Output: { types: ['auto_repair'], confidence: 0.9 }
```

### Location Extraction

```typescript
// Input: "coffee shops in Seattle"
// Output: { type: 'explicit', value: 'Seattle', confidence: 0.9 }

// Input: "restaurants near me"
// Output: { type: 'relative', value: 'near me', confidence: 0.9 }

// Input: "gyms within 5 miles"
// Output: {
//   type: 'relative',
//   value: 'near me',
//   distance: { value: 5, unit: 'miles' },
//   confidence: 0.85
// }
```

### Filter Extraction

```typescript
// Input: "4-star restaurants open now with wifi"
// Output: {
//   filters: {
//     rating: 4,
//     openNow: true,
//     attributes: ['wifi']
//   },
//   confidence: 0.9
// }
```

## Conversation Context

The server maintains in-memory conversation context for each session:

- Tracks up to 5 most recent location mentions
- Resolves pronoun references ("near there" → last mentioned location)
- Automatically expires after 30 minutes of inactivity
- No database persistence required

```typescript
// First query: "coffee shops in Seattle"
// Context stored: previousLocations = ['Seattle']

// Second query: "find parking near there"
// Resolved to: "find parking near Seattle"
```

## Testing

The implementation includes 44 focused tests covering:

- MCP server initialization (4 tests)
- Business type extraction (5 tests)
- Location parsing (5 tests)
- Filter extraction (5 tests)
- Input validation (5 tests)
- Query parser integration (5 tests)
- MCP response formatting (5 tests)
- Strategic integration scenarios (10 tests)

Run server tests:
```bash
npm test -- server/
```

## Running the Server

### Development Mode

```bash
npm run dev:server
```

This starts the server with hot-reload using tsx watch.

### Production Build

```bash
npm run build:server
node dist/server/mcp-server.js
```

### Run with Frontend

```bash
npm run dev:all
```

This runs both the frontend (Vite) and backend (MCP server) concurrently.

## Integration Points

### With Spec 001 (Map Display Foundation)

- Parsed location drives map centering
- Conversation context enables "near that restaurant" queries
- Structured output updates map view

### With Spec 003 (Business Search API)

- `businessType` determines which Places API endpoint to call
- `location` string passed to geocoding service
- `filters` object translated to Places API query parameters

## Error Handling

The server implements graceful error handling:

- **Validation Errors**: Returns user-friendly messages for invalid input
- **Parsing Failures**: Returns partial results when possible
- **Ambiguity Detection**: Generates clarifying questions
- **Server Errors**: Logs context and returns generic error message

## Performance Considerations

- In-memory context storage (no database queries)
- Minimal parsing overhead (pattern matching only)
- Automatic cleanup of stale contexts every 10 minutes
- No external API calls during parsing

## Future Enhancements

- Machine learning for improved entity extraction
- Multi-language support
- Advanced geospatial query understanding
- Persistent conversation history
- Rate limiting and quota management
