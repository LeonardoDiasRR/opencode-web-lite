import type { DiscoveredPlugin, PluginToolDefinition } from '../types/plugin.js';

export interface RegisteredPluginTool extends PluginToolDefinition { id: string; pluginName: string }

export function registerPluginTools(plugins: DiscoveredPlugin[]): RegisteredPluginTool[] {
  return plugins.flatMap((plugin) => plugin.manifest.tools.map((tool) => ({ ...tool, id: `${plugin.name}.${tool.name}`, pluginName: plugin.name })));
}

export async function invokePluginTool(): Promise<never> {
  throw new Error('Plugin tool execution is not enabled in this phase');
}
