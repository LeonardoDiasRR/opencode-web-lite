# Fase 10 — UI Completa: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidar a interface final do OpenCode Web Lite com layout semelhante a IDE: explorador de arquivos, editor/leitor de arquivos, terminal integrado, chat central e painéis de gerenciamento para providers, sessões, skills, plugins e MCPs.

**Architecture:** Evoluir o shell atual para um layout responsivo com áreas principais: sidebar esquerda para workspace/files/sessions, área central para chat/editor, painel direito para configurações e drawer inferior para terminal. Novas features `file-explorer`, `terminal-ui` e `workspace-settings` consomem o serviço local já implementado.

**Out of Scope:**
- Editor Monaco completo com LSP
- Diff/merge visual avançado
- Drag-and-drop complexo de arquivos
- Temas customizáveis além do tema atual
- Execução real de ferramentas agenticas além das integrações já existentes

---

## Task 1: Layout Shell Final

- [x] Criar `app/src/shared/ui/AppShell.tsx`
- [x] Definir regiões: sidebar, main, inspector e terminal drawer
- [x] Suportar colapso de painéis em telas pequenas
- [x] Preservar fluxo atual de conexão/workspace antes de exibir layout completo
- [x] Testar renderização desktop e fallback mobile por classes/estado

---

## Task 2: Navegação de Painéis

- [x] Criar navegação para Chat, Arquivos, Terminal, Sessões, Providers, Skills, Plugins, MCPs e Configurações
- [x] Usar React Router ou estado local simples conforme menor mudança
- [x] Manter URLs estáveis para painéis principais se usar rotas
- [x] Testar troca de painéis sem perder estado global

---

## Task 3: File Explorer — Tipos e Client

- [x] Criar `app/src/features/file-explorer/types/file.ts`
- [x] Criar `app/src/features/file-explorer/services/fileClient.ts`
- [x] Consumir `/fs/list`, `/fs/read`, `/fs/write`, `/fs/delete`, `/fs/move` e `/fs/copy`
- [x] Normalizar entradas de diretório e conteúdo de arquivo
- [x] Testar operações com `fetch` mockado

---

## Task 4: File Explorer — Store

- [x] Criar `app/src/features/file-explorer/store/fileExplorerStore.ts`
- [x] Armazenar árvore expandida, arquivo selecionado, conteúdo, status e erro
- [x] Implementar listar diretório, abrir arquivo, salvar arquivo e deletar arquivo
- [x] Restringir operações a paths dentro do workspace selecionado na SPA
- [x] Testar seleção, abertura e salvamento

---

## Task 5: File Explorer — UI

- [x] Criar `app/src/features/file-explorer/components/FileExplorerPanel.tsx`
- [x] Exibir árvore de arquivos/diretórios
- [x] Permitir abrir arquivo para leitura/edição simples
- [x] Permitir salvar alterações no arquivo aberto
- [x] Exibir estados de loading/erro
- [x] Testar renderização e interação básica

---

## Task 6: File Watcher UI

- [x] Criar integração com `/fs/watch` via SSE
- [x] Atualizar árvore quando arquivos forem adicionados/removidos/alterados
- [x] Encerrar conexão SSE ao trocar workspace/desmontar componente
- [x] Testar com EventSource mockado ou wrapper mockado

---

## Task 7: Terminal UI — Execução Não Interativa

- [x] Criar `app/src/features/terminal-ui/services/terminalClient.ts`
- [x] Consumir `/terminal/exec`
- [x] Criar store para histórico de comandos, status e erro
- [x] Criar UI para comando, cwd e saída stdout/stderr
- [x] Testar execução bem-sucedida, erro e timeout reportado

---

## Task 8: Terminal UI — PTY WebSocket

- [x] Criar client WebSocket para `/terminal/ws?token=&sessionId=`
- [x] Criar fluxo para `/terminal/create` e encerramento da sessão PTY
- [x] Renderizar saída incremental em painel terminal
- [x] Enviar input do usuário ao WebSocket
- [x] Testar client com WebSocket mockado

---

## Task 9: Workspace Settings

- [x] Criar `app/src/features/workspace-settings/components/WorkspaceSettingsPanel.tsx`
- [x] Exibir path, status de inicialização e versão do config
- [x] Exibir preview editável de `opencode.json`
- [x] Permitir salvar config com validação JSON mínima
- [x] Exibir link/estado de `AGENTS.md`
- [x] Testar edição e validação

---

## Task 10: Consolidação dos Painéis Existentes

- [x] Reposicionar ProviderPanel, SessionPanel, SkillPanel, PluginPanel, McpPanel e CompactionPanel no inspector/configurações
- [x] Evitar duplicação de ações e estados
- [x] Garantir que chat continue acessível como área principal
- [x] Testar que painéis existentes ainda renderizam

---

## Task 11: Estados Vazios e Onboarding

- [x] Criar estado inicial para usuário sem serviço conectado
- [x] Criar estado para workspace não inicializado
- [x] Criar estado para provider não configurado
- [x] Criar checklist visual do fluxo inicial do usuário
- [x] Testar renderização dos estados vazios

---

## Task 12: Responsividade e Acessibilidade

- [x] Garantir navegação por teclado em painéis principais
- [x] Adicionar labels acessíveis em botões/inputs críticos
- [x] Verificar contraste visual dos principais estados
- [x] Garantir layout utilizável em mobile com painéis empilhados/drawers
- [x] Testar queries acessíveis nos principais componentes

---

## Task 13: Verificação E2E Local Mínima

- [x] Adicionar ou atualizar script e2e se Playwright estiver configurado
- [x] Cobrir fluxo: conectar serviço mockado, selecionar workspace, abrir chat, listar arquivos
- [x] Se e2e não estiver disponível, documentar lacuna e manter Vitest cobrindo integrações críticas

Playwright não está configurado no workspace `app`; a verificação E2E fica como lacuna documentada e os fluxos críticos foram cobertos por Vitest.

---

## Verificação Final da Fase 10

- [x] `npm test --workspace=app` passa
- [x] `npm run build --workspace=app` passa
- [x] Layout final carrega em desktop e mobile
- [x] File explorer lista e abre arquivos do workspace
- [x] Terminal executa comando não interativo e suporta PTY mockado
- [x] Painéis de providers, sessões, skills, plugins e MCPs permanecem funcionais
- [x] Estados vazios orientam o fluxo inicial do usuário

---

## Resultado Final

OpenCode Web Lite possui a base end-to-end planejada: serviço local, SPA, workspace, providers, chat/agentes, sessões, subagentes, skills, plugins, MCPs, compactação, explorador de arquivos, terminal e UI completa.
