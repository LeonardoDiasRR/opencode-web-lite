import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { useConnectionStore } from '../../connection/store/connectionStore.js';
import { CompactionPanel } from '../components/CompactionPanel.js';

describe('CompactionPanel', () => {
  afterEach(() => { act(() => { useConnectionStore.setState({ baseUrl: 'http://127.0.0.1:7847', token: '', serviceVersion: null, status: 'idle', error: null }); }); });
  it('renders context status', () => { render(<CompactionPanel />); expect(screen.getByRole('heading', { name: 'Compaction' })).toBeInTheDocument(); expect(screen.getByText(/Mensagens atuais/)).toBeInTheDocument(); });
});
