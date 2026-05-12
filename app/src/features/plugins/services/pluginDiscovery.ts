import { ServiceClientError, createServiceClient } from '../../connection/services/serviceClient.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import { joinWorkspacePath } from '../../../shared/utils/path.js';
import { parsePluginManifest } from './pluginManifestParser.js';
import { isValidPluginName, type DiscoveredPlugin } from '../types/plugin.js';

interface FsListResponse { entries: Array<{ name: string; path: string; type: string }> }
interface FsReadResponse { content: string; size: number }

export async function discoverPlugins(connection: ServiceConnection, workspacePath: string): Promise<DiscoveredPlugin[]> {
  const client = createServiceClient(connection);
  const rootPath = joinWorkspacePath(workspacePath, '.opencode', 'plugins');
  let entries: FsListResponse['entries'];
  try {
    entries = (await client.get<FsListResponse>(`/fs/list?path=${encodeURIComponent(rootPath)}`)).entries;
  } catch (error) {
    if (error instanceof ServiceClientError && error.code === 'NOT_FOUND') return [];
    throw error;
  }

  const plugins: DiscoveredPlugin[] = [];
  for (const entry of entries.filter((item) => item.type === 'directory' && isValidPluginName(item.name))) {
    const manifestPath = joinWorkspacePath(entry.path, 'plugin.json');
    try {
      const file = await client.get<FsReadResponse>(`/fs/read?path=${encodeURIComponent(manifestPath)}`);
      const manifest = parsePluginManifest(file.content, entry.name);
      plugins.push({ name: entry.name, directoryPath: entry.path, manifestPath, mainPath: joinWorkspacePath(entry.path, manifest.main), manifest, enabled: false });
    } catch (error) {
      if (error instanceof ServiceClientError && error.code === 'NOT_FOUND') continue;
    }
  }
  return plugins.sort((a, b) => a.name.localeCompare(b.name));
}
