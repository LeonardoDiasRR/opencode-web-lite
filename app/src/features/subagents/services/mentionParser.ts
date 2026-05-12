import { findSubagent } from './subagentCatalog.js';
import type { Subagent } from '../types/subagent.js';

export interface ParsedSubagentMention {
  subagent?: Subagent;
  content: string;
}

export function parseSubagentMention(content: string): ParsedSubagentMention {
  const match = content.match(/(^|\s)@(general|explore|scout)\b/i);
  if (!match?.[2]) return { content };
  const subagent = findSubagent(match[2].toLowerCase());
  if (!subagent) return { content };
  const start = match.index ?? 0;
  const mentionStart = start + match[1].length;
  const cleaned = `${content.slice(0, mentionStart)}${content.slice(mentionStart + match[0].trimStart().length)}`.trim().replace(/\s+/g, ' ');
  return { subagent, content: cleaned };
}
