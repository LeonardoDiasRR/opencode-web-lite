import { describe, expect, it, vi } from 'vitest';
import { getPluginRegistry, resetPluginRegistry, setPluginRegistry } from '../services/pluginRegistry.js';

describe('pluginRegistry', () => {
  it('registers hooks in order', () => {
    resetPluginRegistry();
    getPluginRegistry().register({ name: 'a', enabled: true, directoryPath: '', manifestPath: '', mainPath: '', manifest: { name: 'a', main: 'index.js', hooks: ['message:before'], tools: [], permissions: [] } });

    expect(getPluginRegistry().listHooks('message:before')).toEqual([{ pluginName: 'a', hook: 'message:before' }]);
  });

  it('supports mock registry injection', async () => {
    setPluginRegistry({ hooks: [], register: vi.fn(), listHooks: vi.fn(() => []), runMessageBefore: vi.fn(async (input) => ({ ...input, content: 'changed' })), runMessageAfter: vi.fn(), runSessionClose: vi.fn(async () => ({})) });

    await expect(getPluginRegistry().runMessageBefore({ content: 'x' })).resolves.toMatchObject({ content: 'changed' });
    resetPluginRegistry();
  });
});
