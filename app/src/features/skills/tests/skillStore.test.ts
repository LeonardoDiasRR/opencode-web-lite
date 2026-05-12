import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSkillStore } from '../store/skillStore.js';

describe('skillStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useSkillStore.setState({ skills: [], status: 'idle', error: null, approvedSkills: [] });
  });

  it('returns only allowed or approved prompt skills', () => {
    useSkillStore.setState({
      skills: [
        { name: 'docs', origin: 'opencode', directoryPath: '', filePath: '', metadata: { name: 'docs', description: 'Docs' }, content: 'Read docs', loadState: 'loaded' },
        { name: 'secret', origin: 'opencode', directoryPath: '', filePath: '', metadata: { name: 'secret' }, content: 'No', loadState: 'loaded' },
      ],
      approvedSkills: ['docs'],
    });

    expect(useSkillStore.getState().getPromptSkills({ skills: { secret: 'deny' } })).toEqual([{ name: 'docs', description: 'Docs', content: 'Read docs' }]);
  });

  it('saves permission', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true })));

    await expect(useSkillStore.getState().savePermission({ baseUrl: 'http://localhost:7847', token: 'secret' }, '/project', {}, 'docs', 'allow')).resolves.toEqual({
      version: '1',
      skills: { docs: 'allow' },
    });
  });
});
