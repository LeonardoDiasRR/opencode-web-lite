import { render, screen } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { WorkspacePanel } from '../components/WorkspacePanel.js';
import { useWorkspaceStore } from '../store/workspaceStore.js';

describe('WorkspacePanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://127.0.0.1:7847', token: '', serviceVersion: null, status: 'idle', error: null });
      useWorkspaceStore.setState({ path: '', status: 'idle', config: null, error: null });
    });
  });

  it('keeps workspace input disabled before connection', () => {
    render(<WorkspacePanel />);

    expect(screen.getByLabelText('Caminho do workspace')).toBeDisabled();
  });

  it('checks workspace status', async () => {
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://localhost:7847', token: 'secret', serviceVersion: '0.1.0', status: 'connected' });
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ initialized: false, config: null })));
    render(<WorkspacePanel />);

    await userEvent.type(screen.getByLabelText('Caminho do workspace'), 'C:\\project');
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }));

    expect(await screen.findByText('Workspace ainda não inicializado.')).toBeInTheDocument();
  });

  it('initializes workspace', async () => {
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://localhost:7847', token: 'secret', serviceVersion: '0.1.0', status: 'connected' });
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ initialized: true, path: 'C:\\project', config: { version: '1' } }))
    );
    render(<WorkspacePanel />);

    await userEvent.type(screen.getByLabelText('Caminho do workspace'), 'C:\\project');
    await userEvent.click(screen.getByRole('button', { name: 'Inicializar' }));

    expect(await screen.findByText('Workspace pronto.')).toBeInTheDocument();
    expect(screen.getByText('Configuração v1 carregada.')).toBeInTheDocument();
  });
});
