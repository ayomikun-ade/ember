'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/auth';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const result = loginUser(email, password);
    if (result.ok) {
      router.push('/dashboard');
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor="login-email" className="neo-label">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          data-testid="auth-login-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="neo-input"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="neo-label">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          data-testid="auth-login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="neo-input"
        />
      </div>

      {error && (
        <p role="alert" className="text-danger font-bold">
          {error}
        </p>
      )}

      <button
        type="submit"
        data-testid="auth-login-submit"
        className="neo-btn"
      >
        Log in
      </button>
    </form>
  );
}
