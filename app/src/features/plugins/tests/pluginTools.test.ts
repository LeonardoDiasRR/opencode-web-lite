import { describe, expect, it } from 'vitest';
import { invokePluginTool, registerPluginTools } from '../services/pluginTools.js';

describe('pluginTools', () => {
  it('registers namespaced tool metadata', () => {
    expect(registerPluginTools([{ name: 'audit', enabled: true, directoryPath: '', manifestPath: '', mainPath: '', manifest: { name: 'audit', main: 'index.js', hooks: [], tools: [{ name: 'scan', description: 'Scan' }], permissions: [] } }])).toEqual([
      { id: 'audit.scan', pluginName: 'audit', name: 'scan', description: 'Scan' },
    ]);
  });

  it('does not execute tools in this phase', async () => {
    await expect(invokePluginTool()).rejects.toThrow('Plugin tool execution is not enabled in this phase');
  });
});
