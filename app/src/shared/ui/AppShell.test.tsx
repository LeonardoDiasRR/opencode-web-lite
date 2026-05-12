import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from './AppShell.js';

describe('AppShell', () => {
  it('renders responsive shell regions', () => {
    render(<AppShell sidebar="side" main="main" inspector="inspect" terminal="term" />);

    expect(screen.getByLabelText('Navegação e workspace')).toHaveClass('lg:row-span-2');
    expect(screen.getByLabelText('Área principal')).toBeInTheDocument();
    expect(screen.getByLabelText('Terminal')).toHaveTextContent('term');
  });
});
