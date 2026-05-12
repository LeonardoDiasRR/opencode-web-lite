import { describe, expect, it } from 'vitest';
import { getSubagent, subagents } from '../services/subagentCatalog.js';

describe('subagentCatalog', () => {
  it('defines supported subagents', () => {
    expect(subagents.map((subagent) => subagent.id)).toEqual(['general', 'explore', 'scout']);
  });

  it('keeps Explore and Scout read-only for local changes', () => {
    expect(getSubagent('explore').permissions).toMatchObject({ read: 'allow', edit: 'deny', bash: 'deny' });
    expect(getSubagent('scout').permissions).toMatchObject({ edit: 'deny', bash: 'deny', webfetch: 'allow' });
  });

  it('denies todo for General', () => {
    expect(getSubagent('general').permissions.todo).toBe('deny');
  });
});
