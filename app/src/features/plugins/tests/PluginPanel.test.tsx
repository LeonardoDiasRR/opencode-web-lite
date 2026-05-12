import { render, screen } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { PluginPanel } from '../components/PluginPanel.js';
import { usePluginStore } from '../store/pluginStore.js';

describe('PluginPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://127.0.0.1:7847', token: '', serviceVersion: null, status: 'idle', error: null });
      useWorkspaceStore.setState({ path: '', status: 'idle', config: null, error: null });
      usePluginStore.setState({ plugins: [], tools: [], status: 'idle', error: null });
    });
  });

  it('is disabled until workspace is ready', () => {
    render(<PluginPanel />);

    expect(screen.getByRole('button', { name: 'Descobrir plugins' })).toBeDisabled();
  });

  it('renders and enables plugins', async () => {
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://localhost:7847', token: 'secret', serviceVersion: '0.1.0', status: 'connected' });
      useWorkspaceStore.setState({ path: '/project', status: 'ready', config: { version: '1' }, error: null });
      usePluginStore.setState({ plugins: [{ name: 'audit', enabled: false, directoryPath: '', manifestPath: '', mainPath: '', manifest: { name: 'audit', description: 'Audit', version: '1.0.0', main: 'index.js', hooks: ['message:after'], tools: [{ name: 'scan', description: 'Scan' }], permissions: ['fs'] } }], tools: [] });
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true })));
    render(<PluginPanel />);

    expect(screen.getByText('audit')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Habilitar plugin'));

    expect(useWorkspaceStore.getState().config).toMatchObject({ plugins: [{ name: 'audit', enabled: true }] });
  });
});
