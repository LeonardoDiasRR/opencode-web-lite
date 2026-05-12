# Fase 6 — Subagentes: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar subagentes invocáveis manualmente via `@mention` no chat e preparar a base para delegação automática pelos agentes primários.

**Architecture:** Nova feature `app/src/features/subagents` com catálogo, parser de mentions, orquestração e UI. O chat passa a detectar `@general`, `@explore` e `@scout` no texto do usuário e direcionar a mensagem ao subagente correspondente usando o mesmo provider/model configurado.

**Subagents:**
- General: executor de tarefas multi-etapa; permissões amplas exceto `todo`
- Explore: leitura e busca no codebase em modo somente leitura
- Scout: pesquisa externa e documentação em modo somente leitura

**Out of Scope:**
- Delegação automática sofisticada por raciocínio do agente primário
- Execução real de ferramentas locais além do prompt e permissões modeladas
- Web search real fora do provider LLM

---

## Task 1: Tipos e Catálogo de Subagentes

- [x] Criar `app/src/features/subagents/types/subagent.ts`
- [x] Criar `app/src/features/subagents/services/subagentCatalog.ts`
- [x] Definir `general`, `explore` e `scout` com label, descrição, permissões e prompt base
- [x] Testar catálogo e permissões esperadas

---

## Task 2: Parser de Mentions

- [x] Criar `app/src/features/subagents/services/mentionParser.ts`
- [x] Detectar mentions no formato `@general`, `@explore`, `@scout`
- [x] Ignorar mentions desconhecidas
- [x] Retornar subagente alvo e texto sem mention principal
- [x] Testar mention no começo, no meio, múltiplas mentions e mention desconhecida

---

## Task 3: Prompt de Subagente

- [x] Criar `app/src/features/subagents/services/subagentPromptBuilder.ts`
- [x] Gerar system prompt com papel, permissões e escopo do subagente
- [x] Incluir contexto do agente primário ativo quando existir
- [x] Garantir Explore e Scout como somente leitura
- [x] Testar prompts de General, Explore e Scout

---

## Task 4: Orquestração com Chat

- [x] Integrar parser de mentions ao envio de mensagem do chat
- [x] Quando houver mention válida, usar prompt do subagente em vez do agente primário
- [x] Registrar metadado da mensagem assistant com o subagente utilizado
- [x] Exibir erro claro se subagente estiver indisponível
- [x] Testar envio com e sem mention

---

## Task 5: UI de Subagentes

- [x] Criar `app/src/features/subagents/components/SubagentHint.tsx`
- [x] Exibir dicas de uso `@general`, `@explore`, `@scout`
- [x] Criar indicação visual quando uma resposta vier de subagente
- [x] Opcionalmente sugerir mentions ao digitar `@`
- [x] Testar renderização de dicas e badges

---

## Task 6: Permissões e Segurança

- [x] Modelar permissões efetivas por subagente
- [x] Garantir que Explore não peça edição/bash no prompt
- [x] Garantir que Scout não peça edição/bash nem leitura local ampla
- [x] Garantir que General não tenha acesso ao recurso `todo`
- [x] Testar permissões efetivas

---

## Task 7: Integração com Sessões

- [x] Persistir metadados de subagente nas mensagens da sessão
- [x] Restaurar badges de subagente ao retomar sessão
- [x] Testar serialização e restauração de mensagens com subagente

---

## Verificação Final da Fase 6

- [x] `npm test --workspace=app` passa
- [x] `npm run build --workspace=app` passa
- [x] `@general` direciona resposta para General
- [x] `@explore` direciona resposta para Explore em modo somente leitura
- [x] `@scout` direciona resposta para Scout em modo somente leitura
- [x] Sessões preservam metadados de subagente

---

## Próximo Passo

Fase 7 — Skills: descoberta de `SKILL.md`, carregamento sob demanda e permissões por workspace.
