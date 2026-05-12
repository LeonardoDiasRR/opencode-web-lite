import { afterEach, describe, expect, it, vi } from 'vitest';
import { useProviderStore } from '../store/providerStore.js';

describe('providerStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    useProviderStore.setState({
      providerId: 'openrouter',
      apiKey: '',
      baseUrl: 'https://openrouter.ai/api/v1',
      selectedModel: '',
      models: [],
      status: 'idle',
      error: null,
    });
  });

  it('hydrates provider selection from workspace config', () => {
    useProviderStore.getState().hydrateFromConfig({
      provider: { name: 'openai-compatible', model: 'llama3', apiKey: 'key', baseUrl: 'http://localhost:11434/v1' },
    });

    expect(useProviderStore.getState()).toMatchObject({
      providerId: 'openai-compatible',
      selectedModel: 'llama3',
      apiKey: 'key',
      baseUrl: 'http://localhost:11434/v1',
    });
  });

  it('loads models and selects the first model', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: [{ id: 'model-a' }] })));
    useProviderStore.setState({ apiKey: 'key' });

    await useProviderStore.getState().loadModels();

    expect(useProviderStore.getState()).toMatchObject({
      models: [{ id: 'model-a', name: 'model-a' }],
      selectedModel: 'model-a',
      status: 'idle',
    });
  });

  it('saves provider config', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true })));
    useProviderStore.setState({ apiKey: 'key', selectedModel: 'model-a' });

    await expect(
      useProviderStore.getState().save({ baseUrl: 'http://localhost:7847', token: 'secret' }, '/project', { version: '1' })
    ).resolves.toEqual({
      version: '1',
      provider: {
        name: 'openrouter',
        model: 'model-a',
        apiKey: 'key',
        baseUrl: 'https://openrouter.ai/api/v1',
      },
    });
    expect(useProviderStore.getState().status).toBe('saved');
  });
});
