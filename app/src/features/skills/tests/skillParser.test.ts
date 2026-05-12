import { describe, expect, it } from 'vitest';
import { isValidSkillName } from '../types/skill.js';
import { parseSkillMarkdown } from '../services/skillParser.js';

describe('skillParser', () => {
  it('validates skill names', () => {
    expect(isValidSkillName('project-style')).toBe(true);
    expect(isValidSkillName('Project_Style')).toBe(false);
  });

  it('parses valid frontmatter', () => {
    expect(parseSkillMarkdown('---\nname: project-style\ndescription: Style rules\n---\nUse semicolons.', 'project-style')).toEqual({
      metadata: { name: 'project-style', description: 'Style rules' },
      content: 'Use semicolons.',
    });
  });

  it('uses directory name without frontmatter', () => {
    expect(parseSkillMarkdown('Plain content', 'plain-skill')).toEqual({ metadata: { name: 'plain-skill' }, content: 'Plain content' });
  });

  it('rejects mismatched names', () => {
    expect(() => parseSkillMarkdown('---\nname: other\n---\nBody', 'skill')).toThrow('Skill name must match directory name');
  });
});
