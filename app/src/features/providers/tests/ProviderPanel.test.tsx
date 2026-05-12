import { render, screen } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { ProviderPanel } from '../components/ProviderPanel.js';
import { useProviderStore } from '../store/providerStore.js';

describe('ProviderPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://127.0.0.1:7847', token: '', serviceVersion: null, status: 'idle', error: null });
      useWorkspaceStore.setState({ path: '', status: 'idle', config: null, error: null });
      useProviderStore.setState({
        providerId: 'openrouter',
        apiKey: '',
        baseUrl: 'https://openrouter.ai/api/v1',
        selectedModel: '',
        models: [],
        status: 'idle',
        error: null,
      });
    });
  });

  it('is blocked until workspace is ready', () => {
    render(<ProviderPanel />);

    expect(screen.getByText('Conecte ao serviço e inicialize um workspace para configurar provedores.')).toBeInTheDocument();
    expect(screen.getByLabelText('Provedor')).toBeDisabled();
  });

  it('loads models and saves provider config', async () => {
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://localhost:7847', token: 'secret', serviceVersion: '0.1.0', status: 'connected' });
      useWorkspaceStore.setState({ path: 'C:\\project', status: 'ready', config: { version: '1', agents: {} }, error: null });
    });
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ id: 'openai/gpt-4o-mini', name: 'GPT 4o mini' }] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));

    render(<ProviderPanel />);
    await userEvent.type(screen.getByLabelText('API key'), 'key');
    await userEvent.click(screen.getByRole('button', { name: 'Listar modelos' }));
    await screen.findByRole('option', { name: 'GPT 4o mini' });
    await userEvent.click(screen.getByRole('button', { name: 'Salvar provider' }));

    expect(await screen.findByText('Provider salvo no workspace.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith('http://localhost:7847/fs/write', expect.any(Object));
  });
});
