# Fase 4 — Chat + Agentes Primários: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar chat funcional usando o provider/model configurado na Fase 3, com alternância entre agentes primários Build e Plan e respostas em streaming.

**Architecture:** Nova feature `app/src/features/chat` para mensagens, streaming LLM, estado de conversa e UI. Nova feature `app/src/features/agents` para definições dos agentes primários e permissões. O chat consome `workspace.config.provider` persistido na Fase 3 e usa endpoint OpenAI-compatible `/chat/completions` com `stream: true`.

**Primary Agents:**
- Build: agente padrão; permissões `allow` para leitura, edição, bash e webfetch; variante de esforço `low` quando não houver override em `opencode.json`.
- Plan: agente de planejamento; permissões `ask` para edição e bash, `allow` para leitura e webfetch; variante de esforço `medium` quando não houver override em `opencode.json`.

**Out of Scope:**
- Execução real de ferramentas pelo agente
- Persistência de sessões completas em `.opencode/`
- Subagentes, Title Agent, Summary Agent e Compaction Agent
- Aprovação interativa de ferramentas além da modelagem de permissões

---

## Task 1: Definições dos Agentes Primários

- [x] Criar `app/src/features/agents/types/agent.ts`
- [x] Criar `app/src/features/agents/services/primaryAgents.ts`
- [x] Definir agentes `build` e `plan` com label, descrição, permissões e esforço padrão
- [x] Resolver overrides vindos de `workspace.config.agents`
- [x] Testar defaults e overrides de `effort`, `model` e `permission`

---

## Task 2: Tipos e Store de Chat

- [x] Criar `app/src/features/chat/types/chat.ts`
- [x] Criar `app/src/features/chat/store/chatStore.ts`
- [x] Modelar mensagens `user`, `assistant` e `system`
- [x] Armazenar agente ativo, mensagens, status, erro e resposta em streaming
- [x] Implementar actions para alternar agente, adicionar mensagem, anexar delta e limpar conversa
- [x] Testar fluxo de envio e acúmulo de deltas

---

## Task 3: Client de Chat Streaming

- [x] Criar `app/src/features/chat/services/chatClient.ts`
- [x] Montar payload OpenAI-compatible para `/chat/completions`
- [x] Enviar `Authorization: Bearer <apiKey>` e `Content-Type: application/json`
- [x] Usar `stream: true`
- [x] Parsear SSE chunks `data: {...}` e encerrar em `[DONE]`
- [x] Normalizar deltas para texto incremental
- [x] Testar parse de stream, erro HTTP e stream vazio com `fetch` mockado

---

## Task 4: Prompt de Sistema por Agente

- [x] Criar `app/src/features/chat/services/promptBuilder.ts`
- [x] Incluir nome do agente, permissões, esforço e objetivo no system prompt
- [x] Incluir conteúdo de `AGENTS.md` somente quando disponível futuramente; nesta fase deixar ponto de extensão sem buscar arquivo
- [x] Garantir que Plan declare edição/bash em modo `ask`
- [x] Testar prompt de Build e Plan

---

## Task 5: Orquestração de Envio

- [x] Criar service/action para enviar mensagem usando provider configurado
- [x] Bloquear envio sem workspace pronto ou provider/model configurado
- [x] Criar mensagem assistant vazia antes do stream
- [x] Atualizar a última mensagem assistant conforme deltas chegam
- [x] Mostrar erro em falha de rede ou provider ausente
- [x] Testar sucesso, provider ausente e erro de rede

---

## Task 6: UI do Chat

- [x] Criar `app/src/features/agents/components/AgentSwitcher.tsx`
- [x] Criar `app/src/features/chat/components/ChatPanel.tsx`
- [x] Exibir histórico de mensagens
- [x] Exibir agente ativo e alternância Build/Plan
- [x] Exibir composer de mensagem
- [x] Exibir estado de streaming/loading
- [x] Desabilitar composer até conexão, workspace e provider estarem prontos
- [x] Testar renderização, alternância de agente e envio de mensagem

---

## Task 7: Integração com Shell da SPA

- [x] Adicionar `ChatPanel` em `app/src/App.tsx` como área principal após provider
- [x] Atualizar header para indicar MVP Fases 1–4 completo quando Fase 4 estiver pronta
- [x] Atualizar copy do próximo passo para Fase 5 — Gerenciamento de Sessões
- [x] Garantir layout responsivo em desktop e mobile
- [x] Testar que chat aparece no fluxo principal

---

## Verificação Final da Fase 4

- [x] `npm test --workspace=app` passa
- [x] `npm run build --workspace=app` passa
- [x] Build é o agente padrão ao abrir workspace
- [x] Plan pode ser selecionado e usa permissões de planejamento
- [x] Chat envia payload para `/chat/completions` com provider/model configurado
- [x] Resposta streaming atualiza a mensagem assistant incrementalmente

---

## Próximo Passo

Fase 5 — Gerenciamento de Sessões: session IDs, listagem, retomada, Title Agent e Summary Agent persistidos em `.opencode/`.
