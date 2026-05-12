export type ProviderId = 'openrouter' | 'openai-compatible';

export interface ProviderDefinition {
  id: ProviderId;
  label: string;
  defaultBaseUrl: string;
  requiresCustomBaseUrl: boolean;
}

export interface ModelInfo {
  id: string;
  name: string;
}

export interface ProviderSelection {
  name: ProviderId;
  model: string;
  apiKey: string;
  baseUrl: string;
}

export interface ModelsResponse {
  data?: Array<{ id: string; name?: string }>;
}
