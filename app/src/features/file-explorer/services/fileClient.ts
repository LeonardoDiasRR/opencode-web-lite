import { createServiceClient } from '../../connection/services/serviceClient.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { FileContent, FileEntry, FileWatchEvent } from '../types/file.js';

interface FsListResponse {
  entries: Array<{ name?: string; path: string; type: 'file' | 'directory' }>;
}

interface WatchOptions {
  onEvent: (event: FileWatchEvent) => void;
}

export function createFileClient(connection: ServiceConnection) {
  const client = createServiceClient(connection);
  const baseUrl = connection.baseUrl.replace(/\/$/, '');

  return {
    async list(path: string): Promise<FileEntry[]> {
      const response = await client.get<FsListResponse>(`/fs/list?path=${encodeURIComponent(path)}`);
      return response.entries.map((entry) => ({
        name: entry.name ?? entry.path.split(/[\\/]/).filter(Boolean).at(-1) ?? entry.path,
        path: entry.path,
        type: entry.type,
      }));
    },
    read(path: string): Promise<FileContent> {
      return client.get<FileContent>(`/fs/read?path=${encodeURIComponent(path)}`);
    },
    write(path: string, content: string): Promise<{ success: boolean; path: string }> {
      return client.post<{ success: boolean; path: string }>('/fs/write', { path, content });
    },
    async delete(path: string): Promise<{ success: boolean }> {
      const response = await fetch(`${baseUrl}/fs/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${connection.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      return response.json() as Promise<{ success: boolean }>;
    },
    move(from: string, to: string): Promise<{ success: boolean }> {
      return client.post<{ success: boolean }>('/fs/move', { from, to });
    },
    copy(from: string, to: string): Promise<{ success: boolean }> {
      return client.post<{ success: boolean }>('/fs/copy', { from, to });
    },
    watch(path: string, options: WatchOptions): { close: () => void } {
      const source = new EventSource(`${baseUrl}/fs/watch?path=${encodeURIComponent(path)}&token=${encodeURIComponent(connection.token)}`);
      source.onmessage = (message) => options.onEvent(JSON.parse(message.data) as FileWatchEvent);
      return { close: () => source.close() };
    },
  };
}
