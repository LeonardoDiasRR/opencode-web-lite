import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../../../App.js';

describe('App', () => {
  it('renders phase two workflow', () => {
    render(
      <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Conecte ao serviço local e prepare seu workspace.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Conectar ao serviço local' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Selecionar workspace' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Configurar provedor LLM' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Plugins' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Chat com agentes primários' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gerenciar sessões' })).toBeInTheDocument();
  });
});
