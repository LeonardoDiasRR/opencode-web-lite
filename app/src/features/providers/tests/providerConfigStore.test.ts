import { afterEach, describe, expect, it, vi } from 'vitest';
import { mergeProviderConfig, saveProviderConfig } from '../services/providerConfigStore.js';

const selection = {
  name: 'openrouter' as const,
  model: 'openai/gpt-4o-mini',
  apiKey: 'key',
  baseUrl: 'https://openrouter.ai/api/v1',
};

describe('providerConfigStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('merges provider config without losing existing keys', () => {
    expect(mergeProviderConfig({ version: '1', agents: { plan: {} }, skills: {}, custom: true }, selection)).toEqual({
      version: '1',
      agents: { plan: {} },
      skills: {},
      custom: true,
      provider: selection,
    });
  });

  it('writes opencode config through the service', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true })));

    await expect(
      saveProviderConfig({ baseUrl: 'http://localhost:7847', token: 'secret' }, 'C:\\project', { version: '1', agents: {} }, selection)
    ).resolves.toEqual({ version: '1', agents: {}, provider: selection });

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:7847/fs/write', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer secret',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: 'C:\\project\\.opencode\\opencode.json',
        content: `${JSON.stringify({ version: '1', agents: {}, provider: selection }, null, 2)}\n`,
      }),
    });
  });
});
