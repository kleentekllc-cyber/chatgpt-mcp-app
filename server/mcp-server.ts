/**
 * MCP Server for Natural Language Search Processing
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MCPListToolsResponse, MCPToolRequest, MCPToolResponse } from './types/mcp.js';
import { parseQuery } from './parsers/query-parser.js';
import { formatMCPResponse } from './formatters/mcp-response-formatter.js';
import businessSearchRouter from './routes/business-search.js';
import photoProxyRouter from './routes/photo-proxy.js';
import placeDetailsRouter from './routes/place-details.js';
import directionsRouter from './routes/directions.js';
import { validateApiKeyOnStartup } from './lib/places-api-client.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Validate required environment variables
const requiredEnvVars = ['MCP_PORT', 'GOOGLE_PLACES_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Validate Google Places API key on startup
try {
  validateApiKeyOnStartup();
} catch (error) {
  console.error('Failed to validate Google Places API key on startup');
  process.exit(1);
}

const app = express();
const PORT = process.env.MCP_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Mount API routes
app.use('/api/search', businessSearchRouter);
app.use('/api/photo', photoProxyRouter);
app.use('/api/places', placeDetailsRouter);
app.use('/api/directions', directionsRouter);

/**
 * MCP Tool Definition for search_businesses
 */
const SEARCH_BUSINESSES_TOOL = {
  name: 'search_businesses',
  description:
    'Use this when the user wants to find local businesses, restaurants, or services in a specific area. Extracts business type, location, and filter preferences from natural language queries.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Natural language search query from the user (e.g., "find coffee shops near downtown")',
      },
      sessionId: {
        type: 'string',
        description: 'Optional session ID for conversation context tracking',
      },
    },
    required: ['query'],
  },
  _meta: {
    embeddedResource: {
      uri: 'localhub://map',
      mimeType: 'application/vnd.localhub.map+json',
    },
  },
};

/**
 * List Tools endpoint - Returns available MCP tools
 */
app.post('/api/mcp/tools/list', (_req: Request, res: Response) => {
  const response: MCPListToolsResponse = {
    tools: [SEARCH_BUSINESSES_TOOL],
  };
  res.json(response);
});

/**
 * Call Tool endpoint - Executes the requested tool
 */
app.post('/api/mcp/tools/call', async (req: Request, res: Response) => {
  try {
    const request = req.body as MCPToolRequest;

    if (!request.params || !request.params.name) {
      return res.status(400).json({
        content: [
          {
            type: 'text',
            text: 'Invalid request: missing tool name',
          },
        ],
        isError: true,
      });
    }

    if (request.params.name === 'search_businesses') {
      const { query, sessionId } = request.params.arguments as {
        query: string;
        sessionId?: string;
      };

      // Parse the query
      const parseResult = await parseQuery(query, sessionId);

      // Format as MCP response
      const mcpResponse = formatMCPResponse(parseResult);

      return res.json(mcpResponse);
    }

    // Unknown tool
    return res.status(404).json({
      content: [
        {
          type: 'text',
          text: `Unknown tool: ${request.params.name}`,
        },
      ],
      isError: true,
    });
  } catch (error) {
    console.error('Error processing tool call:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    return res.status(500).json({
      content: [
        {
          type: 'text',
          text: `Server error: ${errorMessage}`,
        },
      ],
      isError: true,
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Error handling middleware
 */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    content: [
      {
        type: 'text',
        text: 'Internal server error',
      },
    ],
    isError: true,
  });
});

/**
 * Start the server
 */
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`MCP Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

export { app, SEARCH_BUSINESSES_TOOL };
