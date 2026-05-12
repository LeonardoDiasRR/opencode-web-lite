import type { WorkspaceConfig } from '../../workspace/types/workspace.js';
import type { SkillPermission } from '../types/skill.js';

export function getSkillPermission(config: WorkspaceConfig | null, skillName: string): SkillPermission {
  const permissions = (config?.skills ?? {}) as Record<string, SkillPermission>;
  if (permissions[skillName]) return permissions[skillName];
  const wildcard = Object.entries(permissions).find(([pattern]) => pattern !== '*' && pattern.endsWith('*') && skillName.startsWith(pattern.slice(0, -1)));
  return wildcard?.[1] ?? permissions['*'] ?? 'ask';
}

export function mergeSkillPermission(config: WorkspaceConfig | null, skillName: string, permission: SkillPermission): WorkspaceConfig {
  return { version: '1', ...(config ?? {}), skills: { ...((config?.skills as Record<string, SkillPermission> | undefined) ?? {}), [skillName]: permission } };
}
