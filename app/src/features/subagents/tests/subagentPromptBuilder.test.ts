import { describe, expect, it } from 'vitest';
import { getPrimaryAgent } from '../../agents/services/primaryAgents.js';
import { getSubagent } from '../services/subagentCatalog.js';
import { buildSubagentPrompt } from '../services/subagentPromptBuilder.js';

describe('buildSubagentPrompt', () => {
  it('builds General prompt with no todo', () => {
    const prompt = buildSubagentPrompt(getSubagent('general'), getPrimaryAgent('build'));

    expect(prompt).toContain('Você é o subagente General.');
    expect(prompt).toContain('todo: deny');
  });

  it('builds Explore prompt as read-only', () => {
    const prompt = buildSubagentPrompt(getSubagent('explore'), getPrimaryAgent('plan'));

    expect(prompt).toContain('edit: deny');
    expect(prompt).toContain('bash: deny');
  });
});
