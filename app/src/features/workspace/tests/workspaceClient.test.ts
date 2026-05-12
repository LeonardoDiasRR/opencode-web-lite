import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWorkspaceClient } from '../services/workspaceClient.js';

describe('createWorkspaceClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests workspace status with encoded path', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ initialized: false, config: null })));
    const client = createWorkspaceClient({ baseUrl: 'http://localhost:7847', token: 'secret' });

    await expect(client.status('C:\\my project')).resolves.toEqual({ initialized: false, config: null });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:7847/workspace/status?path=C%3A%5Cmy%20project', {
      headers: { Authorization: 'Bearer secret' },
    });
  });

  it('initializes workspace with JSON body', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ initialized: true, path: 'C:\\project', config: { version: '1' } }))
    );
    const client = createWorkspaceClient({ baseUrl: 'http://localhost:7847', token: 'secret' });

    await expect(client.init('C:\\project')).resolves.toEqual({ initialized: true, path: 'C:\\project', config: { version: '1' } });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:7847/workspace/init', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer secret',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: 'C:\\project' }),
    });
  });
});
