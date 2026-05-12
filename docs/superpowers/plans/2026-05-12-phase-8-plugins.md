# Fase 8 — Plugins: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a base de plugins de workspace: descoberta em `.opencode/plugins/`, configuração via `.opencode/opencode.json`, registro de hooks e ferramentas customizadas, e UI para habilitar/desabilitar plugins.

**Architecture:** Nova feature `app/src/features/plugins` para tipos, manifesto, descoberta, registro, permissões e UI. O carregamento inicial será declarativo e seguro: a SPA lê manifestos/arquivos de plugin via serviço local e registra metadados, hooks e ferramentas em memória. Execução arbitrária de código local fica limitada a módulos explicitamente habilitados no workspace e testada com mocks.

**Plugin Sources:**
- Diretório do projeto: `.opencode/plugins/<name>/plugin.json`
- Arquivo opcional do módulo: `.opencode/plugins/<name>/index.js`
- Pacotes declarados em `.opencode/opencode.json` na chave `plugins`

**Out of Scope:**
- Marketplace de plugins
- Plugins globais do usuário
- Instalação automática de pacotes NPM
- Execução de código não habilitado explicitamente pelo usuário
- Sandbox completo para código arbitrário

---

## Task 1: Tipos de Plugin

- [x] Criar `app/src/features/plugins/types/plugin.ts`
- [x] Modelar `PluginManifest`, `DiscoveredPlugin`, `PluginPermission`, `PluginStatus`, `PluginHookName` e `PluginToolDefinition`
- [x] Validar nome de plugin por regex `^[a-z0-9]+(-[a-z0-9]+)*$`
- [x] Testar validação de nomes e shape mínimo do manifesto

---

## Task 2: Parser de Manifesto

- [x] Criar `app/src/features/plugins/services/pluginManifestParser.ts`
- [x] Parsear `plugin.json` com `name`, `description`, `version`, `main`, `hooks`, `tools` e `permissions`
- [x] Validar que `name` coincide com o diretório
- [x] Normalizar `main` para `index.js` quando ausente
- [x] Rejeitar manifestos sem nome válido
- [x] Testar manifesto válido, inválido e campos opcionais

---

## Task 3: Descoberta de Plugins Locais

- [x] Criar `app/src/features/plugins/services/pluginDiscovery.ts`
- [x] Listar `.opencode/plugins/` via `/fs/list`
- [x] Ler `.opencode/plugins/<name>/plugin.json` via `/fs/read`
- [x] Ignorar diretórios sem manifesto
- [x] Ignorar diretórios com nome inválido
- [x] Retornar lista ordenada por nome
- [x] Testar descoberta com serviço mockado, diretório ausente e manifesto inválido

---

## Task 4: Configuração em `opencode.json`

- [x] Criar `app/src/features/plugins/services/pluginConfigStore.ts`
- [x] Ler lista atual de plugins em `workspace.config.plugins`
- [x] Persistir plugins habilitados/desabilitados em `.opencode/opencode.json`
- [x] Preservar `provider`, `agents`, `skills`, `mcps` e chaves desconhecidas
- [x] Suportar entries de pacote NPM como strings e plugins locais como objetos `{ name, enabled }`
- [x] Testar merge sem perda de dados existentes

---

## Task 5: Registro de Hooks

- [x] Criar `app/src/features/plugins/services/pluginRegistry.ts`
- [x] Registrar hooks declarados por plugin habilitado
- [x] Suportar hook names iniciais: `message:before`, `message:after`, `tool:before`, `tool:after`, `session:close`
- [x] Expor função para listar hooks por evento
- [x] Expor função para executar hooks mockados em ordem de registro
- [x] Testar registro, ordenação e execução com mocks

---

## Task 6: Ferramentas Customizadas

- [x] Criar `app/src/features/plugins/services/pluginTools.ts`
- [x] Registrar ferramentas declaradas no manifesto
- [x] Validar nome, descrição e schema básico
- [x] Expor ferramentas para futura integração com agentes
- [x] Não executar ferramentas reais nesta fase; retornar erro controlado para ferramenta sem executor
- [x] Testar registro e validação de ferramentas

---

## Task 7: Integração com Chat e Sessões

- [x] Executar hooks `message:before` antes do envio ao provider
- [x] Executar hooks `message:after` após resposta finalizada
- [x] Executar hook `session:close` ao encerrar sessão
- [x] Manter comportamento atual quando não houver plugins habilitados
- [x] Testar integração com chat e fechamento de sessão usando hooks mockados

---

## Task 8: Store de Plugins

- [x] Criar `app/src/features/plugins/store/pluginStore.ts`
- [x] Armazenar plugins descobertos, plugins habilitados, hooks, ferramentas, status e erro
- [x] Implementar descobrir plugins
- [x] Implementar habilitar/desabilitar plugin
- [x] Implementar salvar configuração no workspace
- [x] Implementar reconstruir registry a partir dos plugins habilitados
- [x] Testar descoberta, enable/disable e registry

---

## Task 9: UI de Plugins

- [x] Criar `app/src/features/plugins/components/PluginPanel.tsx`
- [x] Exibir lista de plugins descobertos
- [x] Exibir descrição, versão, hooks e ferramentas declaradas
- [x] Permitir habilitar/desabilitar plugin
- [x] Exibir plugins declarados no `opencode.json` mas não encontrados localmente
- [x] Exibir avisos de segurança para plugins com permissões sensíveis
- [x] Testar renderização, descoberta e alteração de estado

---

## Task 10: Integração com Shell da SPA

- [x] Adicionar `PluginPanel` ao layout principal
- [x] Atualizar copy do próximo passo para Fase 9 — MCPs + Compaction
- [x] Garantir layout responsivo em desktop e mobile
- [x] Testar que painel de plugins aparece quando workspace está pronto

---

## Verificação Final da Fase 8

- [x] `npm test --workspace=app` passa
- [x] `npm run build --workspace=app` passa
- [x] Plugins locais são descobertos em `.opencode/plugins/`
- [x] Configuração de plugins é persistida em `.opencode/opencode.json`
- [x] Hooks declarados são registrados e executáveis via mocks
- [x] Ferramentas customizadas são registradas como metadados validados
- [x] UI permite habilitar/desabilitar plugins sem executar código não aprovado

---

## Próximo Passo

Fase 9 — MCPs + Compaction: configuração de MCPs por projeto e agente de compactação de contexto.
