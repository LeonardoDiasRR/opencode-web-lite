import { isValidSkillName, type SkillMetadata } from '../types/skill.js';

export interface ParsedSkill {
  metadata: SkillMetadata;
  content: string;
}

export function parseSkillMarkdown(markdown: string, expectedName: string): ParsedSkill {
  let metadata: SkillMetadata = { name: expectedName };
  let content = markdown;

  if (markdown.startsWith('---\n')) {
    const end = markdown.indexOf('\n---', 4);
    if (end === -1) throw new Error('Unterminated skill frontmatter');
    metadata = { ...metadata, ...parseFrontmatter(markdown.slice(4, end)) };
    content = markdown.slice(end + 4).trimStart();
  }

  if (metadata.name !== expectedName) throw new Error('Skill name must match directory name');
  if (!isValidSkillName(metadata.name)) throw new Error('Invalid skill name');
  return { metadata, content };
}

function parseFrontmatter(frontmatter: string): Partial<SkillMetadata> {
  const parsed: Partial<SkillMetadata> = {};
  for (const line of frontmatter.split('\n')) {
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const key = match[1] as keyof SkillMetadata;
    const value = match[2].replace(/^['"]|['"]$/g, '');
    if (['name', 'description', 'license', 'compatibility'].includes(key)) {
      parsed[key] = value as never;
    }
  }
  return parsed;
}
