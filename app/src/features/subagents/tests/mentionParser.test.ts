import { describe, expect, it } from 'vitest';
import { parseSubagentMention } from '../services/mentionParser.js';

describe('parseSubagentMention', () => {
  it('parses supported mentions and cleans content', () => {
    expect(parseSubagentMention('@explore find auth code')).toMatchObject({ subagent: { id: 'explore' }, content: 'find auth code' });
  });

  it('parses inline supported mentions', () => {
    expect(parseSubagentMention('please @scout search docs')).toMatchObject({ subagent: { id: 'scout' }, content: 'please search docs' });
  });

  it('ignores unknown mentions', () => {
    expect(parseSubagentMention('@deploy now')).toEqual({ content: '@deploy now' });
  });
});
