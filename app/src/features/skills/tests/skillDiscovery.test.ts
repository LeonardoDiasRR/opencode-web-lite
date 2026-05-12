import { afterEach, describe, expect, it, vi } from 'vitest';
import { discoverSkills } from '../services/skillDiscovery.js';

describe('discoverSkills', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('discovers skills from supported roots', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ entries: [{ name: 'style-guide', path: '/project/.opencode/skills/style-guide', type: 'directory' }] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: '---\nname: style-guide\ndescription: Style\n---\nRules', size: 1 })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'missing', code: 'NOT_FOUND' }), { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'missing', code: 'NOT_FOUND' }), { status: 404 }));

    await expect(discoverSkills({ baseUrl: 'http://localhost:7847', token: 'secret' }, '/project')).resolves.toMatchObject([
      { name: 'style-guide', origin: 'opencode', metadata: { description: 'Style' }, content: 'Rules' },
    ]);
  });
});
