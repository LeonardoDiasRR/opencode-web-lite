import type { ProviderDefinition, ProviderId } from '../types/provider.js';

export const providerCatalog: ProviderDefinition[] = [
  {
    id: 'openrouter',
    label: 'OpenRouter',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    requiresCustomBaseUrl: false,
  },
  {
    id: 'openai-compatible',
    label: 'OpenAI-compatible',
    defaultBaseUrl: 'http://localhost:11434/v1',
    requiresCustomBaseUrl: true,
  },
];

export function getProviderDefinition(providerId: ProviderId): ProviderDefinition {
  return providerCatalog.find((provider) => provider.id === providerId) ?? providerCatalog[0];
}
