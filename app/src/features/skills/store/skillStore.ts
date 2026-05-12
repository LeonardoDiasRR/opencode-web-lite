import { create } from 'zustand';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { WorkspaceConfig } from '../../workspace/types/workspace.js';
import { discoverSkills } from '../services/skillDiscovery.js';
import { getSkillPermission } from '../services/skillPermissions.js';
import { saveSkillPermission } from '../services/skillConfigStore.js';
import type { DiscoveredSkill, PromptSkill, SkillPermission } from '../types/skill.js';

type SkillStatus = 'idle' | 'discovering' | 'saving' | 'error';

interface SkillState {
  skills: DiscoveredSkill[];
  status: SkillStatus;
  error: string | null;
  approvedSkills: string[];
  discover: (connection: ServiceConnection, workspacePath: string) => Promise<void>;
  setApproved: (skillName: string, approved: boolean) => void;
  savePermission: (connection: ServiceConnection, workspacePath: string, config: WorkspaceConfig | null, skillName: string, permission: SkillPermission) => Promise<WorkspaceConfig | null>;
  getPromptSkills: (config: WorkspaceConfig | null) => PromptSkill[];
}

export const useSkillStore = create<SkillState>((set, get) => ({
  skills: [],
  status: 'idle',
  error: null,
  approvedSkills: [],
  async discover(connection, workspacePath) {
    set({ status: 'discovering', error: null });
    try {
      set({ skills: await discoverSkills(connection, workspacePath), status: 'idle' });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
  setApproved(skillName, approved) {
    set({ approvedSkills: approved ? Array.from(new Set([...get().approvedSkills, skillName])) : get().approvedSkills.filter((name) => name !== skillName) });
  },
  async savePermission(connection, workspacePath, config, skillName, permission) {
    set({ status: 'saving', error: null });
    try {
      const nextConfig = await saveSkillPermission(connection, workspacePath, config, skillName, permission);
      set({ status: 'idle' });
      return nextConfig;
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  },
  getPromptSkills(config) {
    return get().skills
      .filter((skill) => skill.content && (getSkillPermission(config, skill.name) === 'allow' || get().approvedSkills.includes(skill.name)))
      .map((skill) => ({ name: skill.name, description: skill.metadata.description, content: skill.content ?? '' }));
  },
}));
