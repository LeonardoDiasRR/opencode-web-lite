export type PluginPermission = 'allow' | 'ask' | 'deny';
export type PluginStatus = 'idle' | 'discovering' | 'saving' | 'error';
export type PluginHookName = 'message:before' | 'message:after' | 'tool:before' | 'tool:after' | 'session:close';

export interface PluginToolDefinition {
  name: string;
  description: string;
  schema?: Record<string, unknown>;
}

export interface PluginManifest {
  name: string;
  description?: string;
  version?: string;
  main: string;
  hooks: PluginHookName[];
  tools: PluginToolDefinition[];
  permissions: string[];
}

export interface DiscoveredPlugin {
  name: string;
  directoryPath: string;
  manifestPath: string;
  mainPath: string;
  manifest: PluginManifest;
  enabled: boolean;
}

export const pluginNamePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isValidPluginName(name: string): boolean {
  return pluginNamePattern.test(name);
}
