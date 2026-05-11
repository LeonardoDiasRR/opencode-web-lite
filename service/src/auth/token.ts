import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateToken(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function loadOrCreateToken(tokenFile: string): Promise<string> {
  if (existsSync(tokenFile)) {
    const content = await readFile(tokenFile, 'utf8');
    return content.trim();
  }
  const token = generateToken();
  await writeFile(tokenFile, token + '\n', { encoding: 'utf8', mode: 0o600 });
  return token;
}
