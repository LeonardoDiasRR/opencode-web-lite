import express from 'express';
import cors from 'cors';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { loadOrCreateToken, validateToken } from './auth/token.js';
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

  // ROUTES_PLACEHOLDER — fs, terminal, workspace routers will be mounted here

  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`\nOpenCode Service running on http://127.0.0.1:${PORT}`);
    console.log(`\nAccess token: ${token}\n`);
    console.log(`Enter this token in the OpenCode Web app to connect.\n`);
  });

  return server;
}

start().catch((err) => {
  console.error('Failed to start service:', err);
  process.exit(1);
});

export { validateToken };
