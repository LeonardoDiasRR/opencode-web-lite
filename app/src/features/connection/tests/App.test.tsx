import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../../../App.js';
import { useConnectionStore } from '../store/connectionStore.js';

describe('App', () => {
  afterEach(() => {
    useConnectionStore.setState({ baseUrl: 'http://127.0.0.1:7847', token: '', serviceVersion: null, status: 'idle', error: null });
  });

  it('renders disconnected onboarding', () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'IDE local para agentes.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Conectar ao serviço local' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Checklist inicial' })).toBeInTheDocument();
  });

  it('renders complete shell when connected', () => {
    useConnectionStore.setState({ baseUrl: 'http://127.0.0.1:7847', token: 't', serviceVersion: '1', status: 'connected', error: null });

    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Navegação e workspace')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Selecionar workspace' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Configurar provedor LLM' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Plugins' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'MCPs' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Compaction' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Chat com agentes primários' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gerenciar sessões' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Terminal' })).toBeInTheDocument();
  });
});
