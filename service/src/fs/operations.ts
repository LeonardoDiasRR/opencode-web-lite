import { readdir, stat, readFile as nodeReadFile, mkdir, rm, rename, copyFile as nodeCopyFile, writeFile as nodeWriteFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';

export interface DirEntry {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size: number;
  modified: Date;
}

export interface FileContent {
  content: string;
  size: number;
}

export async function listDirectory(dirPath: string): Promise<DirEntry[]> {
  const names = await readdir(dirPath);
  const entries = await Promise.all(
    names.map(async (name) => {
      const fullPath = join(dirPath, name);
      const info = await stat(fullPath);
      return {
        name,
        path: fullPath,
        type: info.isDirectory() ? 'directory' : info.isSymbolicLink() ? 'symlink' : 'file',
        size: info.size,
        modified: info.mtime,
      } satisfies DirEntry;
    })
  );
  return entries;
}

export async function readFile(filePath: string): Promise<FileContent> {
  const content = await nodeReadFile(filePath, 'utf8');
  const info = await stat(filePath);
  return { content, size: info.size };
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await nodeWriteFile(filePath, content, 'utf8');
}

export async function deleteFile(targetPath: string): Promise<void> {
  await rm(targetPath, { recursive: true, force: true });
}

export async function moveFile(from: string, to: string): Promise<void> {
  await mkdir(dirname(to), { recursive: true });
  await rename(from, to);
}

export async function copyFile(from: string, to: string): Promise<void> {
  await mkdir(dirname(to), { recursive: true });
  await nodeCopyFile(from, to);
}
