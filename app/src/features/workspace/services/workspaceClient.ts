import { createServiceClient } from '../../connection/services/serviceClient.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { WorkspaceInitResponse, WorkspaceStatusResponse } from '../types/workspace.js';

export function createWorkspaceClient(connection: ServiceConnection) {
  const client = createServiceClient(connection);

  return {
    status(path: string): Promise<WorkspaceStatusResponse> {
      return client.get<WorkspaceStatusResponse>(`/workspace/status?path=${encodeURIComponent(path)}`);
    },

    init(path: string): Promise<WorkspaceInitResponse> {
      return client.post<WorkspaceInitResponse>('/workspace/init', { path });
    },
  };
}
