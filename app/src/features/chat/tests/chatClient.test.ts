import { afterEach, describe, expect, it, vi } from 'vitest';
import { streamChatCompletion, ChatClientError } from '../services/chatClient.js';

function streamResponse(text: string) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    })
  );
}

describe('streamChatCompletion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('streams deltas from OpenAI-compatible SSE', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      streamResponse('data: {"choices":[{"delta":{"content":"Olá"}}]}\n\ndata: {"choices":[{"delta":{"content":" mundo"}}]}\n\ndata: [DONE]\n\n')
    );
    const deltas: string[] = [];

    await streamChatCompletion({ apiKey: 'key', baseUrl: 'https://api.test/v1/', model: 'm' }, [{ role: 'user', content: 'oi' }], (delta) => deltas.push(delta));

    expect(deltas).toEqual(['Olá', ' mundo']);
    expect(fetchMock).toHaveBeenCalledWith('https://api.test/v1/chat/completions', expect.objectContaining({ method: 'POST' }));
  });

  it('throws on HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }));

    await expect(streamChatCompletion({ apiKey: 'key', baseUrl: 'https://api.test/v1', model: 'm' }, [], () => undefined)).rejects.toEqual(
      new ChatClientError('Chat request failed (500)')
    );
  });
});
