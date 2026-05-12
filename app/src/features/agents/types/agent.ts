export type PrimaryAgentId = 'build' | 'plan';
export type AgentPermission = 'allow' | 'ask' | 'deny';
export type AgentEffort = 'low' | 'medium' | 'high';

export interface AgentPermissions {
  read: AgentPermission;
  edit: AgentPermission;
  bash: AgentPermission;
  webfetch: AgentPermission;
}

export interface PrimaryAgent {
  id: PrimaryAgentId;
  label: string;
  description: string;
  objective: string;
  effort: AgentEffort;
  permissions: AgentPermissions;
  model?: string;
}
