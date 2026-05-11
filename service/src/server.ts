import express from 'express';
import cors from 'cors';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createServer } from 'node:http';
import type { IncomingMessage } from 'node:http';
import { WebSocketServer } from 'ws';
import { loadOrCreateToken, validateToken } from './auth/token.js';
import { authMiddleware } from './auth/middleware.js';
import { healthRouter } from './routes/health.js';
import { fsRouter } from './routes/fs.js';
import { terminalRouter } from './routes/terminal.js';
import { workspaceRouter } from './routes/workspace.js';
import { getPtySession } from './terminal/pty.js';

const PORT = parseInt(process.env.OPENCODE_PORT ?? '7847', 10);
const TOKEN_FILE = join(homedir(), '.opencode-service.token');

async function start() {
  const token = await loadOrCreateToken(TOKEN_FILE);

  const app = express();
  app.use(cors({ origin: /^https?:\/\/localhost(:\d+)?$/ }));
  app.use(express.json({ limit: '10mb' }));

  app.use('/health', healthRouter);
  app.use(authMiddleware(() => token));
  app.use('/fs', fsRouter);
  app.use('/terminal', terminalRouter);
  app.use('/workspace', workspaceRouter);

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/terminal/ws' });

  wss.on('connection', (ws, req: IncomingMessage) => {
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

  httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(`\nOpenCode Service running on http://127.0.0.1:${PORT}`);
    console.log(`\nAccess token: ${token}\n`);
    console.log(`Enter this token in the OpenCode Web app to connect.\n`);
  });

  return httpServer;
}

start().catch((err) => {
  console.error('Failed to start service:', err);
  process.exit(1);
});

export { validateToken };
