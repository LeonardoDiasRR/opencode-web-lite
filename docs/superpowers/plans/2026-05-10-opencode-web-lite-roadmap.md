# OpenCode Web Lite — Roadmap de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o OpenCode Web Lite — uma SPA de desenvolvimento assistido por IA que opera sobre um serviço local REST, com acesso ao filesystem e terminal do usuário, suporte a agentes LLM, skills, plugins e MCPs.

**Architecture:** Monorepo npm workspaces com dois pacotes principais: `service/` (Node.js + Express, executa localmente na máquina do usuário) e `app/` (React SPA, servida por CDN ou build local). Comunicação via REST + SSE + WebSocket sobre `localhost`. Estado do projeto persiste em `.opencode/` dentro do workspace do usuário.

**Tech Stack:**
- Local Service: Node.js 20 LTS + TypeScript 5 + Express 4 + chokidar 3 + node-pty
- SPA: React 18 + TypeScript 5 + Vite 5 + TailwindCSS 3 + Zustand 4 + React Router 6
- Testing: Vitest 1 + @testing-library/react + Playwright 1
- Monorepo: npm workspaces (root `package.json`)

---

## Estrutura do Repositório

```
opencode-web-lite/
├── service/                    # Serviço local Node.js
│   ├── src/
│   │   ├── auth/               # Token + middleware de autenticação
│   │   ├── fs/                 # Operações de filesystem + watch
│   │   ├── terminal/           # Execução de comandos + PTY
│   │   ├── workspace/          # Inicialização do workspace
│   │   ├── routes/             # Rotas Express por domínio
│   │   └── server.ts           # Entry point
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── app/                        # React SPA
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── stores/             # Zustand stores (connection, workspace, session, agent)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # API client + utilitários
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   └── superpowers/
│       ├── specs/              # Especificações aprovadas
│       └── plans/              # Planos de implementação (este diretório)
├── .project/
│   └── spec_inicial.md         # Spec aprovada
└── package.json                # Workspace root (npm workspaces)
```

---

## Fases e Dependências

| Fase | Nome | Depende de | Entregável |
|------|------|-----------|------------|
| **1** | Serviço Local | — | REST API testável via curl/Postman |
| **2** | SPA Core + Workspace | Fase 1 | App conecta ao serviço, seleciona e inicializa workspace |
| **3** | Provedores LLM | Fase 2 | Configuração de provider/model, persistência em opencode.json |
| **4** | Chat + Agentes Primários | Fase 3 | Chat funcional com Build e Plan, streaming de respostas |
| **5** | Gerenciamento de Sessões | Fase 4 | Session IDs, listagem, retomada, Title/Summary Agents |
| **6** | Subagentes | Fase 4 | @mention para General/Explore/Scout |
| **7** | Skills | Fase 2 | Descoberta SKILL.md, carregamento on-demand, permissões |
| **8** | Plugins | Fase 2 | Carregamento JS/TS, sistema de hooks, ferramentas customizadas |
| **9** | MCPs + Compaction | Fase 4 | Configuração de MCPs por projeto, Compaction Agent |
| **10** | UI Completa | Fases 1–9 | File explorer, terminal integrado, painéis de gerenciamento |
| **11** | Hardening, E2E e Distribuição | Fase 10 | Testes E2E, scripts integrados, hardening e preparação de distribuição |
| **12** | Runtime Agentico e Ferramentas Reais | Fase 11 | Tool calls reais, aprovações interativas, MCP inicial e execução controlada |

---

## MVP (Fases 1–4)

O MVP entrega uma experiência funcional end-to-end que satisfaz o fluxo inicial do usuário descrito na spec (seção 21):

1. Serviço local instalável via `npm install -g` ou executável binário
2. SPA acessível por navegador conecta ao serviço com token
3. Workspace selecionável com inicialização automática (AGENTS.md + .opencode/)
4. Provider LLM configurável (OpenRouter e OpenAI-compatible)
5. Chat com agentes Build e Plan operacionais, com streaming de respostas

---

## Planos Detalhados

| Fase | Plano | Status |
|------|-------|--------|
| 1 | [Fase 1 — Serviço Local](2026-05-10-phase-1-local-service.md) | ✅ Criado |
| 2 | [Fase 2 — SPA Core + Workspace](2026-05-12-phase-2-spa-core-workspace.md) | ✅ Criado |
| 3 | [Fase 3 — Provedores LLM](2026-05-12-phase-3-llm-providers.md) | ✅ Criado |
| 4 | [Fase 4 — Chat + Agentes Primários](2026-05-12-phase-4-chat-primary-agents.md) | ✅ Criado |
| 5 | [Fase 5 — Gerenciamento de Sessões](2026-05-12-phase-5-session-management.md) | ✅ Criado |
| 6 | [Fase 6 — Subagentes](2026-05-12-phase-6-subagents.md) | ✅ Criado |
| 7 | [Fase 7 — Skills](2026-05-12-phase-7-skills.md) | ✅ Criado |
| 8 | [Fase 8 — Plugins](2026-05-12-phase-8-plugins.md) | ✅ Criado |
| 9 | [Fase 9 — MCPs + Compaction](2026-05-12-phase-9-mcps-compaction.md) | ✅ Criado |
| 10 | [Fase 10 — UI Completa](2026-05-12-phase-10-complete-ui.md) | ✅ Criado |
| 11 | [Fase 11 — Hardening, E2E e Distribuição](2026-05-12-phase-11-hardening-e2e-distribution.md) | ✅ Criado |
| 12 | [Fase 12 — Runtime Agentico e Ferramentas Reais](2026-05-12-phase-12-agentic-runtime-real-tools.md) | ✅ Criado |

---

## Convenções de Desenvolvimento

- **TDD**: Escrever teste antes da implementação em todas as tarefas
- **Commits frequentes**: Um commit por task concluída
- **YAGNI**: Não implementar o que a spec não exige
- **DRY**: Extrair abstrações apenas quando há 3+ repetições reais
- **Sem comentários de código**: Nomes expressivos dispensam comentários
- **TypeScript strict**: `"strict": true` em todos os tsconfig.json

---

## Decisões de Arquitetura

### Port do Serviço Local
Padrão: `7847`. Configurável via variável de ambiente `OPENCODE_PORT`.

### Autenticação
Token de 32 bytes gerados com `crypto.randomBytes`. Apresentado ao usuário no stdout ao iniciar o serviço. Validado via header `Authorization: Bearer <token>` em todas as rotas exceto `/health`.

### Filesystem Scope
O serviço não impõe restrição de path por padrão. O isolamento do workspace é responsabilidade da SPA, que envia sempre paths dentro do workspace selecionado.

### CORS
O serviço aceita requisições de qualquer `localhost` origin para suportar a SPA rodando em qualquer porta local (dev server ou produção).

### Formato de Erros
Todas as rotas retornam erros no formato:
```json
{ "error": "mensagem legível", "code": "ERROR_CODE" }
```
