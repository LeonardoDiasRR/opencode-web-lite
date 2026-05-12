export type SkillOrigin = 'opencode' | 'claude' | 'agents';
export type SkillPermission = 'allow' | 'deny' | 'ask';
export type SkillLoadState = 'idle' | 'loading' | 'loaded' | 'error';

export interface SkillMetadata {
  name: string;
  description?: string;
  license?: string;
  compatibility?: string;
  metadata?: Record<string, unknown>;
}

export interface DiscoveredSkill {
  name: string;
  origin: SkillOrigin;
  directoryPath: string;
  filePath: string;
  metadata: SkillMetadata;
  content?: string;
  loadState: SkillLoadState;
}

export interface PromptSkill {
  name: string;
  description?: string;
  content: string;
}

export const skillNamePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isValidSkillName(name: string): boolean {
  return skillNamePattern.test(name);
}

export function getSkillId(skill: Pick<DiscoveredSkill, 'origin' | 'name'>): string {
  return `${skill.origin}:${skill.name}`;
}
