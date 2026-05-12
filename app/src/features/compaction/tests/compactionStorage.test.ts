import { afterEach, describe, expect, it, vi } from 'vitest';
import { readCompaction, saveCompaction } from '../services/compactionStorage.js';

describe('compactionStorage', () => {
  afterEach(() => { vi.restoreAllMocks(); });
  it('reads missing summary as null and writes summary', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ error: 'missing', code: 'NOT_FOUND' }), { status: 404 })).mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));
    await expect(readCompaction({ baseUrl: 'http://localhost:7847', token: 'secret' }, '/project')).resolves.toBeNull();
    await expect(saveCompaction({ baseUrl: 'http://localhost:7847', token: 'secret' }, '/project', { summary: 's', createdAt: 'a', messageCount: 1 })).resolves.toEqual({ summary: 's', createdAt: 'a', messageCount: 1 });
  });
});
