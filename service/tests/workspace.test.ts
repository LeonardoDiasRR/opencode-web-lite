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
