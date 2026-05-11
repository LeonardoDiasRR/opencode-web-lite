import { Router } from 'express';
import {
  listDirectory,
  readFile,
  writeFile,
  deleteFile,
  moveFile,
  copyFile,
} from '../fs/operations.js';
import { createWatcher } from '../fs/watcher.js';

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
