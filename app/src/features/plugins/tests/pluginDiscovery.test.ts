import { afterEach, describe, expect, it, vi } from 'vitest';
import { discoverPlugins } from '../services/pluginDiscovery.js';

describe('discoverPlugins', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('discovers local plugins', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ entries: [{ name: 'audit-tools', path: '/project/.opencode/plugins/audit-tools', type: 'directory' }] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: '{"name":"audit-tools","description":"Audit","hooks":["message:after"]}', size: 1 })));

    await expect(discoverPlugins({ baseUrl: 'http://localhost:7847', token: 'secret' }, '/project')).resolves.toMatchObject([
      { name: 'audit-tools', manifest: { hooks: ['message:after'] }, enabled: false },
    ]);
  });
});
