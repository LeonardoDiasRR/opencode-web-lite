import type { SessionSummary } from '../types/session.js';
import type { ChatMessage } from '../../chat/types/chat.js';

export function createFallbackSessionSummary(messages: ChatMessage[]): SessionSummary {
  const firstUserMessage = messages.find((message) => message.role === 'user')?.content.trim();
  const title = firstUserMessage ? firstUserMessage.slice(0, 60) : 'Sessão sem título';
  const assistantCount = messages.filter((message) => message.role === 'assistant').length;
  return { title, summary: `Sessão com ${messages.length} mensagens e ${assistantCount} respostas do assistente.` };
}
