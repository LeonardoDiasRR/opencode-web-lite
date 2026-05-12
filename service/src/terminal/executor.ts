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

const MAX_TIMEOUT_MS = 120_000;
const MAX_OUTPUT_BYTES = 1_000_000;

function clampTimeout(timeoutMs: number | undefined): number {
  if (timeoutMs === undefined) return 30_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('timeoutMs must be a positive number');
  return Math.min(timeoutMs, MAX_TIMEOUT_MS);
}

function appendLimited(current: string, chunk: Buffer): string {
  const next = current + chunk.toString();
  return next.length > MAX_OUTPUT_BYTES ? next.slice(0, MAX_OUTPUT_BYTES) : next;
}

export function execCommand(options: ExecOptions): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    const { command, args = [], cwd, env } = options;
    const timeoutMs = clampTimeout(options.timeoutMs);
    const start = Date.now();

    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      shell: false,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => { stdout = appendLimited(stdout, chunk); });
    child.stderr.on('data', (chunk: Buffer) => { stderr = appendLimited(stderr, chunk); });

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
