/**
 * MCP Protocol Type Definitions
 */

/**
 * JSON Schema definition for tool parameters
 */
export interface JSONSchema {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  description?: string;
  [key: string]: unknown;
}

/**
 * MCP Tool Definition
 */
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  _meta?: {
    embeddedResource?: {
      uri: string;
      mimeType: string;
    };
  };
}

/**
 * MCP Tool Request
 */
export interface MCPToolRequest {
  method: 'tools/call';
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

/**
 * MCP Content Item
 */
export interface MCPContentItem {
  type: 'text' | 'resource';
  text?: string;
  mimeType?: string;
  uri?: string;
  resource?: {
    uri: string;
    mimeType: string;
    text?: string;
  };
}

/**
 * MCP Tool Response
 */
export interface MCPToolResponse {
  content: MCPContentItem[];
  isError?: boolean;
}

/**
 * MCP Error Response
 */
export interface MCPErrorResponse extends MCPToolResponse {
  isError: true;
  content: [
    {
      type: 'text';
      text: string;
    }
  ];
}

/**
 * MCP List Tools Response
 */
export interface MCPListToolsResponse {
  tools: MCPToolDefinition[];
}
