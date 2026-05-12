import { create } from 'zustand';
import { createFileClient } from '../services/fileClient.js';
import type { FileEntry } from '../types/file.js';

type FileStatus = 'idle' | 'loading' | 'saving' | 'ready' | 'error';

interface FileExplorerState {
  entries: FileEntry[];
  selectedPath: string | null;
  content: string;
  status: FileStatus;
  error: string | null;
  list: (baseUrl: string, token: string, workspacePath: string) => Promise<void>;
  open: (baseUrl: string, token: string, workspacePath: string, path: string) => Promise<void>;
  save: (baseUrl: string, token: string, workspacePath: string, content: string) => Promise<void>;
  deleteSelected: (baseUrl: string, token: string, workspacePath: string) => Promise<void>;
}

function ensureInsideWorkspace(workspacePath: string, path: string) {
  if (!path.startsWith(workspacePath)) {
    throw new Error('Path fora do workspace selecionado');
  }
}

export const useFileExplorerStore = create<FileExplorerState>((set, get) => ({
  entries: [],
  selectedPath: null,
  content: '',
  status: 'idle',
  error: null,
  async list(baseUrl, token, workspacePath) {
    set({ status: 'loading', error: null });
    try {
      const entries = await createFileClient({ baseUrl, token }).list(workspacePath);
      set({ entries, status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
  async open(baseUrl, token, workspacePath, path) {
    set({ status: 'loading', error: null });
    try {
      ensureInsideWorkspace(workspacePath, path);
      const file = await createFileClient({ baseUrl, token }).read(path);
      set({ selectedPath: file.path, content: file.content, status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
  async save(baseUrl, token, workspacePath, content) {
    const path = get().selectedPath;
    if (!path) return;
    set({ status: 'saving', error: null });
    try {
      ensureInsideWorkspace(workspacePath, path);
      await createFileClient({ baseUrl, token }).write(path, content);
      set({ content, status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
  async deleteSelected(baseUrl, token, workspacePath) {
    const path = get().selectedPath;
    if (!path) return;
    set({ status: 'loading', error: null });
    try {
      ensureInsideWorkspace(workspacePath, path);
      await createFileClient({ baseUrl, token }).delete(path);
      set({ selectedPath: null, content: '', entries: get().entries.filter((entry) => entry.path !== path), status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
}));
