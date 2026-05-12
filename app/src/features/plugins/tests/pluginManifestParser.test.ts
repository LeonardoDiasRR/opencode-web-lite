import { describe, expect, it } from 'vitest';
import { parsePluginManifest } from '../services/pluginManifestParser.js';
import { isValidPluginName } from '../types/plugin.js';

describe('pluginManifestParser', () => {
  it('validates plugin names', () => {
    expect(isValidPluginName('audit-tools')).toBe(true);
    expect(isValidPluginName('Audit_Tools')).toBe(false);
  });

  it('parses manifest with defaults', () => {
    expect(parsePluginManifest('{"name":"audit-tools","description":"Audit","hooks":["message:before"],"tools":[{"name":"scan","description":"Scan"}]}', 'audit-tools')).toEqual({
      name: 'audit-tools',
      description: 'Audit',
      version: undefined,
      main: 'index.js',
      hooks: ['message:before'],
      tools: [{ name: 'scan', description: 'Scan' }],
      permissions: [],
    });
  });

  it('rejects mismatched names', () => {
    expect(() => parsePluginManifest('{"name":"other"}', 'plugin')).toThrow('Plugin name must match directory name');
  });
});
