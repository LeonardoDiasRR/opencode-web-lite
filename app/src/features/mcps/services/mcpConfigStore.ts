import { createServiceClient } from '../../connection/services/serviceClient.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { WorkspaceConfig } from '../../workspace/types/workspace.js';
import { joinWorkspacePath } from '../../../shared/utils/path.js';
import type { McpConfig } from '../types/mcp.js';

export function getMcpConfigs(config: WorkspaceConfig | null): McpConfig[] { return Array.isArray(config?.mcps) ? config.mcps as McpConfig[] : []; }
export function mergeMcpConfig(config: WorkspaceConfig | null, mcp: McpConfig): WorkspaceConfig {
  return { version: '1', ...(config ?? {}), mcps: [...getMcpConfigs(config).filter((item) => item.name !== mcp.name), mcp] };
}
export function removeMcpConfig(config: WorkspaceConfig | null, name: string): WorkspaceConfig {
  return { version: '1', ...(config ?? {}), mcps: getMcpConfigs(config).filter((item) => item.name !== name) };
}
export async function saveMcpConfigs(connection: ServiceConnection, workspacePath: string, config: WorkspaceConfig | null, mcps: McpConfig[]): Promise<WorkspaceConfig> {
  const nextConfig = { version: '1', ...(config ?? {}), mcps };
  await createServiceClient(connection).post('/fs/write', { path: joinWorkspacePath(workspacePath, '.opencode', 'opencode.json'), content: `${JSON.stringify(nextConfig, null, 2)}\n` });
  return nextConfig;
}
