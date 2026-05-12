import { createFileClient } from '../../file-explorer/services/fileClient.js';
import { createTerminalClient } from '../../terminal-ui/services/terminalClient.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { ToolDefinition, ToolResult } from '../types/toolCall.js';
import { preview } from './secretMasking.js';

export const nativeToolDefinitions: ToolDefinition[] = [
  { name: 'fs.list', description: 'Lista arquivos dentro do workspace.', source: 'native', permission: 'allow' },
  { name: 'fs.read', description: 'Lê arquivo dentro do workspace.', source: 'native', permission: 'allow' },
  { name: 'fs.write', description: 'Escreve arquivo dentro do workspace.', source: 'native', permission: 'ask' },
  { name: 'fs.delete', description: 'Remove arquivo dentro do workspace.', source: 'native', permission: 'ask' },
  { name: 'terminal.exec', description: 'Executa comando no workspace.', source: 'native', permission: 'ask' },
  { name: 'webfetch', description: 'Busca conteúdo HTTP/HTTPS.', source: 'native', permission: 'ask' },
];

interface ExecuteInput {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  connection: ServiceConnection;
  workspacePath: string;
}

export async function executeNativeTool(input: ExecuteInput): Promise<ToolResult> {
  try {
    const result = await runNativeTool(input);
    return { toolCallId: input.id, toolName: input.name, status: 'succeeded', preview: preview(result) };
  } catch (error) {
    return { toolCallId: input.id, toolName: input.name, status: 'failed', preview: '', error: error instanceof Error ? error.message : String(error) };
  }
}

async function runNativeTool({ name, arguments: args, connection, workspacePath }: ExecuteInput): Promise<unknown> {
  const files = createFileClient(connection);
  const terminal = createTerminalClient(connection);
  if (name === 'fs.list') return files.list(assertWorkspacePath(stringArg(args, 'path'), workspacePath));
  if (name === 'fs.read') return files.read(assertWorkspacePath(stringArg(args, 'path'), workspacePath));
  if (name === 'fs.write') return files.write(assertWorkspacePath(stringArg(args, 'path'), workspacePath), stringArg(args, 'content'));
  if (name === 'fs.delete') return files.delete(assertWorkspacePath(stringArg(args, 'path'), workspacePath));
  if (name === 'terminal.exec') return terminal.exec(stringArg(args, 'command'), workspacePath, arrayArg(args, 'args'), numberArg(args, 'timeoutMs') ?? 30_000);
  if (name === 'webfetch') return fetchUrl(stringArg(args, 'url'));
  throw new Error(`Ferramenta desconhecida: ${name}`);
}

function assertWorkspacePath(path: string, workspacePath: string): string {
  const normalizedWorkspace = workspacePath.replace(/\\/g, '/').replace(/\/$/, '').toLowerCase();
  const normalizedPath = path.replace(/\\/g, '/').toLowerCase();
  if (normalizedPath !== normalizedWorkspace && !normalizedPath.startsWith(`${normalizedWorkspace}/`)) {
    throw new Error('Path fora do workspace selecionado.');
  }
  return path;
}

function stringArg(args: Record<string, unknown>, key: string): string {
  if (typeof args[key] !== 'string' || args[key] === '') throw new Error(`Argumento obrigatório inválido: ${key}`);
  return args[key];
}

function arrayArg(args: Record<string, unknown>, key: string): string[] {
  const value = args[key];
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string') ? value : [];
}

function numberArg(args: Record<string, unknown>, key: string): number | undefined {
  return typeof args[key] === 'number' ? args[key] : undefined;
}

async function fetchUrl(url: string): Promise<string> {
  const parsed = new URL(url);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('URL deve usar http ou https.');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.text()).slice(0, 20_000);
}
