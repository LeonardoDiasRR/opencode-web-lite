import { render, screen } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { useWorkspaceStore } from '../../workspace/store/workspaceStore.js';
import { SkillPanel } from '../components/SkillPanel.js';
import { useSkillStore } from '../store/skillStore.js';

describe('SkillPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://127.0.0.1:7847', token: '', serviceVersion: null, status: 'idle', error: null });
      useWorkspaceStore.setState({ path: '', status: 'idle', config: null, error: null });
      useSkillStore.setState({ skills: [], status: 'idle', error: null, approvedSkills: [] });
    });
  });

  it('is disabled until workspace is ready', () => {
    render(<SkillPanel />);

    expect(screen.getByRole('button', { name: 'Descobrir skills' })).toBeDisabled();
  });

  it('renders discovered skills and updates permission', async () => {
    act(() => {
      useConnectionStore.setState({ baseUrl: 'http://localhost:7847', token: 'secret', serviceVersion: '0.1.0', status: 'connected' });
      useWorkspaceStore.setState({ path: '/project', status: 'ready', config: { version: '1' }, error: null });
      useSkillStore.setState({ skills: [{ name: 'docs', origin: 'opencode', directoryPath: '', filePath: '', metadata: { name: 'docs', description: 'Docs' }, content: 'Read', loadState: 'loaded' }] });
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true })));
    render(<SkillPanel />);

    expect(screen.getByText('docs')).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByDisplayValue('ask'), 'allow');

    expect(useWorkspaceStore.getState().config).toEqual({ version: '1', skills: { docs: 'allow' } });
  });
});
