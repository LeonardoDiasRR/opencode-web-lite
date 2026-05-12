import { createServiceClient } from '../../connection/services/serviceClient.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { WorkspaceConfig } from '../../workspace/types/workspace.js';
import { joinWorkspacePath } from '../../../shared/utils/path.js';

export interface PluginConfigEntry { name: string; enabled: boolean }

export function getPluginEntries(config: WorkspaceConfig | null): PluginConfigEntry[] {
  const raw = config?.plugins;
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => typeof entry === 'string' ? { name: entry, enabled: true } : entry as PluginConfigEntry).filter((entry) => Boolean(entry.name));
}

export function mergePluginConfig(config: WorkspaceConfig | null, pluginName: string, enabled: boolean): WorkspaceConfig {
  const entries = getPluginEntries(config).filter((entry) => entry.name !== pluginName);
  return { version: '1', ...(config ?? {}), plugins: [...entries, { name: pluginName, enabled }] };
}

export async function savePluginConfig(connection: ServiceConnection, workspacePath: string, config: WorkspaceConfig | null, pluginName: string, enabled: boolean): Promise<WorkspaceConfig> {
  const nextConfig = mergePluginConfig(config, pluginName, enabled);
  await createServiceClient(connection).post('/fs/write', {
    path: joinWorkspacePath(workspacePath, '.opencode', 'opencode.json'),
    content: `${JSON.stringify(nextConfig, null, 2)}\n`,
  });
  return nextConfig;
}
