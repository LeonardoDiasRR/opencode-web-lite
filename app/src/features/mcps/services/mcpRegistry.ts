import { isValidMcpConfig, type McpConfig, type McpConnectionState, type McpToolDefinition } from '../types/mcp.js';

export interface RegisteredMcpTool extends McpToolDefinition { id: string; mcpName: string }
export interface RegisteredMcp { config: McpConfig; state: McpConnectionState; tools: RegisteredMcpTool[] }

export function buildMcpRegistry(mcps: McpConfig[]): RegisteredMcp[] {
  return mcps.map((mcp) => ({
    config: mcp,
    state: !mcp.enabled ? 'disabled' : isValidMcpConfig(mcp) ? 'configured' : 'error',
    tools: (mcp.tools ?? []).map((tool) => ({ ...tool, id: `${mcp.name}.${tool.name}`, mcpName: mcp.name })),
  }));
}

export function listMcpTools(registry: RegisteredMcp[]): RegisteredMcpTool[] {
  return registry.filter((mcp) => mcp.state === 'configured').flatMap((mcp) => mcp.tools);
}
