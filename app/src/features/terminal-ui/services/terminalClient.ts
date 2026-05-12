import { createServiceClient } from '../../connection/services/serviceClient.js';
import type { ServiceConnection } from '../../connection/types/service.js';
import type { TerminalExecResult } from '../types/terminal.js';

export function createTerminalClient(connection: ServiceConnection) {
  const client = createServiceClient(connection);
  const baseUrl = connection.baseUrl.replace(/\/$/, '').replace(/^http/, 'ws');

  return {
    exec(command: string, cwd: string, args: string[] = [], timeoutMs = 30000): Promise<TerminalExecResult> {
      return client.post<TerminalExecResult>('/terminal/exec', { command, args, cwd, timeoutMs });
    },
    create(cwd: string): Promise<{ sessionId: string }> {
      return client.post<{ sessionId: string }>('/terminal/create', { cwd });
    },
    connect(sessionId: string): WebSocket {
      return new WebSocket(`${baseUrl}/terminal/ws?token=${encodeURIComponent(connection.token)}&sessionId=${encodeURIComponent(sessionId)}`);
    },
  };
}
