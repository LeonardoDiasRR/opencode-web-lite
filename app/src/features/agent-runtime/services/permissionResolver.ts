import type { PrimaryAgent } from '../../agents/types/agent.js';
import type { Subagent } from '../../subagents/types/subagent.js';
import type { ToolPermission } from '../types/toolCall.js';

type PermissionBucket = 'read' | 'edit' | 'bash' | 'webfetch';

export function resolveToolPermission(toolName: string, agent: PrimaryAgent, subagent?: Subagent): ToolPermission {
  const bucket = bucketForTool(toolName);
  if (!bucket) return 'ask';
  const primary = agent.permissions[bucket];
  const delegated = subagent?.permissions[bucket];
  if (primary === 'deny' || delegated === 'deny') return 'deny';
  if (primary === 'ask' || delegated === 'ask') return 'ask';
  return 'allow';
}

function bucketForTool(toolName: string): PermissionBucket | null {
  if (toolName === 'fs.list' || toolName === 'fs.read') return 'read';
  if (toolName === 'fs.write' || toolName === 'fs.delete') return 'edit';
  if (toolName === 'terminal.exec') return 'bash';
  if (toolName === 'webfetch') return 'webfetch';
  return null;
}
