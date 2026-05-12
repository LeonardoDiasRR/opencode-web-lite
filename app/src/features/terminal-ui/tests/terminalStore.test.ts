import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTerminalStore } from '../store/terminalStore.js';

describe('terminalStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useTerminalStore.setState({ history: [], output: '', status: 'idle', error: null });
  });

  it('records command output', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ stdout: 'hello', stderr: '', exitCode: 0, timedOut: false })));

    await useTerminalStore.getState().run('http://local', 't', '/w', 'echo hello');

    expect(useTerminalStore.getState().output).toBe('hello');
    expect(useTerminalStore.getState().history).toHaveLength(1);
  });
});
