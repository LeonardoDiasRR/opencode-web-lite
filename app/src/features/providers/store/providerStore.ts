import { create } from 'zustand';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { WorkspaceConfig } from '../../workspace/types/workspace.js';
import { listModels } from '../services/modelClient.js';
import { getProviderDefinition } from '../services/providerCatalog.js';
import { saveProviderConfig } from '../services/providerConfigStore.js';
import type { ModelInfo, ProviderId } from '../types/provider.js';

type ProviderStatus = 'idle' | 'loading-models' | 'saving' | 'saved' | 'error';

interface ProviderState {
  providerId: ProviderId;
  apiKey: string;
  baseUrl: string;
  selectedModel: string;
  models: ModelInfo[];
  status: ProviderStatus;
  error: string | null;
  setProviderId: (providerId: ProviderId) => void;
  setApiKey: (apiKey: string) => void;
  setBaseUrl: (baseUrl: string) => void;
  setSelectedModel: (model: string) => void;
  hydrateFromConfig: (config: WorkspaceConfig | null) => void;
  loadModels: () => Promise<void>;
  save: (connection: ServiceConnection, workspacePath: string, config: WorkspaceConfig | null) => Promise<WorkspaceConfig | null>;
}

const defaultProvider = getProviderDefinition('openrouter');

export const useProviderStore = create<ProviderState>((set, get) => ({
  providerId: defaultProvider.id,
  apiKey: '',
  baseUrl: defaultProvider.defaultBaseUrl,
  selectedModel: '',
  models: [],
  status: 'idle',
  error: null,
  setProviderId(providerId) {
    const provider = getProviderDefinition(providerId);
    set({ providerId, baseUrl: provider.defaultBaseUrl, selectedModel: '', models: [], status: 'idle', error: null });
  },
  setApiKey(apiKey) {
    set({ apiKey });
  },
  setBaseUrl(baseUrl) {
    set({ baseUrl });
  },
  setSelectedModel(selectedModel) {
    set({ selectedModel });
  },
  hydrateFromConfig(config) {
    const provider = config?.provider as Partial<{ name: ProviderId; model: string; apiKey: string; baseUrl: string }> | undefined;
    if (!provider?.name) return;
    const definition = getProviderDefinition(provider.name);
    set({
      providerId: definition.id,
      selectedModel: provider.model ?? '',
      apiKey: provider.apiKey ?? '',
      baseUrl: provider.baseUrl ?? definition.defaultBaseUrl,
    });
  },
  async loadModels() {
    const { providerId, apiKey, baseUrl } = get();
    set({ status: 'loading-models', error: null });
    try {
      const models = await listModels(providerId, apiKey, baseUrl);
      set({ models, selectedModel: models[0]?.id ?? get().selectedModel, status: 'idle' });
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
  async save(connection, workspacePath, config) {
    const { providerId, selectedModel, apiKey, baseUrl } = get();
    set({ status: 'saving', error: null });
    try {
      const nextConfig = await saveProviderConfig(connection, workspacePath, config, {
        name: providerId,
        model: selectedModel,
        apiKey,
        baseUrl,
      });
      set({ status: 'saved' });
      return nextConfig;
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  },
}));
