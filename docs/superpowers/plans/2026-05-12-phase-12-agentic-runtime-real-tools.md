# Fase 12 — Runtime Agentico e Ferramentas Reais: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evoluir o chat de respostas textuais para um runtime agentico controlado, com chamadas de ferramentas reais, aprovação interativa quando exigida por permissões, integração MCP inicial e limites de segurança compatíveis com execução local.

**Architecture:** Adicionar uma camada de runtime em `app/src/features/agent-runtime` para orquestrar tool calls, permissões, aprovações e eventos do chat. O serviço local continua responsável por filesystem e terminal. MCPs passam de configuração declarativa para conectores controlados quando explicitamente habilitados. Plugins continuam sem execução arbitrária por padrão; apenas ferramentas registradas e aprovadas entram no runtime.

**Out of Scope:**
- Autonomia irrestrita do agente
- Execução de comandos sem aprovação quando permissão efetiva for `ask` ou `deny`
- Sandbox perfeito para código arbitrário de terceiros
- Marketplace de ferramentas, plugins ou MCPs
- Suporte completo a todos os transports e capabilities MCP
- Multiusuário ou execução remota

---

## Task 1: Modelo de Tool Calls

- [ ] Criar `app/src/features/agent-runtime/types/toolCall.ts`
- [ ] Modelar `ToolCall`, `ToolResult`, `ToolDefinition`, `ToolPermission` e `ToolExecutionStatus`
- [ ] Suportar estados `pending`, `approved`, `running`, `succeeded`, `failed` e `denied`
- [ ] Mapear permissões efetivas `allow`, `ask` e `deny`
- [ ] Testar serialização e transições válidas de estado

---

## Task 2: Registro de Ferramentas Nativas

- [ ] Criar catálogo de ferramentas nativas para leitura de arquivo, escrita de arquivo, listagem de diretório, execução de comando e webfetch
- [ ] Reutilizar clients existentes de filesystem e terminal quando possível
- [ ] Definir schemas mínimos de entrada por ferramenta
- [ ] Garantir que ferramentas de escrita/bash iniciem como `ask` para agentes que exigem aprovação
- [ ] Testar registro e resolução de permissões por agente

---

## Task 3: Parser de Tool Calls do Provider

- [ ] Suportar formato OpenAI-compatible de tool calls quando disponível
- [ ] Criar fallback textual controlado apenas para blocos explicitamente delimitados
- [ ] Rejeitar tool calls malformadas com erro claro
- [ ] Normalizar tool calls para o modelo interno do runtime
- [ ] Testar tool calls válidas, múltiplas chamadas e payload inválido

---

## Task 4: Orquestrador do Runtime

- [ ] Criar `app/src/features/agent-runtime/services/agentRuntime.ts`
- [ ] Receber mensagens do chat, agente ativo, provider e ferramentas disponíveis
- [ ] Enviar tools disponíveis no payload do provider quando suportado
- [ ] Pausar execução quando uma chamada exigir aprovação
- [ ] Executar chamadas permitidas em ordem determinística
- [ ] Inserir resultados das ferramentas no histórico do chat
- [ ] Testar execução permitida, aprovação pendente, negação e erro de ferramenta

---

## Task 5: Aprovação Interativa

- [ ] Criar store para aprovações pendentes
- [ ] Criar UI para revisar ferramenta, argumentos e risco antes de aprovar
- [ ] Permitir aprovar uma chamada, negar uma chamada e cancelar sequência
- [ ] Exibir resultado ou erro após execução
- [ ] Garantir que `deny` nunca exibe botão de aprovação executável
- [ ] Testar fluxo de aprovação e negação

---

## Task 6: Integração com Chat

- [ ] Integrar runtime ao envio de mensagens existente
- [ ] Preservar streaming de texto quando não houver tool calls
- [ ] Exibir mensagens de ferramenta no histórico sem poluir a UI principal
- [ ] Persistir tool calls e resultados nas sessões
- [ ] Garantir compatibilidade com agentes Build, Plan e subagentes
- [ ] Testar conversa com leitura de arquivo e conversa com comando pendente de aprovação

---

## Task 7: Execução Real de Filesystem

- [ ] Implementar ferramenta `fs.list`
- [ ] Implementar ferramenta `fs.read`
- [ ] Implementar ferramenta `fs.write` com aprovação quando necessário
- [ ] Implementar ferramenta `fs.delete` somente com aprovação explícita
- [ ] Restringir paths ao workspace selecionado na SPA
- [ ] Retornar erros controlados para path inválido ou fora do workspace
- [ ] Testar sucesso, erro e tentativa fora do workspace

---

## Task 8: Execução Real de Terminal

- [ ] Implementar ferramenta `terminal.exec`
- [ ] Exigir aprovação para comandos por padrão
- [ ] Usar cwd dentro do workspace selecionado quando possível
- [ ] Respeitar timeout e limites do serviço local
- [ ] Exibir stdout, stderr, exit code e timeout no resultado
- [ ] Testar comando aprovado, comando negado e timeout

---

## Task 9: Webfetch Controlado

- [ ] Implementar ferramenta `webfetch` quando suportada pela arquitetura atual
- [ ] Validar URL absoluta `http` ou `https`
- [ ] Aplicar limite de tamanho ou truncamento determinístico
- [ ] Exigir aprovação para hosts desconhecidos se configurado como `ask`
- [ ] Testar sucesso, URL inválida e erro HTTP

---

## Task 10: Integração MCP Inicial

- [ ] Definir interface mínima para cliente MCP habilitado
- [ ] Suportar MCP HTTP/SSE quando explicitamente configurado e habilitado
- [ ] Listar ferramentas MCP disponíveis no runtime
- [ ] Exigir aprovação antes de executar ferramenta MCP por padrão
- [ ] Tratar falhas de conexão sem quebrar o chat
- [ ] Testar MCP mockado com ferramenta declarativa

---

## Task 11: Integração com Plugins

- [ ] Permitir que plugins habilitados exponham ferramentas declarativas ao runtime
- [ ] Manter erro controlado para ferramenta sem executor confiável
- [ ] Exigir permissão explícita antes de executar ferramenta de plugin
- [ ] Registrar eventos de hook antes e depois de tool calls
- [ ] Testar ferramenta de plugin mockada e plugin sem executor

---

## Task 12: Auditoria e Logs Locais

- [ ] Criar registro local em memória para tool calls recentes
- [ ] Persistir histórico mínimo na sessão quando fizer parte da conversa
- [ ] Não registrar API keys ou secrets em argumentos e resultados
- [ ] Mascarar valores sensíveis em previews da UI
- [ ] Testar mascaramento de campos sensíveis

---

## Task 13: Segurança e Limites

- [ ] Criar matriz de permissões efetivas por agente, subagente, skill, plugin e MCP
- [ ] Garantir que Plan peça aprovação para edição e bash
- [ ] Garantir que Explore e Scout não executem edição/bash
- [ ] Garantir que permissões `deny` tenham precedência sobre `allow`
- [ ] Adicionar testes de regressão para precedência de permissões

---

## Task 14: E2E do Runtime Agentico

- [ ] Cobrir chat solicitando leitura de arquivo via tool call mockada
- [ ] Cobrir aprovação de escrita de arquivo
- [ ] Cobrir negação de comando terminal
- [ ] Cobrir tool call MCP mockada
- [ ] Cobrir erro de ferramenta sem interromper a sessão
- [ ] Garantir que E2E não executa comandos destrutivos reais

---

## Verificação Final da Fase 12

- [ ] `npm test --workspace=service` passa
- [ ] `npm run build --workspace=service` passa
- [ ] `npm test --workspace=app` passa
- [ ] `npm run build --workspace=app` passa
- [ ] `npm run e2e --workspace=app` passa quando browsers do Playwright estão instalados
- [ ] Agente consegue ler arquivos via ferramenta aprovada/permitida
- [ ] Escrita de arquivo exige aprovação quando configurada como `ask`
- [ ] Comandos de terminal exigem aprovação por padrão
- [ ] MCP mockado expõe e executa ferramenta controlada
- [ ] Sessões persistem tool calls e resultados relevantes
- [ ] Secrets são mascarados em logs e previews

---

## Próximo Passo

Fase 13 — Produto Instalável: empacotamento, distribuição, atualização documentada, configuração persistente por usuário e guia de operação para uso diário.
