# Fase 3 — Provedores LLM: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que a SPA configure o provedor LLM do workspace, liste modelos disponíveis, selecione o modelo ativo e persista a configuração em `.opencode/opencode.json`.

**Architecture:** Nova feature `app/src/features/providers` encapsulando tipos, catálogo de provedores, client HTTP para APIs LLM, store Zustand e componentes. A persistência usa o serviço local autenticado já existente na Fase 1: ler status do workspace via `/workspace/status` e gravar o arquivo `.opencode/opencode.json` via `/fs/write`.

**Supported Providers:**
- OpenRouter
- OpenAI-compatible, com `baseUrl` configurável

**Out of Scope:**
- Chat e streaming de completions
- Gerenciamento seguro avançado de credenciais
- Testes reais contra APIs externas
- Validação profunda de modelos por capabilities

---

## Task 1: Tipos e Catálogo de Provedores

- [x] Criar `app/src/features/providers/types/provider.ts`
- [x] Modelar `ProviderId`, `ProviderConfig`, `ModelInfo` e `ProviderSelection`
- [x] Criar catálogo com OpenRouter e OpenAI-compatible
- [x] Testar valores padrão e labels exibidos pela UI

---

## Task 2: Client de Modelos

- [x] Criar `app/src/features/providers/services/modelClient.ts`
- [x] Implementar listagem de modelos OpenRouter via `GET /models`
- [x] Implementar listagem OpenAI-compatible via `GET /models` em `baseUrl` informado pelo usuário
- [x] Enviar credencial via header `Authorization: Bearer <apiKey>`
- [x] Normalizar respostas para `ModelInfo[]`
- [x] Testar sucesso, erro HTTP e resposta sem modelos usando `fetch` mockado

---

## Task 3: Persistência no Workspace

- [x] Criar `app/src/features/providers/services/providerConfigStore.ts`
- [x] Ler configuração atual do workspace usando `WorkspaceConfig` já carregado
- [x] Atualizar apenas a chave `provider` do `opencode.json`, preservando `agents`, `skills`, `plugins`, `mcps` e chaves desconhecidas
- [x] Gravar em `<workspacePath>/.opencode/opencode.json` via `/fs/write`
- [x] Testar merge sem perda de dados existentes

Formato persistido esperado:

```json
{
  "provider": {
    "name": "openrouter",
    "model": "openai/gpt-4o-mini",
    "apiKey": "...",
    "baseUrl": "https://openrouter.ai/api/v1"
  }
}
```

Para OpenAI-compatible:

```json
{
  "provider": {
    "name": "openai-compatible",
    "model": "gpt-4o-mini",
    "apiKey": "...",
    "baseUrl": "http://localhost:11434/v1"
  }
}
```

---

## Task 4: Estado de Provider

- [x] Criar `app/src/features/providers/store/providerStore.ts`
- [x] Armazenar provider selecionado, `baseUrl`, `apiKey`, lista de modelos, modelo ativo, status e erro
- [x] Implementar actions para carregar modelos e salvar configuração
- [x] Sincronizar estado inicial a partir do `WorkspaceConfig` quando o workspace estiver pronto
- [x] Testar fluxos de carregar modelos, selecionar modelo e salvar configuração

---

## Task 5: UI de Configuração

- [x] Criar `app/src/features/providers/components/ProviderPanel.tsx`
- [x] Exibir seleção entre OpenRouter e OpenAI-compatible
- [x] Exibir campo de API key
- [x] Exibir campo `baseUrl` editável para OpenAI-compatible
- [x] Exibir botão para listar modelos
- [x] Exibir seleção de modelo ativo
- [x] Exibir botão para salvar no workspace
- [x] Bloquear a UI quando o workspace ainda não estiver pronto
- [x] Testar renderização, carregamento de modelos e mensagem de sucesso

---

## Task 6: Integração com Shell da SPA

- [x] Adicionar `ProviderPanel` em `app/src/App.tsx` como Etapa 3
- [x] Atualizar copy do próximo passo para Fase 4 — Chat + Agentes Primários
- [x] Garantir layout responsivo em desktop e mobile
- [x] Testar que a Etapa 3 aparece no fluxo principal

---

## Verificação Final da Fase 3

- [x] `npm test --workspace=app` passa
- [x] `npm run build --workspace=app` passa
- [x] App lista modelos com `fetch` mockado nos testes
- [x] App persiste provider/model em `.opencode/opencode.json` preservando as demais chaves
- [x] UI permanece bloqueada até conexão e workspace pronto

---

## Próximo Passo

Fase 4 — Chat + Agentes Primários: usar provider/model configurados para implementar chat com agentes Build e Plan e streaming de respostas.
