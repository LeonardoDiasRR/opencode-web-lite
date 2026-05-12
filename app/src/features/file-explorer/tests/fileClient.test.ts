import { describe, expect, it, vi } from 'vitest';
import { createFileClient } from '../services/fileClient.js';

describe('fileClient', () => {
  it('normalizes list entries and reads files', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ entries: [{ path: '/w/a.ts', type: 'file' }] })));
    const entries = await createFileClient({ baseUrl: 'http://local', token: 't' }).list('/w');

    expect(entries).toEqual([{ name: 'a.ts', path: '/w/a.ts', type: 'file' }]);
    expect(fetchMock.mock.calls[0][0]).toBe('http://local/fs/list?path=%2Fw');
  });
});
