import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App', () => {
  it('renders the landing page on the root route', () => {
    render(<App />);

    expect(screen.getByText('Sello Legítimo')).toBeInTheDocument();
    expect(screen.getByText(/Garantizando la/i)).toBeInTheDocument();
  });

  it('navigates to the login page from the navbar button', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Ingresar al Sistema' }));

    expect(screen.getByText('Autenticación Remota')).toBeInTheDocument();
    expect(screen.getByText(/NÚMERO DE CÉDULA/i)).toBeInTheDocument();
  });
});
