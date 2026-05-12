import { ServiceClientError, createServiceClient } from '../../connection/services/serviceClient.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import { joinWorkspacePath } from '../../../shared/utils/path.js';
import type { SessionIndexEntry, SessionRecord } from '../types/session.js';

interface FileResponse { content: string; size: number }

export function getSessionPath(workspacePath: string, sessionId: string): string {
  return joinWorkspacePath(workspacePath, '.opencode', 'sessions', `${sessionId}.json`);
}

export function getSessionIndexPath(workspacePath: string): string {
  return joinWorkspacePath(workspacePath, '.opencode', 'sessions', 'index.json');
}

export async function saveSession(connection: ServiceConnection, workspacePath: string, session: SessionRecord): Promise<SessionRecord> {
  await createServiceClient(connection).post('/fs/write', {
    path: getSessionPath(workspacePath, session.id),
    content: `${JSON.stringify(session, null, 2)}\n`,
  });
  return session;
}

export async function readSession(connection: ServiceConnection, workspacePath: string, sessionId: string): Promise<SessionRecord> {
  const file = await createServiceClient(connection).get<FileResponse>(`/fs/read?path=${encodeURIComponent(getSessionPath(workspacePath, sessionId))}`);
  return JSON.parse(file.content) as SessionRecord;
}

export async function saveSessionIndex(
  connection: ServiceConnection,
  workspacePath: string,
  entries: SessionIndexEntry[]
): Promise<SessionIndexEntry[]> {
  await createServiceClient(connection).post('/fs/write', {
    path: getSessionIndexPath(workspacePath),
    content: `${JSON.stringify(entries, null, 2)}\n`,
  });
  return entries;
}

export async function readSessionIndex(connection: ServiceConnection, workspacePath: string): Promise<SessionIndexEntry[]> {
  try {
    const file = await createServiceClient(connection).get<FileResponse>(`/fs/read?path=${encodeURIComponent(getSessionIndexPath(workspacePath))}`);
    return JSON.parse(file.content) as SessionIndexEntry[];
  } catch (error) {
    if (error instanceof ServiceClientError && error.code === 'NOT_FOUND') return [];
    throw error;
  }
}
