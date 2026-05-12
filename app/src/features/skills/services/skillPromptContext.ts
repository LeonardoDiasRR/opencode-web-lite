import type { PromptSkill } from '../types/skill.js';

export function buildSkillPromptContext(skills: PromptSkill[]): string {
  if (skills.length === 0) return '';
  return [
    'Skills carregadas:',
    ...skills.map((skill) => [`## ${skill.name}`, skill.description ? `Descrição: ${skill.description}` : '', 'Conteúdo:', skill.content].filter(Boolean).join('\n')),
  ].join('\n');
}
