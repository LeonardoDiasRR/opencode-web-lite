import type { PrimaryAgentId } from '../../agents/types/agent.js';
import type { ChatMessage } from '../../chat/types/chat.js';

export type SessionStatus = 'active' | 'closed';

export interface SessionSummary {
  title: string;
  summary: string;
}

export interface SessionRecord {
  id: string;
  workspacePath: string;
  messages: ChatMessage[];
  activeAgent: PrimaryAgentId;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  summary?: SessionSummary;
}

export interface SessionIndexEntry {
  id: string;
  title?: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}
