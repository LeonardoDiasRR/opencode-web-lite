import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ApprovalPanel } from '../components/ApprovalPanel.js';
import { useApprovalStore } from '../store/approvalStore.js';

describe('ApprovalPanel', () => {
  beforeEach(() => useApprovalStore.getState().clear());

  it('renders and denies pending tool calls', async () => {
    useApprovalStore.getState().addPending({ id: '1', name: 'terminal.exec', arguments: { command: 'npm test' }, permission: 'ask', status: 'pending' });
    render(<ApprovalPanel />);
    expect(screen.getByText('terminal.exec')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Negar' }));
    expect(screen.getByText('denied')).toBeInTheDocument();
  });

  it('approves pending tool calls', async () => {
    useApprovalStore.getState().addPending({ id: '2', name: 'fs.write', arguments: { path: 'C:/workspace/a.txt' }, permission: 'ask', status: 'pending' });
    render(<ApprovalPanel />);
    await userEvent.click(screen.getByRole('button', { name: 'Aprovar' }));
    expect(screen.getByText('approved')).toBeInTheDocument();
  });
});
