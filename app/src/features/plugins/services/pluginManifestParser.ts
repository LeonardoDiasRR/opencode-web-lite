import { isValidPluginName, type PluginHookName, type PluginManifest, type PluginToolDefinition } from '../types/plugin.js';

const hookNames: PluginHookName[] = ['message:before', 'message:after', 'tool:before', 'tool:after', 'session:close'];

export function parsePluginManifest(raw: string, expectedName: string): PluginManifest {
  const parsed = JSON.parse(raw) as Partial<PluginManifest>;
  if (parsed.name !== expectedName) throw new Error('Plugin name must match directory name');
  if (!parsed.name || !isValidPluginName(parsed.name)) throw new Error('Invalid plugin name');
  return {
    name: parsed.name,
    description: parsed.description,
    version: parsed.version,
    main: parsed.main ?? 'index.js',
    hooks: (parsed.hooks ?? []).filter((hook): hook is PluginHookName => hookNames.includes(hook as PluginHookName)),
    tools: (parsed.tools ?? []).filter(isValidTool),
    permissions: parsed.permissions ?? [],
  };
}

function isValidTool(tool: PluginToolDefinition): tool is PluginToolDefinition {
  return Boolean(tool?.name && tool.description);
}
