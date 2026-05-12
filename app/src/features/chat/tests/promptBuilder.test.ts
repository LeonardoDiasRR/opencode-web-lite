import { describe, expect, it } from 'vitest';
import { getPrimaryAgent } from '../../agents/services/primaryAgents.js';
import { buildSystemPrompt } from '../services/promptBuilder.js';

describe('buildSystemPrompt', () => {
  it('builds Build prompt', () => {
    expect(buildSystemPrompt(getPrimaryAgent('build'))).toContain('Você é o agente Build.');
    expect(buildSystemPrompt(getPrimaryAgent('build'))).toContain('edit: allow');
  });

  it('builds Plan prompt with ask permissions', () => {
    const prompt = buildSystemPrompt(getPrimaryAgent('plan'));

    expect(prompt).toContain('Você é o agente Plan.');
    expect(prompt).toContain('edit: ask');
    expect(prompt).toContain('bash: ask');
  });
});
