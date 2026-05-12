import type { Subagent, SubagentId } from '../types/subagent.js';

export const subagents: Subagent[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Executor de tarefas multi-etapa sem acesso ao recurso todo.',
    scope: 'Resolver tarefas amplas com leitura, edição, bash e webfetch quando necessário.',
    permissions: { read: 'allow', edit: 'allow', bash: 'allow', webfetch: 'allow', todo: 'deny' },
    prompt: 'Execute a tarefa diretamente e mantenha o raciocínio focado em entregáveis verificáveis.',
  },
  {
    id: 'explore',
    label: 'Explore',
    description: 'Navegação e busca no codebase em modo somente leitura.',
    scope: 'Encontrar arquivos, símbolos e relações no projeto sem modificar nada.',
    permissions: { read: 'allow', edit: 'deny', bash: 'deny', webfetch: 'deny', todo: 'deny' },
    prompt: 'Responda com achados objetivos, referências de arquivos e sem propor alterações executadas.',
  },
  {
    id: 'scout',
    label: 'Scout',
    description: 'Pesquisa externa de documentação e dependências em modo somente leitura.',
    scope: 'Pesquisar documentação externa e sintetizar informações relevantes.',
    permissions: { read: 'deny', edit: 'deny', bash: 'deny', webfetch: 'allow', todo: 'deny' },
    prompt: 'Priorize documentação e fatos verificáveis; não solicite edição local nem execução de comandos.',
  },
];

export function getSubagent(id: SubagentId): Subagent {
  return subagents.find((subagent) => subagent.id === id) ?? subagents[0];
}

export function findSubagent(id: string): Subagent | undefined {
  return subagents.find((subagent) => subagent.id === id);
}
