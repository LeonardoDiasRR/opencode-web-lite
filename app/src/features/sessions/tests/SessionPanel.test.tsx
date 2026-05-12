import { render, screen } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from '../../chat/store/chatStore.js';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { SessionPanel } from '../components/SessionPanel.js';
import { useSessionStore } from '../store/sessionStore.js';

describe('SessionPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://127.0.0.1:7847', token: '', serviceVersion: null, status: 'idle', error: null });
      useWorkspaceStore.setState({ path: '', status: 'idle', config: null, error: null });
      useChatStore.setState({ activeAgent: 'build', messages: [], status: 'idle', error: null });
      useSessionStore.setState({ activeSession: null, sessions: [], status: 'idle', error: null });
    });
  });

  it('is blocked until workspace is ready', () => {
    render(<SessionPanel />);

    expect(screen.getByRole('button', { name: 'Nova sessão' })).toBeDisabled();
    expect(screen.getByText('Conecte ao serviço e inicialize um workspace para gerenciar sessões.')).toBeInTheDocument();
  });

  it('creates and renders active session', async () => {
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://localhost:7847', token: 'secret', serviceVersion: '0.1.0', status: 'connected' });
      useWorkspaceStore.setState({ path: '/project', status: 'ready', config: {}, error: null });
    });
    render(<SessionPanel />);

    await userEvent.click(screen.getByRole('button', { name: 'Nova sessão' }));

    expect(screen.getByText(/ID: ses_/)).toBeInTheDocument();
  });

  it('resumes previous sessions', async () => {
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://localhost:7847', token: 'secret', serviceVersion: '0.1.0', status: 'connected' });
      useWorkspaceStore.setState({ path: '/project', status: 'ready', config: {}, error: null });
      useSessionStore.setState({ sessions: [{ id: 'ses_old', title: 'Correção de login', status: 'closed', createdAt: 'a', updatedAt: 'b' }] });
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ content: JSON.stringify({ id: 'ses_old', workspacePath: '/project', messages: [], activeAgent: 'build', status: 'closed', createdAt: 'a', updatedAt: 'b' }), size: 1 })));
    render(<SessionPanel />);

    await userEvent.click(screen.getByRole('button', { name: /Correção de login/ }));

    expect(useSessionStore.getState().activeSession?.id).toBe('ses_old');
  });
});
