# Quick Start Guide - LocalHub MCP Server

## Installation

Dependencies are already installed. If needed, run:

```bash
npm install
```

## Running the Server

### Development Mode (with hot-reload)

```bash
npm run dev:server
```

The server will start on `http://localhost:3001`

### Run Frontend + Backend Together

```bash
npm run dev:all
```

This runs both:
- Frontend (Vite) on `http://localhost:5173`
- Backend (MCP Server) on `http://localhost:3001`

## Testing the Server

### Run All Server Tests

```bash
npm test -- server/
```

Expected output: **44 tests passing**

### Run Specific Test File

```bash
npm test -- server/parsers/query-parser.test.ts
```

## Using the API

### 1. Check Server Health

```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T08:00:00.000Z"
}
```

### 2. List Available Tools

```bash
curl -X POST http://localhost:3001/api/mcp/tools/list \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "tools": [
    {
      "name": "search_businesses",
      "description": "Use this when the user wants to find local businesses...",
      "inputSchema": { ... }
    }
  ]
}
```

### 3. Search for Businesses

```bash
curl -X POST http://localhost:3001/api/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "search_businesses",
      "arguments": {
        "query": "find 4-star coffee shops near downtown Seattle"
      }
    }
  }'
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
        "text": "{...full parsed result...}"
      }
    }
  ],
  "isError": false
}
```

## Example Queries

Try these queries to test different features:

```javascript
// Simple business search
{ "query": "find coffee shops near me" }

// With filters
{ "query": "4-star Italian restaurants open now" }

// With distance
{ "query": "gyms within 5 miles" }

// With attributes
{ "query": "restaurants with wifi and outdoor seating" }

// With price level
{ "query": "cheap sushi places in Seattle" }

// Multiple types
{ "query": "coffee shops or bakeries downtown" }

// Landmark reference
{ "query": "restaurants near Times Square" }

// With conversation context
{ "query": "find parking near there", "sessionId": "session-123" }
```

## Configuration

Edit `.env.local` to change settings:

```bash
# Server port
MCP_PORT=3001

# Confidence threshold for ambiguity detection
CONFIDENCE_THRESHOLD=0.6

# Session timeout (30 minutes in milliseconds)
SESSION_TIMEOUT=1800000
```

## Debugging

### Enable Debug Logging

Set environment variable:

```bash
DEBUG=localhub:* npm run dev:server
```

### Common Issues

**Port already in use:**
```bash
# Change MCP_PORT in .env.local
MCP_PORT=3002
```

**Tests failing:**
```bash
# Run tests with verbose output
npm test -- server/ --reporter=verbose
```

## Query Parser Examples

### Business Type Extraction

```javascript
// Input
"find mechanic near me"

// Output
{
  businessType: ['auto_repair'],
  location: { type: 'relative', value: 'near me' },
  confidence: 0.9
}
```

### Filter Parsing

```javascript
// Input
"$$$ restaurants with wifi open now"

// Output
{
  businessType: ['restaurant'],
  filters: {
    priceLevel: 3,
    openNow: true,
    attributes: ['wifi']
  }
}
```

### Conversation Context

```javascript
// First query
{ "query": "coffee shops in Seattle", "sessionId": "abc123" }
// Server remembers: previousLocations = ['Seattle']

// Second query (uses context)
{ "query": "find parking near there", "sessionId": "abc123" }
// Resolved to: "find parking near Seattle"
```

## Integration with ChatGPT

When integrated with ChatGPT:

1. ChatGPT sends natural language query to `/api/mcp/tools/call`
2. Server parses query into structured parameters
3. Server returns MCP-formatted response
4. ChatGPT uses parsed data to call Places API (Spec 003)
5. Results displayed on map (Spec 001)

## Next Steps

- **Spec 003**: Implement Google Places API integration
- **Map Integration**: Connect parsed output to map display
- **Result Display**: Show businesses as markers on map

## Useful Links

- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Server README](./README.md) - Detailed documentation
- [Implementation Summary](../agent-os/specs/002-natural-language-search/IMPLEMENTATION_SUMMARY.md)
