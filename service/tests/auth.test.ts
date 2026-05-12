import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateToken, validateToken, loadOrCreateToken } from '../src/auth/token.js';
import { rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import express from 'express';
import request from 'supertest';
import { authMiddleware } from '../src/auth/middleware.js';

describe('token', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = join(tmpdir(), `oc-token-test-${Date.now()}`);
    await mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('generates a 64-character hex token', () => {
    const token = generateToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it('generates unique tokens on each call', () => {
    expect(generateToken()).not.toBe(generateToken());
  });

  it('validates correct token', () => {
    const token = generateToken();
    expect(validateToken(token, token)).toBe(true);
  });

  it('rejects incorrect token', () => {
    const token = generateToken();
    expect(validateToken('wrong', token)).toBe(false);
  });

  it('rejects empty token', () => {
    const token = generateToken();
    expect(validateToken('', token)).toBe(false);
  });

  it('loadOrCreateToken creates token file if missing', async () => {
    const tokenFile = join(tmpDir, '.opencode-service.token');
    const token = await loadOrCreateToken(tokenFile);
    expect(token).toMatch(/^[a-f0-9]{64}$/);

    const { readFile } = await import('node:fs/promises');
    const stored = (await readFile(tokenFile, 'utf8')).trim();
    expect(stored).toBe(token);
  });

  it('loadOrCreateToken reads existing token file', async () => {
    const { writeFile } = await import('node:fs/promises');
    const tokenFile = join(tmpDir, '.opencode-service.token');
    const existing = generateToken();
    await writeFile(tokenFile, existing + '\n', 'utf8');

    const loaded = await loadOrCreateToken(tokenFile);
    expect(loaded).toBe(existing);
  });
});

describe('authMiddleware', () => {
  const testToken = generateToken();
  const app = express();
  app.use('/protected', authMiddleware(() => testToken), (_req, res) => {
    res.json({ ok: true });
  });

  it('allows request with valid Bearer token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${testToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('allows request with token query param for EventSource clients', async () => {
    const res = await request(app).get(`/protected?token=${testToken}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('rejects request without token', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('rejects request with wrong token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer wrongtoken');
    expect(res.status).toBe(401);
  });
});
