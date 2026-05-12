import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPluginRegistry } from '../services/pluginRegistry.js';
import { usePluginStore } from '../store/pluginStore.js';

describe('pluginStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    usePluginStore.setState({ plugins: [], tools: [], status: 'idle', error: null });
  });

  it('rebuilds registry for enabled plugins', () => {
    usePluginStore.setState({ plugins: [{ name: 'audit', enabled: true, directoryPath: '', manifestPath: '', mainPath: '', manifest: { name: 'audit', main: 'index.js', hooks: ['message:after'], tools: [{ name: 'scan', description: 'Scan' }], permissions: [] } }] });

    usePluginStore.getState().rebuildRegistry();

    expect(getPluginRegistry().listHooks('message:after')).toEqual([{ pluginName: 'audit', hook: 'message:after' }]);
    expect(usePluginStore.getState().tools).toHaveLength(1);
  });
});
