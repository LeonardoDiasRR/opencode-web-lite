import { render, screen } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { McpPanel } from '../components/McpPanel.js';
import { useMcpStore } from '../store/mcpStore.js';

describe('McpPanel', () => {
  afterEach(() => { vi.restoreAllMocks(); act(() => { useConnectionStore.setState({ baseUrl: 'http://127.0.0.1:7847', token: '', serviceVersion: null, status: 'idle', error: null }); useWorkspaceStore.setState({ path: '', status: 'idle', config: null, error: null }); useMcpStore.setState({ mcps: [], tools: [], status: 'idle', error: null }); }); });
  it('is disabled until workspace is ready', () => { render(<McpPanel />); expect(screen.getByRole('button', { name: 'Adicionar MCP' })).toBeDisabled(); });
  it('adds MCPs', async () => { act(() => { useConnectionStore.setState({ baseUrl: 'http://localhost:7847', token: 'secret', serviceVersion: '0.1.0', status: 'connected' }); useWorkspaceStore.setState({ path: '/project', status: 'ready', config: {}, error: null }); }); vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true }))); render(<McpPanel />); await userEvent.type(screen.getByPlaceholderText('nome'), 'github'); await userEvent.type(screen.getByPlaceholderText('comando'), 'node server.js'); await userEvent.click(screen.getByRole('button', { name: 'Adicionar MCP' })); expect(screen.getByText('github')).toBeInTheDocument(); });
});
