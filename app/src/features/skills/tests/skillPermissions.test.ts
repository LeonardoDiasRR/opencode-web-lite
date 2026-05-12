import { describe, expect, it } from 'vitest';
import { getSkillPermission, mergeSkillPermission } from '../services/skillPermissions.js';

describe('skillPermissions', () => {
  it('resolves exact, wildcard and fallback permissions', () => {
    const config = { skills: { '*': 'ask', 'internal-*': 'deny', docs: 'allow' } };

    expect(getSkillPermission(config, 'docs')).toBe('allow');
    expect(getSkillPermission(config, 'internal-api')).toBe('deny');
    expect(getSkillPermission(config, 'other')).toBe('ask');
  });

  it('merges permission without losing config keys', () => {
    expect(mergeSkillPermission({ version: '1', provider: { name: 'x' }, skills: { '*': 'ask' } }, 'docs', 'allow')).toEqual({
      version: '1',
      provider: { name: 'x' },
      skills: { '*': 'ask', docs: 'allow' },
    });
  });
});
