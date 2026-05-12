import { afterEach, describe, expect, it, vi } from 'vitest';
import { createServiceClient, ServiceClientError } from '../services/serviceClient.js';

describe('createServiceClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls health without authorization header', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ status: 'ok', version: '0.1.0' })));
    const client = createServiceClient({ baseUrl: 'http://localhost:7847/', token: 'secret' });

    await expect(client.health()).resolves.toEqual({ status: 'ok', version: '0.1.0' });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:7847/health');
  });

  it('sends bearer token for authenticated requests', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    const client = createServiceClient({ baseUrl: 'http://localhost:7847', token: 'secret' });

    await client.get('/workspace/status?path=C%3A%5Cproject');
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:7847/workspace/status?path=C%3A%5Cproject', {
      headers: { Authorization: 'Bearer secret' },
    });
  });

  it('throws service errors with code', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Invalid or missing token', code: 'UNAUTHORIZED' }), { status: 401 })
    );
    const client = createServiceClient({ baseUrl: 'http://localhost:7847', token: 'bad' });

    await expect(client.get('/fs/list')).rejects.toEqual(new ServiceClientError('Invalid or missing token', 'UNAUTHORIZED'));
  });
});
