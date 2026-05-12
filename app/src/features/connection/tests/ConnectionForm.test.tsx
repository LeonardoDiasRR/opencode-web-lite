import { render, screen } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConnectionForm } from '../components/ConnectionForm.js';
import { useConnectionStore } from '../store/connectionStore.js';

describe('ConnectionForm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    act(() => {
      useConnectionStore.setState({
        baseUrl: 'http://127.0.0.1:7847',
        token: '',
        serviceVersion: null,
        status: 'idle',
        error: null,
      });
    });
  });

  it('connects to the service and shows the version', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ status: 'ok', version: '0.1.0' })));
    render(<ConnectionForm />);

    await userEvent.type(screen.getByLabelText('Token'), 'abc123');
    await userEvent.click(screen.getByRole('button', { name: 'Conectar' }));

    expect(await screen.findByText('Serviço conectado. Versão 0.1.0.')).toBeInTheDocument();
  });

  it('shows connection errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Failed to fetch'));
    render(<ConnectionForm />);

    await userEvent.click(screen.getByRole('button', { name: 'Conectar' }));

    expect(await screen.findByText('Failed to fetch')).toBeInTheDocument();
  });
});
