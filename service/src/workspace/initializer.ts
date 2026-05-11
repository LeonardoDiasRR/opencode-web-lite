import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const DEFAULT_AGENTS_MD = `# AGENTS.md

Este arquivo define o comportamento dos agentes para este projeto.

Edite para personalizar como os agentes interagem com seu workspace.

## Regras

## Convenções de Código

## Arquitetura

## Restrições
`;

const DEFAULT_OPENCODE_JSON = {
  version: '1',
  provider: { name: null, model: null },
  agents: {},
  skills: {},
  plugins: [],
  mcps: [],
};

export async function initWorkspace(workspacePath: string): Promise<void> {
  const agentsMdPath = join(workspacePath, 'AGENTS.md');
  const opencodeDirPath = join(workspacePath, '.opencode');
  const opencodeJsonPath = join(opencodeDirPath, 'opencode.json');

  await mkdir(opencodeDirPath, { recursive: true });

  if (!existsSync(agentsMdPath)) {
    await writeFile(agentsMdPath, DEFAULT_AGENTS_MD, 'utf8');
  }

  if (!existsSync(opencodeJsonPath)) {
    await writeFile(opencodeJsonPath, JSON.stringify(DEFAULT_OPENCODE_JSON, null, 2) + '\n', 'utf8');
  }
}

export async function isWorkspaceInitialized(workspacePath: string): Promise<boolean> {
  return existsSync(join(workspacePath, '.opencode', 'opencode.json'));
}

export async function readOpencodeConfig(workspacePath: string): Promise<Record<string, unknown>> {
  const configPath = join(workspacePath, '.opencode', 'opencode.json');
  const raw = await readFile(configPath, 'utf8');
  return JSON.parse(raw) as Record<string, unknown>;
}
