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
