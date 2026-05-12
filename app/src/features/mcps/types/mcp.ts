export type McpTransport = 'stdio' | 'http' | 'sse';
export type McpPermission = 'allow' | 'ask' | 'deny';
export type McpConnectionState = 'configured' | 'disabled' | 'error';
export type McpStatus = 'idle' | 'saving' | 'error';

export interface McpToolDefinition { name: string; description: string; schema?: Record<string, unknown> }
export interface McpConfig { name: string; transport: McpTransport; enabled: boolean; command?: string; url?: string; tools?: McpToolDefinition[]; permission?: McpPermission }

export const mcpNamePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export function isValidMcpName(name: string): boolean { return mcpNamePattern.test(name); }
export function isValidMcpConfig(config: McpConfig): boolean {
  if (!isValidMcpName(config.name)) return false;
  if (config.transport === 'stdio') return Boolean(config.command);
  return Boolean(config.url);
}
