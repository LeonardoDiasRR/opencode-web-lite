import { afterEach, describe, expect, it, vi } from 'vitest';
import { ServiceClientError } from '../../connection/services/serviceClient.js';
import { getSessionIndexPath, getSessionPath, readSessionIndex, saveSession } from '../services/sessionStorage.js';

describe('sessionStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds session paths', () => {
    expect(getSessionPath('C:\\project', 'ses_123')).toBe('C:\\project\\.opencode\\sessions\\ses_123.json');
    expect(getSessionIndexPath('/project')).toBe('/project/.opencode/sessions/index.json');
  });

  it('writes session files', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true })));
    const session = { id: 'ses_123', workspacePath: 'C:\\project', messages: [], activeAgent: 'build' as const, status: 'active' as const, createdAt: 'a', updatedAt: 'a' };

    await saveSession({ baseUrl: 'http://localhost:7847', token: 'secret' }, 'C:\\project', session);

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:7847/fs/write', expect.objectContaining({ method: 'POST' }));
  });

  it('returns empty index when file is missing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: 'missing', code: 'NOT_FOUND' }), { status: 404 }));

    await expect(readSessionIndex({ baseUrl: 'http://localhost:7847', token: 'secret' }, '/project')).resolves.toEqual([]);
  });

  it('throws non-not-found errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: 'bad', code: 'BAD' }), { status: 500 }));

    await expect(readSessionIndex({ baseUrl: 'http://localhost:7847', token: 'secret' }, '/project')).rejects.toEqual(new ServiceClientError('bad', 'BAD'));
  });
});
