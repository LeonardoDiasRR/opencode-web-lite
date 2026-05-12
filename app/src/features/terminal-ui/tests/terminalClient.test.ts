import { describe, expect, it, vi } from 'vitest';
import { createTerminalClient } from '../services/terminalClient.js';

describe('terminalClient', () => {
  it('executes commands through the service', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ stdout: 'ok', stderr: '', exitCode: 0, timedOut: false })));
    const result = await createTerminalClient({ baseUrl: 'http://local', token: 't' }).exec('pwd', '/w');

    expect(result.stdout).toBe('ok');
    expect(JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)).toMatchObject({ command: 'pwd', cwd: '/w' });
  });
});
