import type { WorkspaceConfig } from '../../workspace/types/workspace.js';
import type { AgentEffort, AgentPermission, AgentPermissions, PrimaryAgent, PrimaryAgentId } from '../types/agent.js';

const buildDefaults: PrimaryAgent = {
  id: 'build',
  label: 'Build',
  description: 'Executa mudanças e usa ferramentas do projeto.',
  objective: 'Implementar, modificar e verificar software no workspace.',
  effort: 'low',
  permissions: { read: 'allow', edit: 'allow', bash: 'allow', webfetch: 'allow' },
};

const planDefaults: PrimaryAgent = {
  id: 'plan',
  label: 'Plan',
  description: 'Analisa e planeja antes de executar ações.',
  objective: 'Criar planos claros e pedir aprovação antes de editar ou executar comandos.',
  effort: 'medium',
  permissions: { read: 'allow', edit: 'ask', bash: 'ask', webfetch: 'allow' },
};

export const primaryAgents = [buildDefaults, planDefaults];

export function getPrimaryAgent(agentId: PrimaryAgentId, config?: WorkspaceConfig | null): PrimaryAgent {
  const base = agentId === 'plan' ? planDefaults : buildDefaults;
  const override = ((config?.agents as Record<string, unknown> | undefined)?.[agentId] ?? {}) as Partial<{
    effort: AgentEffort;
    model: string;
    permission: Partial<Record<keyof AgentPermissions, AgentPermission>>;
  }>;

  return {
    ...base,
    effort: override.effort ?? base.effort,
    model: override.model,
    permissions: { ...base.permissions, ...(override.permission ?? {}) },
  };
}
