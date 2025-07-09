# YouTube MCP Server Instructions

## Project Overview
This is an XMCP (Extended Model Context Protocol) server that provides YouTube integration tools. The project uses the XMCP framework's automatic tool discovery pattern where tools are defined in `src/tools/` and automatically registered.

The XMCP framework is brand new, so you need to always #fetch the docs from https://xmcp.dev/docs before you start working on any request.

## Architecture & Key Components

### Tool Structure Pattern
Each tool in `src/tools/` follows this exact pattern:
```typescript
// Required exports: schema, metadata, default function
export const schema = { /* Zod schema for parameters */ };
export const metadata = { name, description, annotations };
export default async function toolName({ params }: InferSchema<typeof schema>) {
  return { content: [{ type: "text", text: result }] };
}
```

### Dual Implementation Approach
The project maintains two parallel implementations:
- **XMCP tools** (`src/tools/`): Modern structured approach using automatic discovery
- **Legacy MCP server** (`server.ts`): Direct MCP protocol implementation for compatibility

When adding features, update BOTH implementations to maintain consistency.

## Current Tools
- `search_youtube`: Search YouTube videos with configurable result limits (1-50)
- `get_youtube_transcript`: Extract video transcripts using youtubei.js

## Development Workflows

### Adding New Tools
1. Create `src/tools/new-tool.ts` with required exports (schema, metadata, default function)
2. Add corresponding implementation to `server.ts` in tools/call handler
3. Test with `pnpm dev` (starts HTTP server on port 3002)

### Key Dependencies
- `youtubei.js`: YouTube API client (creates Innertube instances)
- `xmcp`: Framework for MCP server creation with tool auto-discovery
- `zod`: Schema validation for tool parameters

### Configuration
- `xmcp.config.ts`: Server configuration (HTTP port 3002)
- `mcp.json`: Client configuration for connecting to the server

### Testing & Debugging
- Use `pnpm dev` for development server with hot reload
- Server logs redirect to stderr to avoid interfering with MCP protocol
- Test tools via MCP client or direct HTTP requests to localhost:3002

## Project-Specific Patterns

### YouTube API Integration
Always use `Innertube.create({ generate_session_locally: true })` for YouTube API access. Handle transcript unavailability gracefully with descriptive error messages.

### Error Handling
Tools should throw errors with clear messages - the XMCP framework handles MCP error response formatting automatically.

### Response Format
All tools return `{ content: [{ type: "text", text: string }] }` format for consistency with MCP protocol expectations.
