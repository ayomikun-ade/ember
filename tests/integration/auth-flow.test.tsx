import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { logoutUser, signupUser } from '@/lib/auth';
import { getSession } from '@/lib/storage';

const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
}));

describe('auth flow', () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
    window.localStorage.clear();
  });

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'a@b.c');
    await user.type(screen.getByTestId('auth-signup-password'), 'password');
    await user.click(screen.getByTestId('auth-signup-submit'));

    expect(getSession()?.email).toBe('a@b.c');
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for duplicate signup email', async () => {
    signupUser('a@b.c', 'password');
    logoutUser();

    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'a@b.c');
    await user.type(screen.getByTestId('auth-signup-password'), 'other');
    await user.click(screen.getByTestId('auth-signup-submit'));

    expect(screen.getByRole('alert').textContent).toBe('User already exists');
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('submits the login form and stores the active session', async () => {
    signupUser('a@b.c', 'password');
    logoutUser();

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'a@b.c');
    await user.type(screen.getByTestId('auth-login-password'), 'password');
    await user.click(screen.getByTestId('auth-login-submit'));

    expect(getSession()?.email).toBe('a@b.c');
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error for invalid login credentials', async () => {
    signupUser('a@b.c', 'password');
    logoutUser();

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'a@b.c');
    await user.type(screen.getByTestId('auth-login-password'), 'wrong');
    await user.click(screen.getByTestId('auth-login-submit'));

    expect(screen.getByRole('alert').textContent).toBe(
      'Invalid email or password',
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
