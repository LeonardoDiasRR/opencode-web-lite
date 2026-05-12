import { describe, expect, it } from 'vitest';
import { getProviderDefinition, providerCatalog } from '../services/providerCatalog.js';

describe('providerCatalog', () => {
  it('contains supported providers with defaults', () => {
    expect(providerCatalog.map((provider) => provider.label)).toEqual(['OpenRouter', 'OpenAI-compatible']);
    expect(getProviderDefinition('openrouter').defaultBaseUrl).toBe('https://openrouter.ai/api/v1');
    expect(getProviderDefinition('openai-compatible').requiresCustomBaseUrl).toBe(true);
  });
});
