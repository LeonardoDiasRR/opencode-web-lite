import type { ChatMessage } from '../../chat/types/chat.js';

export type CompactionStatus = 'idle' | 'compacting' | 'error';
export interface CompactionSummary { summary: string; createdAt: string; messageCount: number }
export interface CompactionSnapshot { summary: string; retainedMessages: ChatMessage[]; createdAt: string }
export interface CompactionTrigger { maxMessages: number; maxCharacters: number }
export const defaultCompactionTrigger: CompactionTrigger = { maxMessages: 12, maxCharacters: 8000 };
export function needsCompaction(messages: ChatMessage[], trigger = defaultCompactionTrigger): boolean {
  return messages.length > trigger.maxMessages || messages.reduce((sum, message) => sum + message.content.length, 0) > trigger.maxCharacters;
}
