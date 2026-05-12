import type { ProviderSelection } from '../../providers/types/provider.js';
import type { ChatMessage } from '../../chat/types/chat.js';
import type { CompactionSnapshot } from '../types/compaction.js';

export function buildCompactionPrompt(messages: ChatMessage[], existingSummary?: string): string {
  return [`Compacte a conversa preservando decisões e próximos passos.`, existingSummary ? `Resumo anterior:\n${existingSummary}` : '', ...messages.map((message) => `${message.role}: ${message.content}`)].filter(Boolean).join('\n');
}

export async function compactMessages(provider: ProviderSelection | undefined, messages: ChatMessage[], keepLast = 6, existingSummary?: string): Promise<CompactionSnapshot> {
  const oldMessages = messages.slice(0, Math.max(0, messages.length - keepLast));
  const retainedMessages = messages.slice(-keepLast);
  let summary = createFallbackSummary(oldMessages, existingSummary);
  if (provider?.apiKey && provider.baseUrl && provider.model && oldMessages.length > 0) {
    try {
      const response = await fetch(`${provider.baseUrl.replace(/\/$/, '')}/chat/completions`, { method: 'POST', headers: { Authorization: `Bearer ${provider.apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: provider.model, messages: [{ role: 'user', content: buildCompactionPrompt(oldMessages, existingSummary) }], stream: false }) });
      if (response.ok) {
        const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        summary = body.choices?.[0]?.message?.content ?? summary;
      }
    } catch {}
  }
  return { summary, retainedMessages, createdAt: new Date().toISOString() };
}

function createFallbackSummary(messages: ChatMessage[], existingSummary?: string): string {
  const text = messages.map((message) => `${message.role}: ${message.content}`).join('\n').slice(0, 1200);
  return [existingSummary, text || 'Sem mensagens antigas para compactar.'].filter(Boolean).join('\n');
}
