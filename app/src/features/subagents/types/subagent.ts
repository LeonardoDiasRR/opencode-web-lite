import type { AgentPermission, AgentPermissions } from '../../agents/types/agent.js';

export type SubagentId = 'general' | 'explore' | 'scout';

export interface Subagent {
  id: SubagentId;
  label: string;
  description: string;
  scope: string;
  permissions: AgentPermissions & { todo: AgentPermission };
  prompt: string;
}
