import { afterEach, describe, expect, it, vi } from 'vitest';
import { compactMessages, buildCompactionPrompt } from '../services/compactionAgent.js';
import { needsCompaction } from '../types/compaction.js';

describe('compaction', () => {
  afterEach(() => { vi.restoreAllMocks(); });
  it('detects need and builds prompt', () => {
    expect(needsCompaction(Array.from({ length: 13 }, (_, i) => ({ id: String(i), role: 'user' as const, content: 'x', createdAt: 'a' })))).toBe(true);
    expect(buildCompactionPrompt([{ id: '1', role: 'user', content: 'hello', createdAt: 'a' }])).toContain('hello');
  });
  it('uses provider or fallback', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: 'Resumo' } }] })));
    await expect(compactMessages({ name: 'openrouter', model: 'm', apiKey: 'k', baseUrl: 'http://x' }, [{ id: '1', role: 'user', content: 'old', createdAt: 'a' }], 0)).resolves.toMatchObject({ summary: 'Resumo' });
  });
});
