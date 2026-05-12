import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPluginEntries, mergePluginConfig, savePluginConfig } from '../services/pluginConfigStore.js';

describe('pluginConfigStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes plugin entries and merges config', () => {
    expect(getPluginEntries({ plugins: ['pkg', { name: 'local', enabled: false }] })).toEqual([{ name: 'pkg', enabled: true }, { name: 'local', enabled: false }]);
    expect(mergePluginConfig({ version: '1', skills: {}, plugins: ['pkg'] }, 'local', true)).toEqual({
      version: '1',
      skills: {},
      plugins: [{ name: 'pkg', enabled: true }, { name: 'local', enabled: true }],
    });
  });

  it('writes plugin config', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true })));

    await savePluginConfig({ baseUrl: 'http://localhost:7847', token: 'secret' }, '/project', {}, 'local', true);

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:7847/fs/write', expect.objectContaining({ method: 'POST' }));
  });
});
