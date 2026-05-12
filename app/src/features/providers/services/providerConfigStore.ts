import { joinWorkspacePath } from '../../../shared/utils/path.js';
import { createServiceClient } from '../../connection/services/serviceClient.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { WorkspaceConfig } from '../../workspace/types/workspace.js';
import type { ProviderSelection } from '../types/provider.js';

export function mergeProviderConfig(config: WorkspaceConfig | null, selection: ProviderSelection): WorkspaceConfig {
  return {
    version: '1',
    ...(config ?? {}),
    provider: selection,
  };
}

export async function saveProviderConfig(
  connection: ServiceConnection,
  workspacePath: string,
  config: WorkspaceConfig | null,
  selection: ProviderSelection
): Promise<WorkspaceConfig> {
  const nextConfig = mergeProviderConfig(config, selection);
  const targetPath = joinWorkspacePath(workspacePath, '.opencode', 'opencode.json');
  await createServiceClient(connection).post('/fs/write', {
    path: targetPath,
    content: `${JSON.stringify(nextConfig, null, 2)}\n`,
  });
  return nextConfig;
}
