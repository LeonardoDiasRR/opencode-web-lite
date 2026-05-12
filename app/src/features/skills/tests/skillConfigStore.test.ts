import { afterEach, describe, expect, it, vi } from 'vitest';
import { saveSkillPermission } from '../services/skillConfigStore.js';

describe('saveSkillPermission', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes merged skill config', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true })));

    await expect(saveSkillPermission({ baseUrl: 'http://localhost:7847', token: 'secret' }, 'C:\\project', { version: '1' }, 'docs', 'allow')).resolves.toEqual({
      version: '1',
      skills: { docs: 'allow' },
    });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:7847/fs/write', expect.objectContaining({ method: 'POST' }));
  });
});
