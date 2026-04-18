import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import { requestOtp } from '../../api/auth.api';

vi.mock('../../api/auth.api', () => ({
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders cedula step and does not show OTP field initially', () => {
    renderLogin();

    expect(screen.getByText('Autenticación Remota')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingrese su número de identificación')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CONTINUAR/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('000000')).not.toBeInTheDocument();
  });

  it('accepts cedula input when the user types', async () => {
    const user = userEvent.setup();
    renderLogin();

    const cedulaInput = screen.getByPlaceholderText('Ingrese su número de identificación');
    await user.type(cedulaInput, '1234567890');

    expect(cedulaInput).toHaveValue('1234567890');
  });

  it('shows OTP input after requesting OTP and limits it to 6 digits', async () => {
    const user = userEvent.setup();
    vi.mocked(requestOtp).mockResolvedValue(undefined);

    renderLogin();

    await user.type(screen.getByPlaceholderText('Ingrese su número de identificación'), '1234567890');
    await user.click(screen.getByRole('button', { name: /CONTINUAR/i }));

    await waitFor(() => {
      expect(requestOtp).toHaveBeenCalledWith('1234567890');
    });

    const otpInput = await screen.findByPlaceholderText('000000');
    expect(screen.getByText(/DOBLE FACTOR DE AUTENTICACIÓN/i)).toBeInTheDocument();

    await user.type(otpInput, '1234567');
    expect(otpInput).toHaveValue('123456');
  });
});

