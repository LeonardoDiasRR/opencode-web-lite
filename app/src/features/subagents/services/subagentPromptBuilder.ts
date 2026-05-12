import type { PrimaryAgent } from '../../agents/types/agent.js';
import type { Subagent } from '../types/subagent.js';

export function buildSubagentPrompt(subagent: Subagent, primaryAgent: PrimaryAgent): string {
  const permissions = Object.entries(subagent.permissions).map(([name, value]) => `${name}: ${value}`).join(', ');
  return [
    `Você é o subagente ${subagent.label}.`,
    `Escopo: ${subagent.scope}`,
    `Agente primário ativo: ${primaryAgent.label}.`,
    `Objetivo do agente primário: ${primaryAgent.objective}`,
    `Permissões: ${permissions}.`,
    subagent.prompt,
  ].join('\n');
}
