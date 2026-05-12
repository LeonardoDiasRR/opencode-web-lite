import { afterEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from '../store/chatStore.js';

function streamResponse(text: string) {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({ start(controller) { controller.enqueue(encoder.encode(text)); controller.close(); } }));
}

describe('chatStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useChatStore.setState({ activeAgent: 'build', messages: [], status: 'idle', error: null });
  });

  it('accumulates assistant deltas', () => {
    const message = useChatStore.getState().addMessage({ role: 'assistant', content: '', agentId: 'build' });

    useChatStore.getState().appendAssistantDelta(message.id, 'Hello');
    useChatStore.getState().appendAssistantDelta(message.id, ' world');

    expect(useChatStore.getState().messages[0].content).toBe('Hello world');
  });

  it('sends a message and streams assistant response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(streamResponse('data: {"choices":[{"delta":{"content":"Resposta"}}]}\n\ndata: [DONE]\n\n'));

    await useChatStore.getState().sendMessage('Oi', {
      provider: { name: 'openrouter', model: 'm', apiKey: 'key', baseUrl: 'https://api.test/v1' },
    });

    expect(useChatStore.getState().messages.map((message) => message.content)).toEqual(['Oi', 'Resposta']);
    expect(useChatStore.getState().status).toBe('idle');
  });

  it('shows error without provider', async () => {
    await useChatStore.getState().sendMessage('Oi', { version: '1' });

    expect(useChatStore.getState().error).toBe('Configure um provider e modelo antes de enviar mensagens.');
  });

  it('routes valid mentions to subagents without changing active primary agent', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(streamResponse('data: {"choices":[{"delta":{"content":"Achei"}}]}\n\ndata: [DONE]\n\n'));

    await useChatStore.getState().sendMessage('@explore encontre sessões', {
      provider: { name: 'openrouter', model: 'm', apiKey: 'key', baseUrl: 'https://api.test/v1' },
    });

    const state = useChatStore.getState();
    expect(state.activeAgent).toBe('build');
    expect(state.messages[0]).toMatchObject({ content: 'encontre sessões', metadata: { subagentId: 'explore' } });
    expect(state.messages[1]).toMatchObject({ content: 'Achei', metadata: { subagentId: 'explore' } });
    const request = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string) as { messages: Array<{ content: string }> };
    expect(request.messages[0].content).toContain('subagente Explore');
  });
});
