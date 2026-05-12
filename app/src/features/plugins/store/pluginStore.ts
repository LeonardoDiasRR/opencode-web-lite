import { create } from 'zustand';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { WorkspaceConfig } from '../../workspace/types/workspace.js';
import { discoverPlugins } from '../services/pluginDiscovery.js';
import { getPluginEntries, savePluginConfig } from '../services/pluginConfigStore.js';
import { getPluginRegistry } from '../services/pluginRegistry.js';
import { registerPluginTools, type RegisteredPluginTool } from '../services/pluginTools.js';
import type { DiscoveredPlugin, PluginStatus } from '../types/plugin.js';

interface PluginState {
  plugins: DiscoveredPlugin[];
  tools: RegisteredPluginTool[];
  status: PluginStatus;
  error: string | null;
  discover: (connection: ServiceConnection, workspacePath: string, config: WorkspaceConfig | null) => Promise<void>;
  setEnabled: (connection: ServiceConnection, workspacePath: string, config: WorkspaceConfig | null, pluginName: string, enabled: boolean) => Promise<WorkspaceConfig | null>;
  rebuildRegistry: () => void;
}

export const usePluginStore = create<PluginState>((set, get) => ({
  plugins: [],
  tools: [],
  status: 'idle',
  error: null,
  async discover(connection, workspacePath, config) {
    set({ status: 'discovering', error: null });
    try {
      const enabled = new Map(getPluginEntries(config).map((entry) => [entry.name, entry.enabled]));
      const plugins = (await discoverPlugins(connection, workspacePath)).map((plugin) => ({ ...plugin, enabled: enabled.get(plugin.name) ?? false }));
      set({ plugins, status: 'idle' });
      get().rebuildRegistry();
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  },
  async setEnabled(connection, workspacePath, config, pluginName, enabled) {
    set({ status: 'saving', error: null });
    try {
      const nextConfig = await savePluginConfig(connection, workspacePath, config, pluginName, enabled);
      set({ plugins: get().plugins.map((plugin) => plugin.name === pluginName ? { ...plugin, enabled } : plugin), status: 'idle' });
      get().rebuildRegistry();
      return nextConfig;
    } catch (error) {
      set({ status: 'error', error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  },
  rebuildRegistry() {
    const enabledPlugins = get().plugins.filter((plugin) => plugin.enabled);
    const registry = getPluginRegistry();
    registry.hooks.length = 0;
    enabledPlugins.forEach((plugin) => registry.register(plugin));
    set({ tools: registerPluginTools(enabledPlugins) });
  },
}));
