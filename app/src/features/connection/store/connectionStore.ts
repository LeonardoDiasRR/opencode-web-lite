import { create } from 'zustand';
import { createServiceClient } from '../services/serviceClient.js';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface ConnectionState {
  baseUrl: string;
  token: string;
  serviceVersion: string | null;
  status: ConnectionStatus;
  error: string | null;
  connect: (baseUrl: string, token: string) => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  baseUrl: 'http://127.0.0.1:7847',
  token: '',
  serviceVersion: null,
  status: 'idle',
  error: null,
  async connect(baseUrl, token) {
    set({ baseUrl, token, status: 'connecting', error: null });
    try {
      const client = createServiceClient({ baseUrl, token });
      const health = await client.health();
      set({ serviceVersion: health.version, status: 'connected' });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
}));
