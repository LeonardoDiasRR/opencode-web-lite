import type { ModelInfo, ModelsResponse, ProviderId } from '../types/provider.js';
import { getProviderDefinition } from './providerCatalog.js';

export class ModelClientError extends Error {}

export async function listModels(providerId: ProviderId, apiKey: string, baseUrl?: string): Promise<ModelInfo[]> {
  const provider = getProviderDefinition(providerId);
  const url = `${(baseUrl || provider.defaultBaseUrl).replace(/\/$/, '')}/models`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    throw new ModelClientError(`Failed to load models (${response.status})`);
  }

  const body = (await response.json()) as ModelsResponse;
  return (body.data ?? []).map((model) => ({ id: model.id, name: model.name ?? model.id }));
}
