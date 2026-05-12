import { describe, expect, it } from 'vitest';
import { buildMcpRegistry, listMcpTools } from '../services/mcpRegistry.js';

describe('mcpRegistry', () => {
  it('marks configured, disabled and error MCPs', () => {
    const registry = buildMcpRegistry([
      { name: 'ok', transport: 'http', enabled: true, url: 'http://x', tools: [{ name: 'search', description: 'Search' }] },
      { name: 'off', transport: 'stdio', enabled: false },
      { name: 'bad', transport: 'http', enabled: true },
    ]);
    expect(registry.map((item) => item.state)).toEqual(['configured', 'disabled', 'error']);
    expect(listMcpTools(registry)).toEqual([{ id: 'ok.search', mcpName: 'ok', name: 'search', description: 'Search' }]);
  });
});
