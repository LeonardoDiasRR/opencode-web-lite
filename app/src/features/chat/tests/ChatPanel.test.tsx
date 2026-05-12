import { render, screen } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { ChatPanel } from '../components/ChatPanel.js';
import { useChatStore } from '../store/chatStore.js';

function streamResponse(text: string) {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({ start(controller) { controller.enqueue(encoder.encode(text)); controller.close(); } }));
}

describe('ChatPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://127.0.0.1:7847', token: '', serviceVersion: null, status: 'idle', error: null });
      useWorkspaceStore.setState({ path: '', status: 'idle', config: null, error: null });
      useChatStore.setState({ activeAgent: 'build', messages: [], status: 'idle', error: null });
    });
  });

  it('is disabled until provider is ready', () => {
    render(<ChatPanel />);

    expect(screen.getByPlaceholderText('Peça uma alteração ou plano...')).toBeDisabled();
  });

  it('switches agent and sends message', async () => {
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://localhost:7847', token: 'secret', serviceVersion: '0.1.0', status: 'connected' });
      useWorkspaceStore.setState({
        path: 'C:\\project',
        status: 'ready',
        error: null,
        config: { provider: { name: 'openrouter', model: 'm', apiKey: 'key', baseUrl: 'https://api.test/v1' } },
      });
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(streamResponse('data: {"choices":[{"delta":{"content":"Plano"}}]}\n\ndata: [DONE]\n\n'));
    render(<ChatPanel />);

    await userEvent.click(screen.getByRole('button', { name: 'Plan' }));
    await userEvent.type(screen.getByPlaceholderText('Peça uma alteração ou plano...'), 'Planeje');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Plano')).toBeInTheDocument();
    expect(useChatStore.getState().activeAgent).toBe('plan');
  });

  it('shows subagent hint and badge', async () => {
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://localhost:7847', token: 'secret', serviceVersion: '0.1.0', status: 'connected' });
      useWorkspaceStore.setState({
        path: 'C:\\project',
        status: 'ready',
        error: null,
        config: { provider: { name: 'openrouter', model: 'm', apiKey: 'key', baseUrl: 'https://api.test/v1' } },
      });
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(streamResponse('data: {"choices":[{"delta":{"content":"Busca"}}]}\n\ndata: [DONE]\n\n'));
    render(<ChatPanel />);

    expect(screen.getByText(/@general/)).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('Peça uma alteração ou plano...'), '@explore procure rotas');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect((await screen.findAllByText('@explore')).length).toBeGreaterThanOrEqual(2);
  });
});
