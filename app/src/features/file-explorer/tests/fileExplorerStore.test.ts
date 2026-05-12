import { afterEach, describe, expect, it, vi } from 'vitest';
import { useFileExplorerStore } from '../store/fileExplorerStore.js';

describe('fileExplorerStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useFileExplorerStore.setState({ entries: [], selectedPath: null, content: '', status: 'idle', error: null });
  });

  it('opens and saves files inside the workspace', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ path: '/w/a.ts', content: 'old' })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, path: '/w/a.ts' })));

    await useFileExplorerStore.getState().open('http://local', 't', '/w', '/w/a.ts');
    await useFileExplorerStore.getState().save('http://local', 't', '/w', 'new');

    expect(useFileExplorerStore.getState().content).toBe('new');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
