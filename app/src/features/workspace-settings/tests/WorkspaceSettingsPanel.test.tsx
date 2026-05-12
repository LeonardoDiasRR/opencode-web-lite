import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { WorkspaceSettingsPanel } from '../components/WorkspaceSettingsPanel.js';

describe('WorkspaceSettingsPanel', () => {
  it('validates config json', async () => {
    useWorkspaceStore.setState({ path: '/w', status: 'ready', config: { version: '1' }, error: null });
    render(<WorkspaceSettingsPanel />);

    await userEvent.click(screen.getByRole('button', { name: 'Validar JSON' }));

    expect(screen.getByText('Configuração JSON válida.')).toBeInTheDocument();
  });
});
