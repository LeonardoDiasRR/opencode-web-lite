# Fase 1 — Serviço Local: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Construir o serviço local Node.js que expõe uma REST API autenticada para operações de filesystem, execução de comandos e inicialização de workspace — fundação de toda a aplicação.

**Architecture:** Servidor Express com middleware de autenticação por token. Módulos independentes por domínio (auth, fs, terminal, workspace). Rotas montadas em prefixos `/fs`, `/terminal`, `/workspace`. Health check público em `/health`. File watching via SSE. Execução de comandos via `child_process`. PTY interativo via `node-pty`.

**Tech Stack:**
- Runtime: Node.js 20 LTS
- Linguagem: TypeScript 5 (`"strict": true`)
- Framework: Express 4
- Pacotes: `cors`, `chokidar` 3, `node-pty`, `ws`
- Build: `tsup` (produção), `tsx` (desenvolvimento)
- Testes: Vitest 1 + `supertest`

---

## Estrutura de Arquivos

```
service/
├── src/
│   ├── auth/
│   │   ├── token.ts           # Geração e validação de token
│   │   └── middleware.ts      # Express middleware de autenticação
│   ├── fs/
│   │   ├── operations.ts      # CRUD: list, read, write, delete, move, copy
│   │   └── watcher.ts         # SSE: watch de diretório via chokidar
│   ├── terminal/
│   │   ├── executor.ts        # Execução não-interativa de comandos
│   │   └── pty.ts             # PTY interativo via node-pty + WebSocket
│   ├── workspace/
│   │   └── initializer.ts     # Cria AGENTS.md + .opencode/opencode.json
│   ├── routes/
│   │   ├── fs.ts              # Rotas /fs/*
│   │   ├── terminal.ts        # Rotas /terminal/*
│   │   ├── workspace.ts       # Rotas /workspace/*
│   │   └── health.ts          # GET /health (público)
│   └── server.ts              # Composição do Express app + startup
├── tests/
│   ├── auth.test.ts
│   ├── fs.test.ts
│   ├── terminal.test.ts
│   └── workspace.test.ts
├── package.json
└── tsconfig.json
```

---

## Task 1: Scaffold do Monorepo + Pacote `service/`

**Files:**
- Create: `package.json` (raiz)
- Create: `service/package.json`
- Create: `service/tsconfig.json`
- Create: `service/src/server.ts` (placeholder)

- [x] **Step 1: Criar package.json na raiz (npm workspaces)**

```json
{
  "name": "opencode-web-lite",
  "version": "0.1.0",
  "private": true,
  "workspaces": ["service", "app"],
  "scripts": {
    "service:dev": "npm run dev --workspace=service",
    "service:test": "npm test --workspace=service",
    "service:build": "npm run build --workspace=service"
  }
}
```

- [x] **Step 2: Criar `service/package.json`**

```json
{
  "name": "@opencode-web-lite/service",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/server.js",
  "bin": {
    "opencode-service": "dist/server.js"
  },
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsup src/server.ts --format esm --dts",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "chokidar": "^3.6.0",
    "node-pty": "^1.0.0",
    "ws": "^8.18.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.0",
    "@types/supertest": "^6.0.2",
    "@types/ws": "^8.5.12",
    "supertest": "^7.0.0",
    "tsup": "^8.1.0",
    "tsx": "^4.15.0",
    "typescript": "^5.5.0",
    "vitest": "^1.6.0"
  }
}
```

- [x] **Step 3: Criar `service/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [x] **Step 4: Criar `service/src/server.ts` placeholder**

```typescript
export const VERSION = '0.1.0';
```

- [x] **Step 5: Instalar dependências**

```bash
cd service && npm install
```

Expected: `node_modules/` criado, sem erros.

- [x] **Step 6: Commit**

```bash
git add package.json service/package.json service/tsconfig.json service/src/server.ts
git commit -m "chore: scaffold monorepo + service package"
```

---

## Task 2: Sistema de Token de Acesso

**Files:**
- Create: `service/src/auth/token.ts`
- Create: `service/tests/auth.test.ts`

- [x] **Step 1: Escrever teste falhante**

`service/tests/auth.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateToken, validateToken, loadOrCreateToken } from '../src/auth/token.js';
import { rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('token', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = join(tmpdir(), `oc-token-test-${Date.now()}`);
    await mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('generates a 64-character hex token', () => {
    const token = generateToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it('generates unique tokens on each call', () => {
    expect(generateToken()).not.toBe(generateToken());
  });

  it('validates correct token', () => {
    const token = generateToken();
    expect(validateToken(token, token)).toBe(true);
  });

  it('rejects incorrect token', () => {
    const token = generateToken();
    expect(validateToken('wrong', token)).toBe(false);
  });

  it('rejects empty token', () => {
    const token = generateToken();
    expect(validateToken('', token)).toBe(false);
  });

  it('loadOrCreateToken creates token file if missing', async () => {
    const tokenFile = join(tmpDir, '.opencode-service.token');
    const token = await loadOrCreateToken(tokenFile);
    expect(token).toMatch(/^[a-f0-9]{64}$/);

    const { readFile } = await import('node:fs/promises');
    const stored = (await readFile(tokenFile, 'utf8')).trim();
    expect(stored).toBe(token);
  });

  it('loadOrCreateToken reads existing token file', async () => {
    const { writeFile } = await import('node:fs/promises');
    const tokenFile = join(tmpDir, '.opencode-service.token');
    const existing = generateToken();
    await writeFile(tokenFile, existing + '\n', 'utf8');

    const loaded = await loadOrCreateToken(tokenFile);
    expect(loaded).toBe(existing);
  });
});
```

- [x] **Step 2: Executar teste para confirmar falha**

```bash
cd service && npx vitest run tests/auth.test.ts
```

Expected: FAIL — "Cannot find module '../src/auth/token.js'"

- [x] **Step 3: Implementar `service/src/auth/token.ts`**

```typescript
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateToken(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  // constant-time comparison via XOR to avoid timing attacks
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function loadOrCreateToken(tokenFile: string): Promise<string> {
  if (existsSync(tokenFile)) {
    const content = await readFile(tokenFile, 'utf8');
    return content.trim();
  }
  const token = generateToken();
  await writeFile(tokenFile, token + '\n', { encoding: 'utf8', mode: 0o600 });
  return token;
}
```

- [x] **Step 4: Executar teste para confirmar aprovação**

```bash
cd service && npx vitest run tests/auth.test.ts
```

Expected: PASS — 6 tests passed

- [x] **Step 5: Commit**

```bash
git add service/src/auth/token.ts service/tests/auth.test.ts
git commit -m "feat(service): implement access token generation and validation"
```

---

## Task 3: Middleware de Autenticação + Express Server

**Files:**
- Create: `service/src/auth/middleware.ts`
- Create: `service/src/routes/health.ts`
- Modify: `service/src/server.ts`
- Modify: `service/tests/auth.test.ts`

- [x] **Step 1: Adicionar ao topo de `service/tests/auth.test.ts` os imports necessários**

```typescript
import express from 'express';
import request from 'supertest';
import { authMiddleware } from '../src/auth/middleware.js';
```

- [x] **Step 2: Adicionar testes do middleware ao final do mesmo arquivo**

```typescript

describe('authMiddleware', () => {
  const testToken = generateToken();
  const app = express();
  app.use('/protected', authMiddleware(() => testToken), (_req, res) => {
    res.json({ ok: true });
  });

  it('allows request with valid Bearer token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('rejects request without token', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('rejects request with wrong token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer wrongtoken');
    expect(res.status).toBe(401);
  });
});
```

- [x] **Step 3: Executar para confirmar falha**

```bash
cd service && npx vitest run tests/auth.test.ts
```

Expected: FAIL — "Cannot find module '../src/auth/middleware.js'"

- [x] **Step 4: Implementar `service/src/auth/middleware.ts`**

```typescript
import type { Request, Response, NextFunction } from 'express';
import { validateToken } from './token.js';

export function authMiddleware(getToken: () => string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!validateToken(token, getToken())) {
      res.status(401).json({ error: 'Invalid or missing token', code: 'UNAUTHORIZED' });
      return;
    }
    next();
  };
}
```

- [x] **Step 5: Implementar `service/src/routes/health.ts`**

```typescript
import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});
```

- [x] **Step 6: Implementar `service/src/server.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { loadOrCreateToken } from './auth/token.js';
import { authMiddleware } from './auth/middleware.js';
import { healthRouter } from './routes/health.js';

const PORT = parseInt(process.env.OPENCODE_PORT ?? '7847', 10);
const TOKEN_FILE = join(homedir(), '.opencode-service.token');

async function start() {
  const token = await loadOrCreateToken(TOKEN_FILE);

  const app = express();
  app.use(cors({ origin: /^https?:\/\/localhost(:\d+)?$/ }));
  app.use(express.json({ limit: '10mb' }));

  app.use('/health', healthRouter);
  app.use(authMiddleware(() => token));

  // Routes will be mounted here in subsequent tasks

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`\nOpenCode Service running on http://127.0.0.1:${PORT}`);
    console.log(`\nAccess token: ${token}\n`);
    console.log(`Enter this token in the OpenCode Web app to connect.\n`);
  });
}

start().catch((err) => {
  console.error('Failed to start service:', err);
  process.exit(1);
});
```

- [x] **Step 7: Executar testes**

```bash
cd service && npx vitest run tests/auth.test.ts
```

Expected: PASS — todos os testes

- [x] **Step 8: Verificar que o servidor inicia**

```bash
cd service && npx tsx src/server.ts
```

Expected: Imprime token e mensagem de startup. Ctrl+C para parar.

- [x] **Step 9: Commit**

```bash
git add service/src/auth/middleware.ts service/src/routes/health.ts service/src/server.ts service/tests/auth.test.ts
git commit -m "feat(service): add Express server with token auth middleware"
```

---

## Task 4: Operações de Filesystem — Listar e Ler

**Files:**
- Create: `service/src/fs/operations.ts`
- Create: `service/src/routes/fs.ts`
- Create: `service/tests/fs.test.ts`
- Modify: `service/src/server.ts`

- [x] **Step 1: Escrever testes falhantes**

`service/tests/fs.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { listDirectory, readFile as fsReadFile } from '../src/fs/operations.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = join(tmpdir(), `oc-fs-test-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });
  await writeFile(join(tmpDir, 'hello.txt'), 'hello world', 'utf8');
  await mkdir(join(tmpDir, 'subdir'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('listDirectory', () => {
  it('lists files and directories', async () => {
    const entries = await listDirectory(tmpDir);
    expect(entries).toHaveLength(2);
    const names = entries.map((e) => e.name).sort();
    expect(names).toEqual(['hello.txt', 'subdir']);
  });

  it('marks directories correctly', async () => {
    const entries = await listDirectory(tmpDir);
    const dir = entries.find((e) => e.name === 'subdir')!;
    expect(dir.type).toBe('directory');
    const file = entries.find((e) => e.name === 'hello.txt')!;
    expect(file.type).toBe('file');
  });

  it('includes size and modified for files', async () => {
    const entries = await listDirectory(tmpDir);
    const file = entries.find((e) => e.name === 'hello.txt')!;
    expect(file.size).toBe(11);
    expect(file.modified).toBeInstanceOf(Date);
  });

  it('throws for non-existent path', async () => {
    await expect(listDirectory('/nonexistent/path')).rejects.toThrow();
  });
});

describe('fsReadFile', () => {
  it('reads existing file content', async () => {
    const result = await fsReadFile(join(tmpDir, 'hello.txt'));
    expect(result.content).toBe('hello world');
    expect(result.size).toBe(11);
  });

  it('throws for non-existent file', async () => {
    await expect(fsReadFile(join(tmpDir, 'missing.txt'))).rejects.toThrow();
  });
});
```

- [x] **Step 2: Executar para confirmar falha**

```bash
cd service && npx vitest run tests/fs.test.ts
```

Expected: FAIL — "Cannot find module '../src/fs/operations.js'"

- [x] **Step 3: Implementar `service/src/fs/operations.ts`**

```typescript
import { readdir, stat, readFile as nodeReadFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface DirEntry {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size: number;
  modified: Date;
}

export interface FileContent {
  content: string;
  size: number;
}

export async function listDirectory(dirPath: string): Promise<DirEntry[]> {
  const names = await readdir(dirPath);
  const entries = await Promise.all(
    names.map(async (name) => {
      const fullPath = join(dirPath, name);
      const info = await stat(fullPath);
      return {
        name,
        path: fullPath,
        type: info.isDirectory() ? 'directory' : info.isSymbolicLink() ? 'symlink' : 'file',
        size: info.size,
        modified: info.mtime,
      } satisfies DirEntry;
    })
  );
  return entries;
}

export async function readFile(filePath: string): Promise<FileContent> {
  const content = await nodeReadFile(filePath, 'utf8');
  const info = await stat(filePath);
  return { content, size: info.size };
}
```

- [x] **Step 4: Executar testes de list/read**

```bash
cd service && npx vitest run tests/fs.test.ts
```

Expected: PASS — todos os testes de listDirectory e fsReadFile

- [x] **Step 5: Commit parcial**

```bash
git add service/src/fs/operations.ts service/tests/fs.test.ts
git commit -m "feat(service): implement filesystem list and read operations"
```

---

## Task 5: Operações de Filesystem — Escrever, Deletar, Mover, Copiar

**Files:**
- Modify: `service/src/fs/operations.ts`
- Modify: `service/tests/fs.test.ts`

- [x] **Step 1: Adicionar testes falhantes em `service/tests/fs.test.ts`**

```typescript
import { writeFile as fsWriteFile, deleteFile, moveFile, copyFile } from '../src/fs/operations.js';

describe('fsWriteFile', () => {
  it('creates a new file', async () => {
    const path = join(tmpDir, 'new.txt');
    await fsWriteFile(path, 'content here');
    const { content } = await fsReadFile(path);
    expect(content).toBe('content here');
  });

  it('overwrites existing file', async () => {
    const path = join(tmpDir, 'hello.txt');
    await fsWriteFile(path, 'updated');
    const { content } = await fsReadFile(path);
    expect(content).toBe('updated');
  });

  it('creates intermediate directories', async () => {
    const path = join(tmpDir, 'nested', 'deep', 'file.txt');
    await fsWriteFile(path, 'deep content');
    const { content } = await fsReadFile(path);
    expect(content).toBe('deep content');
  });
});

describe('deleteFile', () => {
  it('deletes an existing file', async () => {
    const path = join(tmpDir, 'hello.txt');
    await deleteFile(path);
    await expect(fsReadFile(path)).rejects.toThrow();
  });

  it('deletes a directory recursively', async () => {
    await deleteFile(join(tmpDir, 'subdir'));
    const entries = await listDirectory(tmpDir);
    expect(entries.find((e) => e.name === 'subdir')).toBeUndefined();
  });
});

describe('moveFile', () => {
  it('moves file to new location', async () => {
    const src = join(tmpDir, 'hello.txt');
    const dest = join(tmpDir, 'moved.txt');
    await moveFile(src, dest);
    const { content } = await fsReadFile(dest);
    expect(content).toBe('hello world');
    await expect(fsReadFile(src)).rejects.toThrow();
  });
});

describe('copyFile', () => {
  it('copies file to new location', async () => {
    const src = join(tmpDir, 'hello.txt');
    const dest = join(tmpDir, 'copy.txt');
    await copyFile(src, dest);
    const original = await fsReadFile(src);
    const copy = await fsReadFile(dest);
    expect(original.content).toBe(copy.content);
  });
});
```

- [x] **Step 2: Executar para confirmar falha**

```bash
cd service && npx vitest run tests/fs.test.ts
```

Expected: FAIL — "writeFile is not exported from operations.js"

- [x] **Step 3: Adicionar operações em `service/src/fs/operations.ts`**

```typescript
import { mkdir, rm, rename, copyFile as nodeCopyFile, writeFile as nodeWriteFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function writeFile(filePath: string, content: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await nodeWriteFile(filePath, content, 'utf8');
}

export async function deleteFile(targetPath: string): Promise<void> {
  await rm(targetPath, { recursive: true, force: true });
}

export async function moveFile(from: string, to: string): Promise<void> {
  await mkdir(dirname(to), { recursive: true });
  await rename(from, to);
}

export async function copyFile(from: string, to: string): Promise<void> {
  await mkdir(dirname(to), { recursive: true });
  await nodeCopyFile(from, to);
}
```

- [x] **Step 4: Executar todos os testes de fs**

```bash
cd service && npx vitest run tests/fs.test.ts
```

Expected: PASS — todos os testes

- [x] **Step 5: Commit**

```bash
git add service/src/fs/operations.ts service/tests/fs.test.ts
git commit -m "feat(service): implement filesystem write, delete, move, copy"
```

---

## Task 6: Rotas HTTP de Filesystem

**Files:**
- Create: `service/src/routes/fs.ts`
- Modify: `service/src/server.ts`

Obs.: As rotas reutilizam as operações já testadas. Os testes das rotas verificam a integração HTTP; o comportamento da lógica já está coberto nos testes de unit.

- [x] **Step 1: Implementar `service/src/routes/fs.ts`**

```typescript
import { Router } from 'express';
import {
  listDirectory,
  readFile,
  writeFile,
  deleteFile,
  moveFile,
  copyFile,
} from '../fs/operations.js';

export const fsRouter = Router();

fsRouter.get('/list', async (req, res) => {
  const path = req.query.path as string;
  if (!path) {
    res.status(400).json({ error: 'path query param required', code: 'MISSING_PARAM' });
    return;
  }
  try {
    const entries = await listDirectory(path);
    res.json({ entries });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(404).json({ error: message, code: 'NOT_FOUND' });
  }
});

fsRouter.get('/read', async (req, res) => {
  const path = req.query.path as string;
  if (!path) {
    res.status(400).json({ error: 'path query param required', code: 'MISSING_PARAM' });
    return;
  }
  try {
    const file = await readFile(path);
    res.json(file);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(404).json({ error: message, code: 'NOT_FOUND' });
  }
});

fsRouter.post('/write', async (req, res) => {
  const { path, content } = req.body as { path?: string; content?: string };
  if (!path || content === undefined) {
    res.status(400).json({ error: 'path and content required', code: 'MISSING_PARAM' });
    return;
  }
  try {
    await writeFile(path, content);
    res.json({ success: true, path });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message, code: 'WRITE_ERROR' });
  }
});

fsRouter.delete('/delete', async (req, res) => {
  const { path } = req.body as { path?: string };
  if (!path) {
    res.status(400).json({ error: 'path required', code: 'MISSING_PARAM' });
    return;
  }
  try {
    await deleteFile(path);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message, code: 'DELETE_ERROR' });
  }
});

fsRouter.post('/move', async (req, res) => {
  const { from, to } = req.body as { from?: string; to?: string };
  if (!from || !to) {
    res.status(400).json({ error: 'from and to required', code: 'MISSING_PARAM' });
    return;
  }
  try {
    await moveFile(from, to);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message, code: 'MOVE_ERROR' });
  }
});

fsRouter.post('/copy', async (req, res) => {
  const { from, to } = req.body as { from?: string; to?: string };
  if (!from || !to) {
    res.status(400).json({ error: 'from and to required', code: 'MISSING_PARAM' });
    return;
  }
  try {
    await copyFile(from, to);
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message, code: 'COPY_ERROR' });
  }
});
```

- [x] **Step 2: Montar rota em `service/src/server.ts`**

Adicionar antes de `app.listen(...)`:
```typescript
import { fsRouter } from './routes/fs.js';
// ...
app.use('/fs', fsRouter);
```

- [x] **Step 3: Verificar que o servidor inicia sem erros**

```bash
cd service && npx tsx src/server.ts
```

Expected: startup message com token. Ctrl+C.

- [x] **Step 4: Testar rotas via curl (com servidor rodando em segundo terminal)**

```bash
TOKEN=<token-from-stdout>

# Health (sem token)
curl http://localhost:7847/health
# Expected: {"status":"ok","version":"0.1.0"}

# List (com token)
curl -H "Authorization: Bearer $TOKEN" "http://localhost:7847/fs/list?path=$HOME"
# Expected: {"entries":[...]}

# Sem token
curl http://localhost:7847/fs/list?path=/tmp
# Expected: 401 {"error":"Invalid or missing token","code":"UNAUTHORIZED"}
```

- [x] **Step 5: Commit**

```bash
git add service/src/routes/fs.ts service/src/server.ts
git commit -m "feat(service): add /fs HTTP routes (list, read, write, delete, move, copy)"
```

---

## Task 7: File Watching via SSE

**Files:**
- Create: `service/src/fs/watcher.ts`
- Modify: `service/src/routes/fs.ts`

- [x] **Step 1: Escrever teste de watcher**

Adicionar em `service/tests/fs.test.ts`:
```typescript
import { createWatcher } from '../src/fs/watcher.js';

describe('createWatcher', () => {
  it('emits add event when file is created', async () => {
    const events: Array<{ type: string; path: string }> = [];
    const { stop } = createWatcher(tmpDir, (event) => events.push(event));

    const newFile = join(tmpDir, 'watched.txt');
    await fsWriteFile(newFile, 'test');

    // Wait for chokidar to emit
    await new Promise((resolve) => setTimeout(resolve, 200));
    await stop();

    expect(events.some((e) => e.type === 'add' && e.path.endsWith('watched.txt'))).toBe(true);
  });

  it('emits change event when file is modified', async () => {
    const events: Array<{ type: string; path: string }> = [];
    const { stop } = createWatcher(tmpDir, (event) => events.push(event));

    await new Promise((resolve) => setTimeout(resolve, 100));
    await import('node:fs/promises').then((m) =>
      m.writeFile(join(tmpDir, 'hello.txt'), 'changed', 'utf8')
    );

    await new Promise((resolve) => setTimeout(resolve, 200));
    await stop();

    expect(events.some((e) => e.type === 'change' && e.path.endsWith('hello.txt'))).toBe(true);
  });
});
```

- [x] **Step 2: Executar para confirmar falha**

```bash
cd service && npx vitest run tests/fs.test.ts
```

Expected: FAIL — "Cannot find module '../src/fs/watcher.js'"

- [x] **Step 3: Implementar `service/src/fs/watcher.ts`**

```typescript
import chokidar from 'chokidar';

export interface WatchEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  timestamp: number;
}

export interface Watcher {
  stop: () => Promise<void>;
}

export function createWatcher(
  dirPath: string,
  onEvent: (event: WatchEvent) => void
): Watcher {
  const watcher = chokidar.watch(dirPath, {
    ignoreInitial: true,
    persistent: true,
  });

  const emit = (type: WatchEvent['type']) => (path: string) => {
    onEvent({ type, path, timestamp: Date.now() });
  };

  watcher.on('add', emit('add'));
  watcher.on('change', emit('change'));
  watcher.on('unlink', emit('unlink'));

  return {
    stop: () => watcher.close(),
  };
}
```

- [x] **Step 4: Adicionar rota SSE em `service/src/routes/fs.ts`**

```typescript
import { createWatcher } from '../fs/watcher.js';

fsRouter.get('/watch', (req, res) => {
  const path = req.query.path as string;
  if (!path) {
    res.status(400).json({ error: 'path query param required', code: 'MISSING_PARAM' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const { stop } = createWatcher(path, (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  req.on('close', () => {
    stop();
  });
});
```

- [x] **Step 5: Executar todos os testes de fs**

```bash
cd service && npx vitest run tests/fs.test.ts
```

Expected: PASS — todos os testes

- [x] **Step 6: Commit**

```bash
git add service/src/fs/watcher.ts service/src/routes/fs.ts service/tests/fs.test.ts
git commit -m "feat(service): add filesystem watcher via SSE"
```

---

## Task 8: Execução de Comandos (não-interativo)

**Files:**
- Create: `service/src/terminal/executor.ts`
- Create: `service/src/routes/terminal.ts`
- Create: `service/tests/terminal.test.ts`
- Modify: `service/src/server.ts`

- [x] **Step 1: Escrever testes**

`service/tests/terminal.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { execCommand } from '../src/terminal/executor.js';
import { tmpdir } from 'node:os';

describe('execCommand', () => {
  it('executes simple command and returns output', async () => {
    const result = await execCommand({ command: 'echo', args: ['hello'], cwd: tmpdir() });
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe('hello');
    expect(result.stderr).toBe('');
  });

  it('captures exit code on failure', async () => {
    const result = await execCommand({ command: 'node', args: ['-e', 'process.exit(2)'], cwd: tmpdir() });
    expect(result.exitCode).toBe(2);
  });

  it('captures stderr', async () => {
    const result = await execCommand({
      command: 'node',
      args: ['-e', 'process.stderr.write("err output")'],
      cwd: tmpdir(),
    });
    expect(result.stderr).toContain('err output');
  });

  it('rejects after timeout', async () => {
    await expect(
      execCommand({ command: 'node', args: ['-e', 'setTimeout(()=>{},10000)'], cwd: tmpdir(), timeoutMs: 500 })
    ).rejects.toThrow(/timed out/i);
  });
});
```

- [x] **Step 2: Executar para confirmar falha**

```bash
cd service && npx vitest run tests/terminal.test.ts
```

Expected: FAIL — "Cannot find module '../src/terminal/executor.js'"

- [x] **Step 3: Implementar `service/src/terminal/executor.ts`**

```typescript
import { spawn } from 'node:child_process';

export interface ExecOptions {
  command: string;
  args?: string[];
  cwd: string;
  env?: Record<string, string>;
  timeoutMs?: number;
}

export interface ExecResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export function execCommand(options: ExecOptions): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    const { command, args = [], cwd, env, timeoutMs = 30_000 } = options;
    const start = Date.now();

    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      shell: false,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Command timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code ?? -1, stdout, stderr, durationMs: Date.now() - start });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
```

- [x] **Step 4: Implementar `service/src/routes/terminal.ts`**

```typescript
import { Router } from 'express';
import { execCommand } from '../terminal/executor.js';

export const terminalRouter = Router();

terminalRouter.post('/exec', async (req, res) => {
  const { command, args, cwd, timeoutMs } = req.body as {
    command?: string;
    args?: string[];
    cwd?: string;
    timeoutMs?: number;
  };

  if (!command || !cwd) {
    res.status(400).json({ error: 'command and cwd required', code: 'MISSING_PARAM' });
    return;
  }

  try {
    const result = await execCommand({ command, args, cwd, timeoutMs });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message, code: 'EXEC_ERROR' });
  }
});
```

- [x] **Step 5: Montar rota em `service/src/server.ts`**

```typescript
import { terminalRouter } from './routes/terminal.js';
// ...
app.use('/terminal', terminalRouter);
```

- [x] **Step 6: Executar testes**

```bash
cd service && npx vitest run tests/terminal.test.ts
```

Expected: PASS — todos os testes

- [x] **Step 7: Commit**

```bash
git add service/src/terminal/executor.ts service/src/routes/terminal.ts service/tests/terminal.test.ts service/src/server.ts
git commit -m "feat(service): add non-interactive command execution via /terminal/exec"
```

---

## Task 9: Terminal Interativo (PTY via WebSocket)

**Files:**
- Create: `service/src/terminal/pty.ts`
- Modify: `service/src/routes/terminal.ts`
- Modify: `service/src/server.ts`

Nota: `node-pty` é um módulo nativo; os testes de integração PTY requerem ambiente real. Os testes abaixo verificam o gerenciamento de sessões sem PTY real.

- [x] **Step 1: Implementar `service/src/terminal/pty.ts`**

```typescript
import * as pty from 'node-pty';
import { randomBytes } from 'node:crypto';

export interface PtySession {
  id: string;
  process: pty.IPty;
  createdAt: Date;
}

const sessions = new Map<string, PtySession>();

export function createPtySession(cwd: string, shell?: string): PtySession {
  const id = randomBytes(8).toString('hex');
  const shellBin = shell ?? (process.platform === 'win32' ? 'powershell.exe' : '/bin/bash');
  const safeEnv = Object.fromEntries(
    Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined)
  );

  const ptyProcess = pty.spawn(shellBin, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd,
    env: safeEnv,
  });

  const session: PtySession = { id, process: ptyProcess, createdAt: new Date() };
  sessions.set(id, session);
  return session;
}

export function getPtySession(id: string): PtySession | undefined {
  return sessions.get(id);
}

export function destroyPtySession(id: string): boolean {
  const session = sessions.get(id);
  if (!session) return false;
  session.process.kill();
  sessions.delete(id);
  return true;
}

export function listPtySessions(): string[] {
  return Array.from(sessions.keys());
}
```

- [x] **Step 2: Adicionar rotas PTY em `service/src/routes/terminal.ts`**

```typescript
import { createPtySession, getPtySession, destroyPtySession } from '../terminal/pty.js';

terminalRouter.post('/create', (req, res) => {
  const { cwd, shell } = req.body as { cwd?: string; shell?: string };
  if (!cwd) {
    res.status(400).json({ error: 'cwd required', code: 'MISSING_PARAM' });
    return;
  }
  try {
    const session = createPtySession(cwd, shell);
    res.json({ sessionId: session.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message, code: 'PTY_ERROR' });
  }
});

terminalRouter.delete('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const destroyed = destroyPtySession(sessionId);
  if (!destroyed) {
    res.status(404).json({ error: 'Session not found', code: 'NOT_FOUND' });
    return;
  }
  res.json({ success: true });
});
```

- [x] **Step 3: Conectar PTY ao WebSocket em `service/src/server.ts`**

Adicionar os seguintes imports ao topo do arquivo (após os imports existentes) e substituir `app.listen` pela versão que captura o `server`:

```typescript
import { WebSocketServer } from 'ws';
import type { IncomingMessage } from 'node:http';
import { getPtySession } from './terminal/pty.js';
// Atualizar import de token.ts (Task 3 importou apenas loadOrCreateToken):
// import { loadOrCreateToken, validateToken } from './auth/token.js';

// Após app.listen():
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`\nOpenCode Service running on http://127.0.0.1:${PORT}`);
  console.log(`\nAccess token: ${token}\n`);
});

const wss = new WebSocketServer({ server, path: '/terminal/ws' });

wss.on('connection', (ws, req: IncomingMessage) => {
  // Validate token from query param ?token=<token>
  const url = new URL(req.url ?? '', `http://127.0.0.1:${PORT}`);
  const queryToken = url.searchParams.get('token') ?? '';
  if (!validateToken(queryToken, token)) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  const sessionId = url.searchParams.get('sessionId') ?? '';
  const session = getPtySession(sessionId);
  if (!session) {
    ws.close(4004, 'Session not found');
    return;
  }

  session.process.onData((data) => ws.send(data));
  ws.on('message', (msg) => session.process.write(msg.toString()));
  ws.on('close', () => { /* PTY remains until explicitly destroyed */ });
});
```

- [x] **Step 4: Verificar que o servidor compila sem erros de tipo**

```bash
cd service && npx tsc --noEmit
```

Expected: Sem erros.

- [x] **Step 5: Testar PTY manualmente (opcional, requer node-pty nativo compilado)**

```bash
cd service && npx tsx src/server.ts
# Em outro terminal:
TOKEN=<token>
# Criar sessão
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"cwd":"/tmp"}' http://localhost:7847/terminal/create
# Expected: {"sessionId":"..."}

# Conectar via wscat (npm install -g wscat):
wscat -c "ws://localhost:7847/terminal/ws?token=$TOKEN&sessionId=<id>"
# Digitar comandos no prompt
```

- [x] **Step 6: Commit**

```bash
git add service/src/terminal/pty.ts service/src/routes/terminal.ts service/src/server.ts
git commit -m "feat(service): add interactive PTY terminal via WebSocket"
```

---

## Task 10: Inicialização do Workspace

**Files:**
- Create: `service/src/workspace/initializer.ts`
- Create: `service/src/routes/workspace.ts`
- Create: `service/tests/workspace.test.ts`
- Modify: `service/src/server.ts`

- [x] **Step 1: Escrever testes**

`service/tests/workspace.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { initWorkspace, isWorkspaceInitialized } from '../src/workspace/initializer.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = join(tmpdir(), `oc-ws-test-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('initWorkspace', () => {
  it('creates AGENTS.md', async () => {
    await initWorkspace(tmpDir);
    const content = await readFile(join(tmpDir, 'AGENTS.md'), 'utf8');
    expect(content).toContain('AGENTS.md');
  });

  it('creates .opencode directory', async () => {
    await initWorkspace(tmpDir);
    const { stat } = await import('node:fs/promises');
    const info = await stat(join(tmpDir, '.opencode'));
    expect(info.isDirectory()).toBe(true);
  });

  it('creates .opencode/opencode.json with defaults', async () => {
    await initWorkspace(tmpDir);
    const raw = await readFile(join(tmpDir, '.opencode', 'opencode.json'), 'utf8');
    const config = JSON.parse(raw);
    expect(config.version).toBe('1');
    expect(config).toHaveProperty('provider');
    expect(config).toHaveProperty('agents');
    expect(config).toHaveProperty('skills');
    expect(config).toHaveProperty('plugins');
    expect(config).toHaveProperty('mcps');
  });

  it('is idempotent — does not overwrite existing AGENTS.md', async () => {
    await initWorkspace(tmpDir);
    const { writeFile } = await import('node:fs/promises');
    await writeFile(join(tmpDir, 'AGENTS.md'), 'custom content', 'utf8');
    await initWorkspace(tmpDir);
    const content = await readFile(join(tmpDir, 'AGENTS.md'), 'utf8');
    expect(content).toBe('custom content');
  });

  it('is idempotent — does not overwrite existing opencode.json', async () => {
    await initWorkspace(tmpDir);
    const { writeFile } = await import('node:fs/promises');
    const custom = JSON.stringify({ version: '1', custom: true });
    await writeFile(join(tmpDir, '.opencode', 'opencode.json'), custom, 'utf8');
    await initWorkspace(tmpDir);
    const raw = await readFile(join(tmpDir, '.opencode', 'opencode.json'), 'utf8');
    expect(JSON.parse(raw).custom).toBe(true);
  });
});

describe('isWorkspaceInitialized', () => {
  it('returns false for empty directory', async () => {
    expect(await isWorkspaceInitialized(tmpDir)).toBe(false);
  });

  it('returns true after initialization', async () => {
    await initWorkspace(tmpDir);
    expect(await isWorkspaceInitialized(tmpDir)).toBe(true);
  });
});
```

- [x] **Step 2: Executar para confirmar falha**

```bash
cd service && npx vitest run tests/workspace.test.ts
```

Expected: FAIL — "Cannot find module '../src/workspace/initializer.js'"

- [x] **Step 3: Implementar `service/src/workspace/initializer.ts`**

```typescript
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const DEFAULT_AGENTS_MD = `# AGENTS.md

Este arquivo define o comportamento dos agentes para este projeto.

Edite para personalizar como os agentes interagem com seu workspace.

## Regras

## Convenções de Código

## Arquitetura

## Restrições
`;

const DEFAULT_OPENCODE_JSON = {
  version: '1',
  provider: { name: null, model: null },
  agents: {},
  skills: {},
  plugins: [],
  mcps: [],
};

export async function initWorkspace(workspacePath: string): Promise<void> {
  const agentsMdPath = join(workspacePath, 'AGENTS.md');
  const opencodeDirPath = join(workspacePath, '.opencode');
  const opencodeJsonPath = join(opencodeDirPath, 'opencode.json');

  await mkdir(opencodeDirPath, { recursive: true });

  if (!existsSync(agentsMdPath)) {
    await writeFile(agentsMdPath, DEFAULT_AGENTS_MD, 'utf8');
  }

  if (!existsSync(opencodeJsonPath)) {
    await writeFile(opencodeJsonPath, JSON.stringify(DEFAULT_OPENCODE_JSON, null, 2) + '\n', 'utf8');
  }
}

export async function isWorkspaceInitialized(workspacePath: string): Promise<boolean> {
  return existsSync(join(workspacePath, '.opencode', 'opencode.json'));
}

export async function readOpencodeConfig(workspacePath: string): Promise<Record<string, unknown>> {
  const configPath = join(workspacePath, '.opencode', 'opencode.json');
  const raw = await readFile(configPath, 'utf8');
  return JSON.parse(raw) as Record<string, unknown>;
}
```

- [x] **Step 4: Implementar `service/src/routes/workspace.ts`**

```typescript
import { Router } from 'express';
import { initWorkspace, isWorkspaceInitialized, readOpencodeConfig } from '../workspace/initializer.js';

export const workspaceRouter = Router();

workspaceRouter.post('/init', async (req, res) => {
  const { path } = req.body as { path?: string };
  if (!path) {
    res.status(400).json({ error: 'path required', code: 'MISSING_PARAM' });
    return;
  }
  try {
    await initWorkspace(path);
    const config = await readOpencodeConfig(path);
    res.json({ initialized: true, path, config });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message, code: 'INIT_ERROR' });
  }
});

workspaceRouter.get('/status', async (req, res) => {
  const path = req.query.path as string;
  if (!path) {
    res.status(400).json({ error: 'path query param required', code: 'MISSING_PARAM' });
    return;
  }
  try {
    const initialized = await isWorkspaceInitialized(path);
    const config = initialized ? await readOpencodeConfig(path) : null;
    res.json({ initialized, config });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message, code: 'STATUS_ERROR' });
  }
});
```

- [x] **Step 5: Montar rota em `service/src/server.ts`**

```typescript
import { workspaceRouter } from './routes/workspace.js';
// ...
app.use('/workspace', workspaceRouter);
```

- [x] **Step 6: Executar todos os testes**

```bash
cd service && npx vitest run
```

Expected: PASS — todos os testes (auth, fs, terminal, workspace)

- [x] **Step 7: Commit**

```bash
git add service/src/workspace/ service/src/routes/workspace.ts service/tests/workspace.test.ts service/src/server.ts
git commit -m "feat(service): add workspace initialization with AGENTS.md and opencode.json"
```

---

## Task 11: Build de Produção + README de Instalação

**Files:**
- Modify: `service/package.json`
- Create: `service/README.md`

- [x] **Step 1: Verificar build de produção**

```bash
cd service && npm run build
```

Expected: Arquivo `dist/server.js` gerado sem erros de compilação.

- [x] **Step 2: Verificar que o build executa**

```bash
node service/dist/server.js
```

Expected: Startup message com token. Ctrl+C.

- [x] **Step 3: Criar `service/README.md`**

```markdown
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
```

- [x] **Step 4: Executar suite completa de testes uma última vez**

```bash
cd service && npx vitest run
```

Expected: PASS — todos os testes.

- [x] **Step 5: Commit final da Fase 1**

```bash
git add service/README.md
git commit -m "docs(service): add README with installation and endpoint documentation"
```

---

## Verificação Final da Fase 1

Ao concluir todas as tasks, verificar:

- [x] `npx vitest run` no diretório `service/` passa com 100% de testes
- [x] `npx tsc --noEmit` sem erros de tipo
- [x] `npm run build` gera `dist/server.js` sem erros
- [x] Servidor iniciado manualmente responde ao endpoint `/health`
- [x] Rotas `/fs/list`, `/fs/read`, `/fs/write` respondem corretamente com token válido
- [x] Rota `/workspace/init` cria `AGENTS.md` e `.opencode/opencode.json` na pasta especificada

---

## Próximo Passo

Fase 2 — SPA Core + Workspace: React app que conecta ao serviço desta fase, permite seleção de workspace e exibe o status de inicialização.

Ver [Roadmap](2026-05-10-opencode-web-lite-roadmap.md) para a visão completa.
