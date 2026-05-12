# Fase 2 — SPA Core + Workspace: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a SPA React que conecta ao serviço local da Fase 1, valida token, permite informar o caminho do workspace, inicializa o workspace e exibe o status/configuração retornados pelo serviço.

**Architecture:** Pacote `app/` no monorepo usando Vite + React + TypeScript strict. Organização feature-based em `src/features/connection` e `src/features/workspace`, com UI genérica em `src/shared/ui`.

**Tech Stack:**
- React 18 + TypeScript 5 + Vite 5
- TailwindCSS 3
- Zustand 4
- React Router 6
- Vitest + Testing Library

---

## Task 1: Scaffold do Pacote `app/`

- [x] Criar `app/package.json`
- [x] Criar `app/tsconfig.json`, `app/tsconfig.node.json` e `app/vite.config.ts`
- [x] Criar `app/index.html`
- [x] Criar configuração Tailwind/PostCSS
- [x] Instalar dependências do workspace

---

## Task 2: API Client do Serviço Local

- [x] Criar tipos e client HTTP para `/health`, `/workspace/status` e `/workspace/init`
- [x] Testar headers de autenticação e tratamento de erros

---

## Task 3: Estado de Conexão

- [x] Criar store Zustand para URL do serviço, token, status e erro
- [x] Criar componente de formulário para conectar ao serviço
- [x] Testar fluxo de conexão bem-sucedido e falha

---

## Task 4: Workspace

- [x] Criar store Zustand para caminho, status e configuração do workspace
- [x] Criar componente para informar path e inicializar workspace
- [x] Testar inicialização e renderização de status

---

## Task 5: Shell da Aplicação

- [x] Montar `App.tsx` com layout responsivo
- [x] Exibir etapas: conexão, workspace, próximo passo
- [x] Garantir estado visual claro para erro, carregamento e sucesso

---

## Verificação Final da Fase 2

- [x] `npm test --workspace=app` passa
- [x] `npm run build --workspace=app` passa
- [x] App permite conectar ao serviço local com token
- [x] App permite inicializar workspace via `/workspace/init`

---

## Próximo Passo

Fase 3 — Provedores LLM: configurar provider/model e persistir seleção em `.opencode/opencode.json`.
