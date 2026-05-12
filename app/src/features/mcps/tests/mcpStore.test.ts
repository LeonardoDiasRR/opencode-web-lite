import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMcpStore } from '../store/mcpStore.js';

describe('mcpStore', () => {
  afterEach(() => { vi.restoreAllMocks(); useMcpStore.setState({ mcps: [], tools: [], status: 'idle', error: null }); });
  it('loads, updates and saves MCPs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true })));
    useMcpStore.getState().loadFromConfig({ mcps: [{ name: 'github', transport: 'http', enabled: true, url: 'http://x', tools: [{ name: 'search', description: 'Search' }] }] });
    expect(useMcpStore.getState().tools).toHaveLength(1);
    useMcpStore.getState().setEnabled('github', false);
    expect(useMcpStore.getState().tools).toHaveLength(0);
    await expect(useMcpStore.getState().save({ baseUrl: 'http://localhost:7847', token: 'secret' }, '/project', {})).resolves.toHaveProperty('mcps');
  });
});
