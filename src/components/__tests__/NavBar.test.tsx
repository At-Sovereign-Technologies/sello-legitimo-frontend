import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavBar from '../NavBar';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('NavBar', () => {
  it('renders the brand and navigation links', () => {
    render(<NavBar />);

    expect(screen.getByText('Sello Legítimo')).toBeInTheDocument();
    expect(screen.getByText('SISTEMA ELECTORAL COLOMBIANO')).toBeInTheDocument();
    expect(screen.getByText('Consulta Ciudadana')).toBeInTheDocument();
    expect(screen.getByText('Resultados Electorales')).toBeInTheDocument();
    expect(screen.getByText('Elecciones Activas')).toBeInTheDocument();
    expect(screen.getByText('Transparencia Electoral')).toBeInTheDocument();
  });

  it('navigates to citizen query when clicking the first nav item', async () => {
    const user = userEvent.setup();
    render(<NavBar />);

    await user.click(screen.getByRole('button', { name: 'Consulta Ciudadana' }));

    expect(navigateMock).toHaveBeenCalledOnce();
    expect(navigateMock).toHaveBeenCalledWith('/consulta-ciudadano');
  });
});
