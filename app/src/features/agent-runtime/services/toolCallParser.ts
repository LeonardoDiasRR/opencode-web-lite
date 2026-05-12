import type { ToolCall } from '../types/toolCall.js';

const blockPattern = /```tool_call\s*([\s\S]*?)```/g;

export function parseToolCalls(content: string): ToolCall[] {
  const calls: ToolCall[] = [];
  for (const match of content.matchAll(blockPattern)) {
    const parsed = JSON.parse(match[1].trim()) as { name?: unknown; arguments?: unknown };
    if (typeof parsed.name !== 'string' || (parsed.arguments !== undefined && !isRecord(parsed.arguments))) {
      throw new Error('Tool call inválida.');
    }
    calls.push({
      id: crypto.randomUUID(),
      name: parsed.name,
      arguments: parsed.arguments ?? {},
      status: 'pending',
      permission: 'ask',
    });
  }
  return calls;
}

export function stripToolCallBlocks(content: string): string {
  return content.replace(blockPattern, '').trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
