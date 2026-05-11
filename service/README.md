# OpenCode Web Lite — Serviço Local

Serviço REST local que fornece acesso ao filesystem e terminal para o OpenCode Web Lite.

## Instalação

```bash
npm install -g @opencode-web-lite/service
```

## Uso

```bash
opencode-service
```

Ao iniciar, o serviço exibe o token de acesso. Informe esse token na interface web para conectar.

## Porta Padrão

`7847`. Para alterar, use a variável de ambiente `OPENCODE_PORT`.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /health | Status do serviço (público) |
| GET | /fs/list?path= | Listar diretório |
| GET | /fs/read?path= | Ler arquivo |
| POST | /fs/write | Escrever arquivo |
| DELETE | /fs/delete | Deletar arquivo/diretório |
| POST | /fs/move | Mover arquivo |
| POST | /fs/copy | Copiar arquivo |
| GET | /fs/watch?path= | Watch SSE de diretório |
| POST | /terminal/exec | Executar comando |
| POST | /terminal/create | Criar sessão PTY |
| DELETE | /terminal/:id | Encerrar sessão PTY |
| WS | /terminal/ws?token=&sessionId= | WebSocket PTY |
| POST | /workspace/init | Inicializar workspace |
| GET | /workspace/status?path= | Status do workspace |
