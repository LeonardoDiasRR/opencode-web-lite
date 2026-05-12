import { Router } from 'express';
import { execCommand } from '../terminal/executor.js';
import { createPtySession, destroyPtySession } from '../terminal/pty.js';

export const terminalRouter = Router();

terminalRouter.post('/exec', async (req, res) => {
  const { command, args, cwd, timeoutMs } = req.body as {
    command?: string;
    args?: string[];
    cwd?: string;
    timeoutMs?: number;
  };

  if (!command || !cwd || (args !== undefined && !Array.isArray(args)) || (timeoutMs !== undefined && typeof timeoutMs !== 'number')) {
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
