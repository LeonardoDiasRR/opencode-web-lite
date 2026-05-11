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
