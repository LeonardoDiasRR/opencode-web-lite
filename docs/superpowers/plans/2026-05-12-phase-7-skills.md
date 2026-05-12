# Fase 7 — Skills: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar descoberta, listagem, carregamento sob demanda e controle de permissões para skills definidas em arquivos `SKILL.md` no workspace.

**Architecture:** Nova feature `app/src/features/skills` na SPA para descoberta, parsing, permissões e UI. Complemento no serviço local para operações de descoberta de skills se a SPA não conseguir fazer varredura eficiente apenas com `/fs/list` e `/fs/read`. As configurações de permissão são persistidas em `.opencode/opencode.json` na chave `skills`.

**Skill Locations:**
- `.opencode/skills/<name>/SKILL.md`
- `.claude/skills/<name>/SKILL.md`
- `.agents/skills/<name>/SKILL.md`

**Out of Scope:**
- Skills globais do usuário
- Execução automática de código vindo de skills
- Marketplace ou instalação remota de skills

---

## Task 1: Tipos de Skill

- [x] Criar `app/src/features/skills/types/skill.ts`
- [x] Modelar `SkillMetadata`, `DiscoveredSkill`, `SkillPermission` e `SkillLoadState`
- [x] Validar nome por regex `^[a-z0-9]+(-[a-z0-9]+)*$`
- [x] Testar validação de nomes válidos e inválidos

---

## Task 2: Parser de `SKILL.md`

- [x] Criar `app/src/features/skills/services/skillParser.ts`
- [x] Parsear frontmatter YAML mínimo (`name`, `description`, `license`, `compatibility`, `metadata`)
- [x] Validar que `name` coincide com o diretório
- [x] Retornar conteúdo markdown sem frontmatter
- [x] Testar frontmatter válido, ausente e inválido

---

## Task 3: Descoberta de Skills

- [x] Criar `app/src/features/skills/services/skillDiscovery.ts`
- [x] Procurar skills nas três localizações suportadas dentro do workspace
- [x] Usar `/fs/list` e `/fs/read` do serviço local
- [x] Ignorar diretórios sem `SKILL.md`
- [x] Retornar lista ordenada por nome e origem
- [x] Testar descoberta com filesystem mockado via client do serviço

---

## Task 4: Permissões de Skills

- [x] Criar `app/src/features/skills/services/skillPermissions.ts`
- [x] Suportar permissões `allow`, `deny`, `ask`
- [x] Suportar wildcards simples como `internal-*`
- [x] Ler e gravar permissões em `workspace.config.skills`
- [x] Testar match exato, wildcard e fallback padrão `ask`

---

## Task 5: Store de Skills

- [x] Criar `app/src/features/skills/store/skillStore.ts`
- [x] Armazenar skills descobertas, skill ativa, permissões, status e erro
- [x] Implementar descobrir skills
- [x] Implementar carregar conteúdo sob demanda
- [x] Implementar alterar permissão e persistir no `opencode.json`
- [x] Testar descoberta, carregamento e atualização de permissão

---

## Task 6: Integração com Chat e Agentes

- [x] Adicionar contexto de skills permitidas ao prompt do agente
- [x] Ocultar skills com permissão `deny`
- [x] Para skills `ask`, exibir solicitação antes de incluir conteúdo no prompt
- [x] Para skills `allow`, permitir inclusão direta quando mencionada ou selecionada
- [x] Testar prompt com skill permitida, negada e pendente de aprovação

---

## Task 7: UI de Skills

- [x] Criar `app/src/features/skills/components/SkillPanel.tsx`
- [x] Exibir lista de skills descobertas
- [x] Exibir origem, descrição e permissão efetiva
- [x] Permitir carregar/ver conteúdo de uma skill
- [x] Permitir alterar permissão por skill ou padrão wildcard
- [x] Testar renderização, carregamento e alteração de permissão

---

## Task 8: Integração com Shell da SPA

- [x] Adicionar `SkillPanel` no layout principal ou área de gerenciamento
- [x] Atualizar copy do próximo passo para Fase 8 — Plugins
- [x] Garantir layout responsivo em desktop e mobile
- [x] Testar que painel de skills aparece quando workspace está pronto

---

## Verificação Final da Fase 7

- [x] `npm test --workspace=app` passa
- [x] `npm run build --workspace=app` passa
- [x] Skills são descobertas em `.opencode/skills`, `.claude/skills` e `.agents/skills`
- [x] `SKILL.md` é parseado com validação de frontmatter
- [x] Permissões `allow`, `deny`, `ask` e wildcard funcionam
- [x] Chat inclui apenas skills permitidas/aprovadas

---

## Próximo Passo

Fase 8 — Plugins: carregamento JS/TS, sistema de hooks e ferramentas customizadas.
