# Fase 11 — Hardening, E2E e Distribuição: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a base end-to-end concluída nas Fases 1–10 em uma entrega mais confiável, verificável e distribuível: testes E2E reais, hardening de segurança nas fronteiras locais, validação integrada app + service e preparação mínima de empacotamento.

**Architecture:** Manter o monorepo atual com `service/` e `app/`. Adicionar testes E2E no workspace `app` usando Playwright, preferindo mocks controlados para APIs externas e um serviço local real ou fixture quando necessário. Reforçar validações no serviço local e na SPA sem expandir escopo funcional. Melhorar scripts root para verificação integrada e distribuição.

**Out of Scope:**
- Publicação real em npm, GitHub Releases ou loja externa
- Assinatura de binários
- Auto-update
- Sandbox completo para plugins
- Implementação completa de protocolo MCP real
- Execução real de ferramentas agenticas além do escopo já implementado

---

## Task 1: Auditoria de Baseline

- [ ] Rodar `npm test --workspace=service`
- [ ] Rodar `npm run build --workspace=service`
- [ ] Rodar `npm test --workspace=app`
- [ ] Rodar `npm run build --workspace=app`
- [ ] Registrar falhas existentes antes de qualquer alteração
- [ ] Corrigir apenas regressões necessárias para estabelecer baseline verde
- [ ] Confirmar que Fases 1–10 continuam funcionais após o baseline

---

## Task 2: Scripts Integrados do Monorepo

- [ ] Atualizar scripts root para `test`, `build`, `check` e comandos por workspace
- [ ] Garantir que `npm test` execute testes de `service` e `app`
- [ ] Garantir que `npm run build` execute builds de `service` e `app`
- [ ] Criar script `check` para testes + builds
- [ ] Testar scripts no Windows PowerShell
- [ ] Evitar scripts dependentes de shell Unix

---

## Task 3: Configuração Playwright

- [ ] Adicionar Playwright ao workspace `app`
- [ ] Criar `app/playwright.config.ts`
- [ ] Adicionar script `e2e` em `app/package.json`
- [ ] Configurar webServer para Vite quando apropriado
- [ ] Criar setup de mocks determinísticos para serviço local e providers LLM
- [ ] Documentar como instalar browsers do Playwright
- [ ] Garantir que E2E não dependa de APIs externas reais

---

## Task 4: E2E — Fluxo Inicial

- [ ] Cobrir estado sem conexão com serviço
- [ ] Cobrir conexão com serviço mockado usando token válido
- [ ] Cobrir erro de autenticação/token inválido
- [ ] Cobrir seleção/inicialização de workspace
- [ ] Cobrir checklist visual de onboarding
- [ ] Verificar comportamento em viewport desktop
- [ ] Verificar comportamento básico em viewport mobile

---

## Task 5: E2E — Fluxo Principal da IDE

- [ ] Cobrir navegação entre Chat, Arquivos, Terminal e Configurações
- [ ] Cobrir listagem e abertura de arquivo no file explorer
- [ ] Cobrir edição simples e salvamento de arquivo com serviço mockado
- [ ] Cobrir execução de comando não interativo no terminal com resposta mockada
- [ ] Cobrir persistência visual de estado ao trocar painéis
- [ ] Cobrir estados de loading e erro críticos

---

## Task 6: E2E — Chat e Configuração LLM

- [ ] Cobrir configuração de provider OpenRouter
- [ ] Cobrir configuração de provider OpenAI-compatible
- [ ] Cobrir listagem mockada de modelos
- [ ] Cobrir envio de mensagem no chat com stream mockado
- [ ] Cobrir alternância Build/Plan
- [ ] Cobrir subagente via `@mention`
- [ ] Cobrir bloqueio de envio quando provider/model não está configurado

---

## Task 7: Hardening do Serviço Local

- [ ] Revisar validação de paths nas rotas `/fs/*`
- [ ] Garantir respostas de erro consistentes no formato `{ error, code }`
- [ ] Garantir que `/health` continue público e demais rotas exijam token
- [ ] Revisar CORS para aceitar apenas origins localhost
- [ ] Validar limites de payload para escrita de arquivos
- [ ] Revisar timeouts e limites em `/terminal/exec`
- [ ] Adicionar testes para casos de erro e entradas inválidas relevantes

---

## Task 8: Hardening da SPA

- [ ] Validar bloqueios de UI para workspace/provider/chat/terminal sem pré-requisitos
- [ ] Garantir que operações de arquivo fiquem restritas ao workspace selecionado na SPA
- [ ] Melhorar mensagens de erro em falhas de serviço local
- [ ] Garantir que API keys não apareçam em logs, mensagens ou previews desnecessários
- [ ] Revisar estados de loading para evitar ações duplicadas
- [ ] Adicionar testes unitários para regressões encontradas

---

## Task 9: Segurança de Plugins, Skills e MCPs

- [ ] Revisar copy de aviso de segurança para plugins habilitados
- [ ] Confirmar que plugins não executam código sem habilitação explícita
- [ ] Confirmar que tools declarativas sem executor retornam erro controlado
- [ ] Confirmar que skills com permissão `deny` não entram no prompt
- [ ] Confirmar que MCPs permanecem declarativos e não iniciam processos externos
- [ ] Adicionar testes para qualquer lacuna encontrada

---

## Task 10: Preparação de Distribuição do Serviço

- [ ] Garantir que `npm run build --workspace=service` gere saída executável em `dist/`
- [ ] Validar campo `bin` do `service/package.json`
- [ ] Garantir shebang ou estratégia equivalente para execução como CLI se necessário
- [ ] Testar execução local do build do serviço
- [ ] Documentar uso local do serviço com token e porta padrão
- [ ] Documentar variável `OPENCODE_PORT`
- [ ] Não publicar pacote nesta fase

---

## Task 11: Documentação Operacional

- [ ] Criar ou atualizar instruções de desenvolvimento local
- [ ] Documentar comandos `install`, `test`, `build`, `check` e `e2e`
- [ ] Documentar fluxo manual: iniciar serviço, abrir app, conectar token, selecionar workspace
- [ ] Documentar limitações conhecidas: MCP real, sandbox de plugins, E2E com mocks
- [ ] Documentar troubleshooting básico para porta ocupada, token inválido e falha de build

---

## Task 12: CI Local Reprodutível

- [ ] Garantir que `npm install` na raiz instale workspaces corretamente
- [ ] Garantir que `npm run check` funcione em ambiente limpo
- [ ] Garantir que E2E rode de forma determinística com mocks
- [ ] Separar E2E de `check` se instalação de browser for pesada
- [ ] Documentar comando recomendado para validação completa local

---

## Verificação Final da Fase 11

- [ ] `npm test --workspace=service` passa
- [ ] `npm run build --workspace=service` passa
- [ ] `npm test --workspace=app` passa
- [ ] `npm run build --workspace=app` passa
- [ ] `npm run check` passa na raiz
- [ ] `npm run e2e --workspace=app` passa quando browsers do Playwright estão instalados
- [ ] Fluxo inicial é coberto por E2E
- [ ] Fluxo principal da IDE é coberto por E2E
- [ ] Serviço local tem testes para autenticação, CORS, erros e limites críticos
- [ ] Documentação operacional permite rodar o projeto do zero

---

## Próximo Passo

Fase 12 — Runtime Agentico e Ferramentas Reais: execução controlada de ferramentas pelo agente, aprovações interativas, integração real de MCPs e sandbox mais robusto para extensões.
