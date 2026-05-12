import { createServiceClient } from '../../connection/services/serviceClient.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { WorkspaceConfig } from '../../workspace/types/workspace.js';
import { joinWorkspacePath } from '../../../shared/utils/path.js';
import { mergeSkillPermission } from './skillPermissions.js';
import type { SkillPermission } from '../types/skill.js';

export async function saveSkillPermission(
  connection: ServiceConnection,
  workspacePath: string,
  config: WorkspaceConfig | null,
  skillName: string,
  permission: SkillPermission
): Promise<WorkspaceConfig> {
  const nextConfig = mergeSkillPermission(config, skillName, permission);
  await createServiceClient(connection).post('/fs/write', {
    path: joinWorkspacePath(workspacePath, '.opencode', 'opencode.json'),
    content: `${JSON.stringify(nextConfig, null, 2)}\n`,
  });
  return nextConfig;
}
