import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMcpConfigs, mergeMcpConfig, removeMcpConfig, saveMcpConfigs } from '../services/mcpConfigStore.js';

describe('mcpConfigStore', () => {
  afterEach(() => { vi.restoreAllMocks(); });
  it('reads, merges and removes MCPs', () => {
    const mcp = { name: 'github', transport: 'stdio' as const, enabled: true, command: 'node' };
    expect(getMcpConfigs({ mcps: [mcp] })).toEqual([mcp]);
    expect(mergeMcpConfig({ version: '1', provider: {} }, mcp)).toEqual({ version: '1', provider: {}, mcps: [mcp] });
    expect(removeMcpConfig({ mcps: [mcp] }, 'github')).toEqual({ version: '1', mcps: [] });
  });
  it('writes config', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true })));
    await saveMcpConfigs({ baseUrl: 'http://localhost:7847', token: 'secret' }, '/project', {}, []);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:7847/fs/write', expect.objectContaining({ method: 'POST' }));
  });
});
