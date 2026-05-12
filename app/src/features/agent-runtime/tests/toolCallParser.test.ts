import { describe, expect, it, vi } from 'vitest';
import { parseToolCalls, stripToolCallBlocks } from '../services/toolCallParser.js';

describe('toolCallParser', () => {
  it('parses delimited tool calls', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001');
    const calls = parseToolCalls('texto\n```tool_call\n{"name":"fs.read","arguments":{"path":"C:/p/a.txt"}}\n```');
    expect(calls).toEqual([{ id: '00000000-0000-4000-8000-000000000001', name: 'fs.read', arguments: { path: 'C:/p/a.txt' }, status: 'pending', permission: 'ask' }]);
  });

  it('removes tool call blocks from visible assistant content', () => {
    expect(stripToolCallBlocks('antes\n```tool_call\n{"name":"fs.list"}\n```\ndepois')).toBe('antes\n\ndepois');
  });
});
