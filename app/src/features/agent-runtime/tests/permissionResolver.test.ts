import { describe, expect, it } from 'vitest';
import { getPrimaryAgent } from '../../agents/services/primaryAgents.js';
import { getSubagent } from '../../subagents/services/subagentCatalog.js';
import { resolveToolPermission } from '../services/permissionResolver.js';

describe('resolveToolPermission', () => {
  it('allows Build read tools', () => {
    expect(resolveToolPermission('fs.read', getPrimaryAgent('build', null))).toBe('allow');
  });

  it('requires approval for Plan edit tools', () => {
    expect(resolveToolPermission('fs.write', getPrimaryAgent('plan', null))).toBe('ask');
  });

  it('lets deny win for read-only subagents', () => {
    expect(resolveToolPermission('terminal.exec', getPrimaryAgent('build', null), getSubagent('explore'))).toBe('deny');
  });
});
