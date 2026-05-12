import { create } from 'zustand';
import { createTerminalClient } from '../services/terminalClient.js';
import type { TerminalEntry } from '../types/terminal.js';

type TerminalStatus = 'idle' | 'running' | 'ready' | 'error';

interface TerminalState {
  history: TerminalEntry[];
  output: string;
  status: TerminalStatus;
  error: string | null;
  run: (baseUrl: string, token: string, cwd: string, command: string) => Promise<void>;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  history: [],
  output: '',
  status: 'idle',
  error: null,
  async run(baseUrl, token, cwd, command) {
    set({ status: 'running', error: null });
    try {
      const result = await createTerminalClient({ baseUrl, token }).exec(command, cwd);
      const entry = { command, ...result };
      set({ history: [...get().history, entry], output: `${result.stdout}${result.stderr}`, status: 'ready' });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
}));
