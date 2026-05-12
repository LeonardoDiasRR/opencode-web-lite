import { ServiceClientError, createServiceClient } from '../../connection/services/serviceClient.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import { joinWorkspacePath } from '../../../shared/utils/path.js';
import type { CompactionSummary } from '../types/compaction.js';

interface FileResponse { content: string; size: number }
export function getCompactionPath(workspacePath: string): string { return joinWorkspacePath(workspacePath, '.opencode', 'memory', 'compaction.json'); }
export async function readCompaction(connection: ServiceConnection, workspacePath: string): Promise<CompactionSummary | null> {
  try { const file = await createServiceClient(connection).get<FileResponse>(`/fs/read?path=${encodeURIComponent(getCompactionPath(workspacePath))}`); return JSON.parse(file.content) as CompactionSummary; } catch (error) { if (error instanceof ServiceClientError && error.code === 'NOT_FOUND') return null; throw error; }
}
export async function saveCompaction(connection: ServiceConnection, workspacePath: string, summary: CompactionSummary): Promise<CompactionSummary> {
  await createServiceClient(connection).post('/fs/write', { path: getCompactionPath(workspacePath), content: `${JSON.stringify(summary, null, 2)}\n` });
  return summary;
}
