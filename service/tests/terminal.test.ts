import { describe, it, expect } from 'vitest';
import { execCommand } from '../src/terminal/executor.js';
import { tmpdir } from 'node:os';

describe('execCommand', () => {
  it('executes simple command and returns output', async () => {
    const result = await execCommand({ command: 'node', args: ['-e', 'process.stdout.write("hello")'], cwd: tmpdir() });
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

  it('rejects invalid timeout values', async () => {
    await expect(execCommand({ command: 'node', args: ['-e', ''], cwd: tmpdir(), timeoutMs: -1 })).rejects.toThrow(/positive number/i);
  });
});
