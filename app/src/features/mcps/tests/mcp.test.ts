import { describe, expect, it } from 'vitest';
import { isValidMcpConfig, isValidMcpName } from '../types/mcp.js';

describe('mcp types', () => {
  it('validates names and configs', () => {
    expect(isValidMcpName('github-tools')).toBe(true);
    expect(isValidMcpName('GitHub')).toBe(false);
    expect(isValidMcpConfig({ name: 'github', transport: 'stdio', enabled: true, command: 'node server.js' })).toBe(true);
    expect(isValidMcpConfig({ name: 'github', transport: 'http', enabled: true })).toBe(false);
  });
});
