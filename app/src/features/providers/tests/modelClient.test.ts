import { afterEach, describe, expect, it, vi } from 'vitest';
import { listModels, ModelClientError } from '../services/modelClient.js';

describe('listModels', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads OpenRouter models', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: 'openai/gpt-4o-mini', name: 'GPT 4o mini' }] }))
    );

    await expect(listModels('openrouter', 'key')).resolves.toEqual([{ id: 'openai/gpt-4o-mini', name: 'GPT 4o mini' }]);
    expect(fetchMock).toHaveBeenCalledWith('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: 'Bearer key' },
    });
  });

  it('loads OpenAI-compatible models from custom base URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: [{ id: 'llama3' }] })));

    await expect(listModels('openai-compatible', 'key', 'http://localhost:11434/v1/')).resolves.toEqual([{ id: 'llama3', name: 'llama3' }]);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:11434/v1/models', {
      headers: { Authorization: 'Bearer key' },
    });
  });

  it('throws on HTTP errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 401 }));

    await expect(listModels('openrouter', 'bad')).rejects.toEqual(new ModelClientError('Failed to load models (401)'));
  });

  it('returns empty list when response has no models', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({})));

    await expect(listModels('openrouter', 'key')).resolves.toEqual([]);
  });
});
