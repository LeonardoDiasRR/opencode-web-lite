import type { PrimaryAgentId } from '../../agents/types/agent.js';

export type ChatRole = 'system' | 'user' | 'assistant';
export type ChatStatus = 'idle' | 'streaming' | 'error';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  agentId?: PrimaryAgentId;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface ChatProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}
