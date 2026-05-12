# Especificação Funcional — OpenCode Web Lite

## 1. Visão Geral

O OpenCode Web Lite é uma aplicação web SPA (Single Page Application) executada diretamente no navegador, sem necessidade de instalação da interface principal pelo usuário.

A aplicação deve oferecer uma experiência semelhante ao OpenCode tradicional, permitindo que o usuário utilize agentes de IA orientados a desenvolvimento de software diretamente em um projeto local armazenado no computador do usuário.

A interface web deve operar integrada a um serviço auxiliar local instalado pelo usuário, responsável pelo acesso ao sistema de arquivos e execução de operações locais no computador.

---

# 2. Objetivos da Aplicação

A aplicação deve permitir que o usuário:

* acesse a plataforma por navegador;
* selecione um provedor de LLM;
* escolha um modelo de IA;
* selecione uma pasta local de trabalho;
* utilize agentes de IA para planejar, criar, modificar e analisar projetos;
* manter toda a configuração do projeto localmente dentro da própria pasta do projeto;
* utilizar recursos locais do computador de forma controlada e autenticada.

---

# 3. Conceitos Fundamentais

## 3.1 Workspace

Workspace é uma pasta local escolhida pelo usuário.

Toda interação da aplicação deve ocorrer dentro desse workspace.

Ao selecionar um workspace pela primeira vez, a aplicação deve:

* criar o arquivo `AGENTS.md`;
* criar o diretório oculto `.opencode/`;
* criar o arquivo `.opencode/opencode.json` com valores padrão.

---

## 3.2 Diretório `.opencode/`

O diretório `.opencode/` é o repositório local de configuração e estado da aplicação.

Todos os dados específicos do projeto devem permanecer exclusivamente dentro desse diretório.

O diretório deve armazenar:

* configurações do projeto (`opencode.json`);
* agentes personalizados (`.opencode/agents/`);
* subagentes;
* skills (`.opencode/skills/`);
* plugins (`.opencode/plugins/`);
* MCPs;
* memória local;
* histórico contextual;
* cache local;
* preferências do workspace;
* arquivos de sessão;
* logs locais;
* prompts do sistema;
* templates;
* configurações do provedor de IA;
* dados temporários do projeto.

A aplicação não deve depender de armazenamento externo obrigatório para funcionamento do workspace.

---

# 4. Arquivo `opencode.json`

O arquivo `opencode.json` é o arquivo de configuração central do workspace, armazenado em `.opencode/opencode.json`.

Deve suportar configuração de:

* **Provedor e modelo padrão** — provedor LLM ativo e modelo selecionado para a sessão;
* **Agentes** — customização de agentes existentes, incluindo `tools`, `permission` (ask/allow/deny para edit, bash, webfetch), `temperature`, `steps`, `model` e `prompt`;
* **Skills** — padrões de permissão por nome (`allow`, `deny`, `ask`) com suporte a wildcards (ex: `internal-*`);
* **Plugins** — lista de pacotes NPM a carregar como plugins do projeto;
* **MCPs** — lista de MCPs do projeto com configuração individual (habilitado/desabilitado, parâmetros).

O arquivo deve ser criado automaticamente com valores padrão ao inicializar um novo workspace. Deve ser editável pelo usuário diretamente ou pela interface de configurações da aplicação.

As seções de Provedores (7), Skills (9), Plugins (10) e MCPs (11) referenciam o `opencode.json` como ponto central de configuração do projeto.

---

# 5. Arquivo `AGENTS.md`

O arquivo `AGENTS.md` deve representar a definição comportamental dos agentes do projeto.

O arquivo deve:

* existir na raiz do workspace;
* ser editável pelo usuário;
* servir como contexto persistente dos agentes;
* permitir definição de:

  * regras;
  * comportamentos;
  * convenções;
  * fluxos de trabalho;
  * arquitetura;
  * restrições;
  * padrões de código;
  * instruções específicas do projeto.

Os agentes devem considerar o conteúdo do `AGENTS.md` durante suas execuções.

---

# 6. Serviço Local

## 6.1 Objetivo

O sistema deve utilizar um serviço local instalado no computador do usuário para executar operações privilegiadas e acessar recursos locais.

---

## 6.2 Funções do Serviço Local

O serviço local deve ser responsável por:

* listar arquivos e diretórios;
* criar arquivos;
* editar arquivos;
* remover arquivos;
* mover arquivos;
* copiar arquivos;
* monitorar alterações;
* executar comandos locais;
* instalar dependências;
* executar scripts;
* acessar terminal;
* executar automações;
* permitir integração com ferramentas externas;
* expor recursos locais para a aplicação web.

---

## 6.3 Comunicação

A comunicação entre SPA e serviço local deve ocorrer via REST sobre rede local.

A aplicação web deve conseguir conectar-se ao serviço local mediante autenticação.

---

## 6.4 Token de Acesso

Ao iniciar o serviço local:

* um token de acesso deve ser gerado;
* o token deve ser apresentado ao usuário;
* o usuário deve informar esse token na SPA para autorizar a conexão.

A aplicação deve impedir acesso aos recursos locais sem token válido.

---

# 7. Gerenciamento de Provedores de LLM

A aplicação deve permitir configuração de múltiplos provedores de IA.

---

## 7.1 Provedores Suportados

Inicialmente, devem existir:

* suporte ao [OpenRouter](https://openrouter.ai);
* suporte a provedores compatíveis com OpenAI API.

---

## 7.2 Configuração do Provedor

O usuário deve poder:

* selecionar o provedor;
* informar credenciais;
* listar modelos disponíveis;
* selecionar modelo ativo;
* alterar modelo durante a sessão.

O provedor e modelo padrão do workspace são persistidos no `opencode.json`.

---

# 8. Agentes

## 8.1 Agentes Primários

A aplicação deve possuir dois agentes primários, alternáveis pelo usuário via botão na interface:

* **Build** — agente padrão, com acesso completo a todas as ferramentas (leitura/escrita de arquivos, execução de comandos, acesso web). Modo ativo ao abrir o workspace.
* **Plan** — agente de análise e planejamento. Edição de arquivos e execução de comandos ficam em modo `ask`, aguardando aprovação explícita do usuário antes de executar.

---

## 8.2 Subagentes

A aplicação deve suportar subagentes invocados automaticamente pelo agente primário ou manualmente via `@mention` na interface de chat:

* **General** — executor de tarefas multi-etapa com acesso completo às ferramentas, exceto `todo`;
* **Explore** — navegação e busca no codebase em modo somente leitura;
* **Scout** — pesquisa externa de documentação e dependências em modo somente leitura.

---

## 8.3 Agentes de Sistema

A aplicação deve implementar agentes de sistema acionados automaticamente, sem intervenção do usuário:

* **Compaction** — comprime automaticamente contextos longos para reduzir consumo de tokens;
* **Title** — gera automaticamente um título descritivo para a sessão ao encerrá-la;
* **Summary** — gera um resumo da sessão ao encerrá-la, persistido em `.opencode/`.

---

## 8.4 Configuração de Agentes

Cada agente pode ser customizado via `opencode.json` ou por arquivos markdown em `.opencode/agents/`.

Parâmetros configuráveis por agente:

* `tools` — ferramentas habilitadas ou desabilitadas;
* `permission` — nível de permissão para operações de edição, bash e webfetch (`ask`, `allow`, `deny`);
* `temperature` — controle de aleatoriedade das respostas (0.0–1.0);
* `steps` — limite máximo de iterações antes de respostas somente texto;
* `model` — modelo de IA a usar, sobrescrevendo o padrão do workspace;
* `prompt` — instruções de sistema customizadas via referência a arquivo.

---

## 8.5 Agentes Personalizados

O usuário deve poder criar agentes personalizados com:

* nome;
* descrição;
* instruções;
* ferramentas permitidas;
* contexto;
* comportamento;
* memória;
* restrições.

---

# 9. Skills

## 9.1 Estrutura de uma Skill

Cada skill é um diretório contendo obrigatoriamente um arquivo `SKILL.md`.

O `SKILL.md` deve ter frontmatter YAML com:

* `name` (obrigatório): alfanumérico minúsculo com hífens simples, 1–64 caracteres; deve coincidir com o nome do diretório; regex: `^[a-z0-9]+(-[a-z0-9]+)*$`;
* `description` (obrigatório): 1–1024 caracteres;
* `license`, `compatibility`, `metadata` (opcionais).

---

## 9.2 Localização

* Skills de projeto: `.opencode/skills/<name>/SKILL.md`;
* Compatibilidade com: `.claude/skills/<name>/SKILL.md` e `.agents/skills/<name>/SKILL.md`;
* Skills globais do usuário: diretório de configuração global do serviço local.

O sistema percorre da pasta atual até a raiz do repositório git, carregando as skills encontradas no caminho.

---

## 9.3 Descoberta e Carregamento

Os agentes descobrem skills disponíveis via ferramenta nativa `skill`.

O carregamento é sob demanda: o agente consulta as opções disponíveis e recupera o conteúdo completo quando necessário.

Skills globais são carregadas automaticamente ao iniciar a sessão.

---

## 9.4 Controle de Permissões

Configurado via `opencode.json` com padrões de nome:

* `allow` — carregamento imediato sem aprovação do usuário;
* `deny` — skill oculta dos agentes;
* `ask` — solicita aprovação do usuário antes de carregar.

Suporte a wildcards: `internal-*` corresponde a `internal-docs`, `internal-api`, etc.

---

# 10. Plugins

## 10.1 Formato

Plugins são módulos JavaScript/TypeScript que exportam uma função plugin.

A função recebe um objeto de contexto com: `project`, `directory`, `worktree`, `client` (SDK de IA) e acesso ao shell.

Plugins retornam implementações de hooks para os eventos subscritos.

---

## 10.2 Localização e Carregamento

* Plugins de projeto: `.opencode/plugins/`;
* Plugins podem ser pacotes NPM declarados no `opencode.json`;
* Ordem de carregamento: configuração global → configuração do projeto → diretório global → diretório do projeto;
* Dependências externas exigem `package.json` no diretório de configuração.

---

## 10.3 Capacidades

Plugins podem:

* subscrever a eventos de: comandos, arquivos, sessões, mensagens, permissões e ferramentas;
* adicionar ferramentas customizadas com validação de schema;
* modificar execução de ferramentas via hooks before/after;
* gerenciar variáveis de ambiente em contextos de shell;
* customizar o prompt de compactação de contexto;
* enviar notificações em resposta a eventos;
* implementar controles de segurança (ex: bloquear acesso a `.env`).

---

## 10.4 Diferença entre Plugins e Skills

* **Skills** são instruções em markdown consumidas pelos agentes durante execução — definem comportamento e conhecimento reutilizável.
* **Plugins** são código executável que estendem o comportamento do sistema em nível de infraestrutura — interceptam eventos, adicionam ferramentas e automatizam operações.

---

# 11. MCPs

A aplicação deve suportar MCPs configuráveis por projeto.

Os MCPs devem:

* ser configurados em `.opencode/opencode.json`;
* pertencer ao workspace;
* possuir gerenciamento independente;
* poder ser habilitados ou desabilitados individualmente.

---

# 12. Memória Local

Cada workspace deve possuir memória contextual própria.

A memória deve:

* permanecer isolada entre projetos;
* ser persistida localmente em `.opencode/`;
* armazenar histórico contextual relevante;
* auxiliar continuidade das interações.

---

# 13. Sistema de Arquivos

A aplicação deve operar exclusivamente dentro do workspace autorizado pelo usuário.

A aplicação não deve acessar diretórios externos sem autorização explícita.

---

# 14. Terminal e Execução Local

A aplicação deve permitir execução de comandos locais através do serviço local.

O usuário deve possuir controle sobre:

* permissões;
* comandos autorizados;
* escopo de execução;
* visibilidade das execuções.

---

# 15. Interface da Aplicação

## 15.1 Características Gerais

A aplicação deve ser:

* SPA;
* responsiva;
* executada no navegador;
* orientada a projetos;
* otimizada para fluxos de desenvolvimento assistido por IA.

---

## 15.2 Estrutura da Interface

A interface deve possuir:

* área de chat;
* explorador de arquivos;
* terminal;
* gerenciamento de agentes;
* gerenciamento de skills;
* gerenciamento de plugins;
* gerenciamento de MCPs;
* gerenciamento de modelos;
* histórico de sessões;
* configurações do workspace.

---

# 16. Sessões

A aplicação deve suportar múltiplas sessões por workspace.

## 16.1 Identificação de Sessão

Cada sessão recebe um ID único gerado automaticamente no formato `ses_<id>`.

O Title Agent gera automaticamente um nome descritivo ao encerrar a sessão.

Ao encerrar, a interface deve exibir o nome e o ID gerados para referência futura:

```
Sessão:   Implementar autenticação OAuth
Retomar:  ses_1eb3bb871ffemrSqkkD0NGpg6I
```

---

## 16.2 Listagem de Sessões

A interface deve exibir uma lista de sessões anteriores do workspace ativo.

Cada item deve apresentar:

* nome gerado pelo Title Agent;
* ID da sessão;
* data e hora de início e encerramento.

O usuário deve poder selecionar qualquer sessão da lista para retomá-la.

A listagem deve ser persistida localmente em `.opencode/`.

---

## 16.3 Retomada de Sessão

O usuário pode retomar qualquer sessão anterior selecionando-a na lista ou informando seu ID diretamente.

Ao retomar, devem ser restaurados:

* contexto;
* histórico de mensagens;
* estado dos agentes;
* ações executadas.

---

## 16.4 Encerramento

Ao encerrar uma sessão:

* o Summary Agent gera um resumo e o persiste em `.opencode/`;
* o Title Agent atribui um nome descritivo à sessão;
* o ID e o nome são exibidos ao usuário.

---

# 17. Segurança

## 17.1 Isolamento

Cada workspace deve ser isolado.

---

## 17.2 Autorização

O acesso aos recursos locais deve exigir:

* serviço local ativo;
* token válido;
* autorização explícita do usuário.

---

## 17.3 Controle de Acesso

A aplicação deve permitir:

* revogação de tokens;
* encerramento de sessões;
* limitação de permissões;
* gerenciamento de acessos ativos.

---

# 18. Persistência

Toda persistência do projeto deve ocorrer localmente no workspace.

A aplicação não deve exigir backend centralizado para armazenamento dos projetos.

---

# 19. Portabilidade

O workspace deve ser portátil.

Ao copiar a pasta do projeto para outro computador, todas as configurações do OpenCode Web Lite devem acompanhar o projeto através do diretório `.opencode/`.

---

# 20. Compatibilidade

A aplicação deve funcionar em sistemas operacionais modernos compatíveis com o serviço local.

---

# 21. Fluxo Inicial do Usuário

## Primeiro Uso

1. Usuário acessa a URL da aplicação;
2. Usuário instala o serviço local;
3. Usuário executa o serviço local;
4. Serviço gera token de acesso;
5. Usuário informa o token na SPA;
6. Usuário seleciona provedor LLM;
7. Usuário seleciona modelo;
8. Usuário escolhe pasta local de trabalho;
9. Sistema cria:

   * `AGENTS.md`;
   * `.opencode/`;
   * `.opencode/opencode.json` com valores padrão;
10. Workspace torna-se disponível;
11. Usuário inicia interação com os agentes.

---

# 22. Requisitos Não Funcionais

A aplicação deve:

* funcionar com baixa latência;
* suportar múltiplos workspaces;
* suportar grandes projetos;
* preservar contexto local;
* minimizar dependência de serviços externos;
* permitir operação contínua do workspace;
* oferecer experiência semelhante a IDEs modernas orientadas por IA.

---

# 23. Escopo Inicial

## Incluído

* gerenciamento de workspace;
* agentes (primários, subagentes e sistema);
* agentes personalizados;
* skills;
* plugins;
* MCPs;
* memória local;
* integração com provedores LLM;
* integração com serviço local via REST;
* operações de arquivos;
* terminal local;
* persistência local;
* gerenciamento de sessões com listagem e retomada por ID.

---

## Fora do Escopo Inicial

* colaboração multiusuário em tempo real;
* sincronização em nuvem obrigatória;
* marketplace de plugins;
* execução remota distribuída;
* hospedagem de modelos localmente pela própria SPA;
* dependência de backend centralizado para projetos locais.
