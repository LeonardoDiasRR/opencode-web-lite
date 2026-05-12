import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSessionStore } from '../store/sessionStore.js';

describe('sessionStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useSessionStore.setState({ activeSession: null, sessions: [], status: 'idle', error: null });
  });

  it('creates active sessions', () => {
    const session = useSessionStore.getState().createSession('/project', 'plan');

    expect(session.id).toMatch(/^ses_/);
    expect(session.activeAgent).toBe('plan');
    expect(useSessionStore.getState().activeSession?.id).toBe(session.id);
  });

  it('saves active sessions and index', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));
    useSessionStore.getState().createSession('/project', 'build');

    await useSessionStore.getState().saveActiveSession({ baseUrl: 'http://localhost:7847', token: 'secret' }, '/project', [], 'build');

    expect(useSessionStore.getState().sessions).toHaveLength(1);
    expect(useSessionStore.getState().status).toBe('idle');
  });

  it('closes session with fallback summary', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));
    useSessionStore.getState().createSession('/project', 'build');

    await useSessionStore.getState().closeActiveSession(
      { baseUrl: 'http://localhost:7847', token: 'secret' },
      '/project',
      [{ id: '1', role: 'user', content: 'Implementar login', createdAt: 'a' }],
      'build'
    );

    expect(useSessionStore.getState().activeSession?.status).toBe('closed');
    expect(useSessionStore.getState().activeSession?.summary?.title).toBe('Implementar login');
  });

  it('preserves message metadata in active session', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));
    useSessionStore.getState().createSession('/project', 'build');

    await useSessionStore.getState().saveActiveSession(
      { baseUrl: 'http://localhost:7847', token: 'secret' },
      '/project',
      [{ id: '1', role: 'assistant', content: 'ok', createdAt: 'a', metadata: { subagentId: 'explore' } }],
      'build'
    );

    expect(useSessionStore.getState().activeSession?.messages[0].metadata).toEqual({ subagentId: 'explore' });
  });
});
