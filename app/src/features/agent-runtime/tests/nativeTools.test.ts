import { describe, expect, it, vi } from 'vitest';
import { executeNativeTool } from '../services/nativeTools.js';

describe('executeNativeTool', () => {
  it('rejects filesystem paths outside the selected workspace', async () => {
    const result = await executeNativeTool({
      id: '1',
      name: 'fs.read',
      arguments: { path: 'C:/outside/file.txt' },
      connection: { baseUrl: 'http://service', token: 'token' },
      workspacePath: 'C:/workspace',
    });
    expect(result.status).toBe('failed');
    expect(result.error).toMatch(/fora do workspace/i);
  });

  it('executes allowed filesystem reads through the service client', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ path: 'C:/workspace/a.txt', content: 'ok' }), { status: 200 }));
    const result = await executeNativeTool({
      id: '1',
      name: 'fs.read',
      arguments: { path: 'C:/workspace/a.txt' },
      connection: { baseUrl: 'http://service', token: 'token' },
      workspacePath: 'C:/workspace',
    });
    expect(result.status).toBe('succeeded');
    expect(result.preview).toContain('ok');
  });
});
