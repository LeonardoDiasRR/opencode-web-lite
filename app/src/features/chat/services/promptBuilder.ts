import type { PrimaryAgent } from '../../agents/types/agent.js';

export function buildSystemPrompt(agent: PrimaryAgent): string {
  const permissions = Object.entries(agent.permissions)
    .map(([name, value]) => `${name}: ${value}`)
    .join(', ');
  return [
    `Você é o agente ${agent.label}.`,
    `Objetivo: ${agent.objective}`,
    `Esforço: ${agent.effort}.`,
    `Permissões: ${permissions}.`,
    'Use AGENTS.md como contexto quando ele estiver disponível em fases futuras.',
  ].join('\n');
}
