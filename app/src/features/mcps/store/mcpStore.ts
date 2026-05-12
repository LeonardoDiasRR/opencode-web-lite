import { create } from 'zustand';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { WorkspaceConfig } from '../../workspace/types/workspace.js';
import { getMcpConfigs, saveMcpConfigs } from '../services/mcpConfigStore.js';
import { buildMcpRegistry, listMcpTools, type RegisteredMcpTool } from '../services/mcpRegistry.js';
import type { McpConfig, McpStatus } from '../types/mcp.js';

interface McpState { mcps: McpConfig[]; tools: RegisteredMcpTool[]; status: McpStatus; error: string | null; loadFromConfig: (config: WorkspaceConfig | null) => void; upsert: (mcp: McpConfig) => void; remove: (name: string) => void; setEnabled: (name: string, enabled: boolean) => void; save: (connection: ServiceConnection, workspacePath: string, config: WorkspaceConfig | null) => Promise<WorkspaceConfig | null> }
function deriveTools(mcps: McpConfig[]) { return listMcpTools(buildMcpRegistry(mcps)); }
export const useMcpStore = create<McpState>((set, get) => ({
  mcps: [], tools: [], status: 'idle', error: null,
  loadFromConfig(config) { const mcps = getMcpConfigs(config); set({ mcps, tools: deriveTools(mcps) }); },
  upsert(mcp) { const mcps = [...get().mcps.filter((item) => item.name !== mcp.name), mcp]; set({ mcps, tools: deriveTools(mcps) }); },
  remove(name) { const mcps = get().mcps.filter((item) => item.name !== name); set({ mcps, tools: deriveTools(mcps) }); },
  setEnabled(name, enabled) { const mcps = get().mcps.map((item) => item.name === name ? { ...item, enabled } : item); set({ mcps, tools: deriveTools(mcps) }); },
  async save(connection, workspacePath, config) { set({ status: 'saving', error: null }); try { const next = await saveMcpConfigs(connection, workspacePath, config, get().mcps); set({ status: 'idle' }); return next; } catch (error) { set({ status: 'error', error: error instanceof Error ? error.message : String(error) }); return null; } },
}));
