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

describe('writeFile', () => {
  it('creates a new file', async () => {
    const path = join(tmpDir, 'new.txt');
    await (await import('../src/fs/operations.js')).writeFile(path, 'content here');
    const { content } = await fsReadFile(path);
    expect(content).toBe('content here');
  });

  it('overwrites existing file', async () => {
    const path = join(tmpDir, 'hello.txt');
    await (await import('../src/fs/operations.js')).writeFile(path, 'updated');
    const { content } = await fsReadFile(path);
    expect(content).toBe('updated');
  });

  it('creates intermediate directories', async () => {
    const path = join(tmpDir, 'nested', 'deep', 'file.txt');
    await (await import('../src/fs/operations.js')).writeFile(path, 'deep content');
    const { content } = await fsReadFile(path);
    expect(content).toBe('deep content');
  });
});

describe('deleteFile', () => {
  it('deletes an existing file', async () => {
    const path = join(tmpDir, 'hello.txt');
    await (await import('../src/fs/operations.js')).deleteFile(path);
    await expect(fsReadFile(path)).rejects.toThrow();
  });

  it('deletes a directory recursively', async () => {
    await (await import('../src/fs/operations.js')).deleteFile(join(tmpDir, 'subdir'));
    const entries = await listDirectory(tmpDir);
    expect(entries.find((e) => e.name === 'subdir')).toBeUndefined();
  });
});

describe('moveFile', () => {
  it('moves file to new location', async () => {
    const src = join(tmpDir, 'hello.txt');
    const dest = join(tmpDir, 'moved.txt');
    await (await import('../src/fs/operations.js')).moveFile(src, dest);
    const { content } = await fsReadFile(dest);
    expect(content).toBe('hello world');
    await expect(fsReadFile(src)).rejects.toThrow();
  });
});

describe('copyFile', () => {
  it('copies file to new location', async () => {
    const src = join(tmpDir, 'hello.txt');
    const dest = join(tmpDir, 'copy.txt');
    await (await import('../src/fs/operations.js')).copyFile(src, dest);
    const original = await fsReadFile(src);
    const copy = await fsReadFile(dest);
    expect(original.content).toBe(copy.content);
  });
});
