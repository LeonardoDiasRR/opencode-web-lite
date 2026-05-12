# Fase 5 — Gerenciamento de Sessões: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persistir conversas por workspace com IDs de sessão, listagem, retomada e encerramento com título e resumo gerados por agentes de sistema.

**Architecture:** Nova feature `app/src/features/sessions` encapsulando tipos, persistência via serviço local, store Zustand e UI. As sessões são armazenadas no workspace em `.opencode/sessions/<sessionId>.json` e o índice em `.opencode/sessions/index.json`, usando `/fs/read`, `/fs/write` e `/fs/list` do serviço local.

**Session ID Format:** `ses_<id>` onde `<id>` é gerado localmente com entropia suficiente e sem dependência externa.

**Out of Scope:**
- Sincronização em nuvem
- Multiusuário
- Compactação automática de contexto
- Retomada de ações de ferramentas ainda não implementadas

---

## Task 1: Tipos de Sessão

- [x] Criar `app/src/features/sessions/types/session.ts`
- [x] Modelar `SessionRecord`, `SessionIndexEntry`, `SessionSummary` e `SessionStatus`
- [x] Reutilizar tipos de mensagens da feature `chat`
- [x] Testar serialização mínima de sessão

---

## Task 2: Geração de IDs

- [x] Criar `app/src/features/sessions/services/sessionId.ts`
- [x] Gerar IDs no formato `ses_<id>`
- [x] Evitar caracteres problemáticos para nomes de arquivo
- [x] Testar formato e unicidade básica

---

## Task 3: Persistência no Workspace

- [x] Criar `app/src/features/sessions/services/sessionStorage.ts`
- [x] Salvar sessão em `.opencode/sessions/<sessionId>.json`
- [x] Ler sessão por ID
- [x] Salvar e ler índice em `.opencode/sessions/index.json`
- [x] Criar diretórios intermediários via `/fs/write` quando necessário
- [x] Tratar índice ausente como lista vazia
- [x] Testar paths, payloads de escrita e fallback de índice ausente

---

## Task 4: Store de Sessões

- [x] Criar `app/src/features/sessions/store/sessionStore.ts`
- [x] Armazenar sessão ativa, lista de sessões, status e erro
- [x] Implementar criar nova sessão
- [x] Implementar salvar sessão ativa a partir do chat atual
- [x] Implementar carregar sessão por ID e restaurar mensagens no chat
- [x] Implementar listar sessões do índice
- [x] Testar criação, listagem e retomada

---

## Task 5: Title Agent e Summary Agent

- [x] Criar `app/src/features/sessions/services/sessionAgents.ts`
- [x] Gerar título curto usando provider/model configurado
- [x] Gerar resumo usando provider/model configurado
- [x] Usar fallback determinístico quando chamada LLM falhar
- [x] Persistir título e resumo ao encerrar sessão
- [x] Testar prompt, fallback e atualização da sessão

---

## Task 6: UI de Sessões

- [x] Criar `app/src/features/sessions/components/SessionPanel.tsx`
- [x] Exibir sessão ativa com ID e título
- [x] Exibir botão para nova sessão
- [x] Exibir botão para encerrar sessão
- [x] Exibir lista de sessões anteriores
- [x] Permitir retomada por clique
- [x] Permitir retomada por ID digitado
- [x] Testar renderização, nova sessão e retomada

---

## Task 7: Integração com Chat

- [x] Criar sessão automaticamente ao primeiro envio de mensagem se não houver sessão ativa
- [x] Salvar sessão após cada resposta finalizada
- [x] Restaurar mensagens ao retomar sessão
- [x] Exibir ID da sessão no `ChatPanel`
- [x] Testar integração entre chat e store de sessões

---

## Task 8: Integração com Shell da SPA

- [x] Adicionar `SessionPanel` no layout principal
- [x] Atualizar copy do próximo passo para Fase 6 — Subagentes
- [x] Garantir layout responsivo em desktop e mobile
- [x] Testar que painel de sessões aparece no fluxo principal

---

## Verificação Final da Fase 5

- [x] `npm test --workspace=app` passa
- [x] `npm run build --workspace=app` passa
- [x] Criar nova sessão gera ID `ses_<id>`
- [x] Encerrar sessão persiste título e resumo
- [x] Listagem carrega sessões do workspace
- [x] Retomar sessão restaura histórico de mensagens

---

## Próximo Passo

Fase 6 — Subagentes: invocação manual via `@mention` e execução especializada de General, Explore e Scout.
