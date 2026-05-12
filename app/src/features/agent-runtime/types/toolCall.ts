export type ToolPermission = 'allow' | 'ask' | 'deny';
export type ToolExecutionStatus = 'pending' | 'approved' | 'running' | 'succeeded' | 'failed' | 'denied';
export type ToolSource = 'native' | 'plugin' | 'mcp';

export interface ToolDefinition {
  name: string;
  description: string;
  source: ToolSource;
  permission: ToolPermission;
  schema?: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  status: ToolExecutionStatus;
  permission: ToolPermission;
}

export interface ToolResult {
  toolCallId: string;
  toolName: string;
  status: ToolExecutionStatus;
  preview: string;
  error?: string;
}

export interface RuntimeEvent {
  call: ToolCall;
  result?: ToolResult;
}
