import type { ChatMessage, ChatProviderConfig } from '../types/chat.js';

export class ChatClientError extends Error {}

export async function streamChatCompletion(
  provider: ChatProviderConfig,
  messages: Array<Pick<ChatMessage, 'role' | 'content'>>,
  onDelta: (delta: string) => void
): Promise<void> {
  const response = await fetch(`${provider.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: provider.model, messages, stream: true }),
  });

  if (!response.ok) throw new ChatClientError(`Chat request failed (${response.status})`);
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) parseSsePart(part, onDelta);
  }
  if (buffer) parseSsePart(buffer, onDelta);
}

function parseSsePart(part: string, onDelta: (delta: string) => void) {
  for (const line of part.split('\n')) {
    if (!line.startsWith('data:')) continue;
    const raw = line.slice(5).trim();
    if (!raw || raw === '[DONE]') continue;
    const parsed = JSON.parse(raw) as { choices?: Array<{ delta?: { content?: string } }> };
    const delta = parsed.choices?.[0]?.delta?.content;
    if (delta) onDelta(delta);
  }
}
