import { describe, expect, it } from 'vitest';
import { getPrimaryAgent } from '../services/primaryAgents.js';

describe('getPrimaryAgent', () => {
  it('uses Build defaults', () => {
    expect(getPrimaryAgent('build')).toMatchObject({
      id: 'build',
      effort: 'low',
      permissions: { read: 'allow', edit: 'allow', bash: 'allow', webfetch: 'allow' },
    });
  });

  it('uses Plan defaults', () => {
    expect(getPrimaryAgent('plan')).toMatchObject({
      id: 'plan',
      effort: 'medium',
      permissions: { read: 'allow', edit: 'ask', bash: 'ask', webfetch: 'allow' },
    });
  });

  it('applies workspace overrides', () => {
    expect(getPrimaryAgent('plan', { agents: { plan: { effort: 'high', model: 'custom', permission: { bash: 'deny' } } } })).toMatchObject({
      effort: 'high',
      model: 'custom',
      permissions: { bash: 'deny', edit: 'ask' },
    });
  });
});
