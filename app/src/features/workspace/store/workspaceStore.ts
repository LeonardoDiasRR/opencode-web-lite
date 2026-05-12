import { create } from 'zustand';
import { createWorkspaceClient } from '../services/workspaceClient.js';
import type { WorkspaceConfig } from '../types/workspace.js';

type WorkspaceStatus = 'idle' | 'checking' | 'initializing' | 'ready' | 'not-initialized' | 'error';

interface WorkspaceState {
  path: string;
  status: WorkspaceStatus;
  config: WorkspaceConfig | null;
  error: string | null;
  checkStatus: (baseUrl: string, token: string, path: string) => Promise<void>;
  initialize: (baseUrl: string, token: string, path: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  path: '',
  status: 'idle',
  config: null,
  error: null,
  async checkStatus(baseUrl, token, path) {
    set({ path, status: 'checking', error: null });
    try {
      const response = await createWorkspaceClient({ baseUrl, token }).status(path);
      set({ status: response.initialized ? 'ready' : 'not-initialized', config: response.config });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
  async initialize(baseUrl, token, path) {
    set({ path, status: 'initializing', error: null });
    try {
      const response = await createWorkspaceClient({ baseUrl, token }).init(path);
      set({ status: 'ready', config: response.config });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
}));
