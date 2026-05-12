# Fase 9 — MCPs + Compaction: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar gerenciamento de MCPs por workspace e compactação de contexto para conversas longas, preparando o app para uso contínuo em projetos reais.

**Architecture:** Nova feature `app/src/features/mcps` para configuração, persistência e UI de MCPs. Nova feature `app/src/features/compaction` para heurística de contexto, geração de resumo compacto e integração com chat/sessões. As configurações persistem em `.opencode/opencode.json` e resumos compactados persistem em `.opencode/memory/`.

**Out of Scope:**
- Implementar protocolo MCP completo com transporte real
- Executar servidores MCP externos automaticamente
- Compactação transparente com troca de modelo em runtime
- Vetorização/embeddings de memória local

---

## Task 1: Tipos de MCP

- [x] Criar `app/src/features/mcps/types/mcp.ts`
- [x] Modelar `McpConfig`, `McpStatus`, `McpTransport`, `McpPermission` e `McpConnectionState`
- [x] Validar nome por regex `^[a-z0-9]+(-[a-z0-9]+)*$`
- [x] Suportar transports iniciais `stdio`, `http` e `sse` como configuração declarativa
- [x] Testar validação de nomes e configs mínimos

---

## Task 2: Persistência de MCPs

- [x] Criar `app/src/features/mcps/services/mcpConfigStore.ts`
- [x] Ler MCPs existentes de `workspace.config.mcps`
- [x] Adicionar, editar, habilitar/desabilitar e remover MCPs
- [x] Gravar `.opencode/opencode.json` via `/fs/write`
- [x] Preservar `provider`, `agents`, `skills`, `plugins` e chaves desconhecidas
- [x] Testar merge e remoção sem perda de dados existentes

---

## Task 3: Registro de MCPs

- [x] Criar `app/src/features/mcps/services/mcpRegistry.ts`
- [x] Registrar MCPs habilitados em memória
- [x] Expor lista de ferramentas declarativas por MCP quando informadas na config
- [x] Marcar MCPs como `configured`, `disabled` ou `error`
- [x] Não iniciar processos externos nesta fase
- [x] Testar registry com MCPs habilitados/desabilitados

---

## Task 4: Store de MCPs

- [x] Criar `app/src/features/mcps/store/mcpStore.ts`
- [x] Armazenar MCPs, MCP selecionado, status e erro
- [x] Implementar carregar do workspace config
- [x] Implementar salvar MCPs no workspace
- [x] Implementar habilitar/desabilitar MCP
- [x] Implementar rebuild do registry declarativo
- [x] Testar fluxo de carregar, alterar e salvar

---

## Task 5: UI de MCPs

- [x] Criar `app/src/features/mcps/components/McpPanel.tsx`
- [x] Exibir MCPs configurados no workspace
- [x] Permitir criar MCP com nome, transport, comando/url e enabled
- [x] Permitir habilitar/desabilitar e remover MCP
- [x] Exibir ferramentas declaradas por MCP
- [x] Exibir aviso de que execução real será habilitada em fase futura
- [x] Testar renderização, criação e toggle

---

## Task 6: Tipos de Compaction

- [x] Criar `app/src/features/compaction/types/compaction.ts`
- [x] Modelar `CompactionSnapshot`, `CompactionSummary`, `CompactionTrigger` e `CompactionStatus`
- [x] Definir limiares simples por quantidade de mensagens e caracteres
- [x] Testar cálculo de necessidade de compactação

---

## Task 7: Compaction Agent

- [x] Criar `app/src/features/compaction/services/compactionAgent.ts`
- [x] Gerar prompt de compactação com mensagens antigas e resumo existente
- [x] Usar provider/model configurado para gerar resumo compacto
- [x] Implementar fallback determinístico se provider falhar
- [x] Testar prompt, sucesso e fallback

---

## Task 8: Persistência de Memória Compactada

- [x] Criar `app/src/features/compaction/services/compactionStorage.ts`
- [x] Persistir resumo em `.opencode/memory/compaction.json`
- [x] Ler resumo existente quando workspace estiver pronto
- [x] Atualizar resumo sem apagar outras memórias futuras
- [x] Testar `/fs/read`, fallback de arquivo ausente e `/fs/write`

---

## Task 9: Integração com Chat e Sessões

- [x] Verificar necessidade de compactação após resposta finalizada
- [x] Quando necessário, gerar resumo das mensagens antigas
- [x] Preservar mensagens recentes e incluir resumo compacto no system prompt futuro
- [x] Persistir snapshot na sessão ativa
- [x] Testar compactação acionada por limite e uso no próximo prompt

---

## Task 10: UI de Compaction

- [x] Criar `app/src/features/compaction/components/CompactionPanel.tsx`
- [x] Exibir status do contexto atual
- [x] Exibir resumo compacto atual quando existir
- [x] Permitir compactar manualmente
- [x] Exibir data da última compactação
- [x] Testar renderização e compactação manual

---

## Task 11: Integração com Shell da SPA

- [x] Adicionar `McpPanel` e `CompactionPanel` ao layout principal
- [x] Atualizar copy do próximo passo para Fase 10 — UI Completa
- [x] Garantir layout responsivo em desktop e mobile
- [x] Testar que painéis aparecem quando workspace está pronto

---

## Verificação Final da Fase 9

- [x] `npm test --workspace=app` passa
- [x] `npm run build --workspace=app` passa
- [x] MCPs são persistidos em `.opencode/opencode.json`
- [x] MCPs podem ser habilitados/desabilitados individualmente
- [x] Registry declarativo expõe MCPs e ferramentas configuradas
- [x] Compaction Agent gera resumo ou fallback determinístico
- [x] Resumo compacto é persistido em `.opencode/memory/`
- [x] Chat inclui resumo compacto em prompts futuros quando disponível

---

## Próximo Passo

Fase 10 — UI Completa: explorador de arquivos, terminal integrado e painéis finais de gerenciamento.
