import { ServiceClientError, createServiceClient } from '../../connection/services/serviceClient.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import { joinWorkspacePath } from '../../../shared/utils/path.js';
import { parseSkillMarkdown } from './skillParser.js';
import { isValidSkillName, type DiscoveredSkill, type SkillOrigin } from '../types/skill.js';

interface FsListResponse { entries: Array<{ name: string; path: string; type: string }> }
interface FsReadResponse { content: string; size: number }

const roots: Array<{ origin: SkillOrigin; segments: string[] }> = [
  { origin: 'opencode', segments: ['.opencode', 'skills'] },
  { origin: 'claude', segments: ['.claude', 'skills'] },
  { origin: 'agents', segments: ['.agents', 'skills'] },
];

export async function discoverSkills(connection: ServiceConnection, workspacePath: string): Promise<DiscoveredSkill[]> {
  const client = createServiceClient(connection);
  const skills: DiscoveredSkill[] = [];
  for (const root of roots) {
    const rootPath = joinWorkspacePath(workspacePath, ...root.segments);
    let entries: FsListResponse['entries'];
    try {
      entries = (await client.get<FsListResponse>(`/fs/list?path=${encodeURIComponent(rootPath)}`)).entries;
    } catch (error) {
      if (error instanceof ServiceClientError && error.code === 'NOT_FOUND') continue;
      throw error;
    }

    for (const entry of entries.filter((item) => item.type === 'directory' && isValidSkillName(item.name))) {
      const filePath = joinWorkspacePath(entry.path, 'SKILL.md');
      try {
        const file = await client.get<FsReadResponse>(`/fs/read?path=${encodeURIComponent(filePath)}`);
        const parsed = parseSkillMarkdown(file.content, entry.name);
        skills.push({ name: entry.name, origin: root.origin, directoryPath: entry.path, filePath, metadata: parsed.metadata, content: parsed.content, loadState: 'loaded' });
      } catch (error) {
        if (error instanceof ServiceClientError && error.code === 'NOT_FOUND') continue;
      }
    }
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name) || a.origin.localeCompare(b.origin));
}
