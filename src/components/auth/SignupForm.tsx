'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupUser } from '@/lib/auth';

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const result = signupUser(email, password);
    if (result.ok) {
      router.push('/dashboard');
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor="signup-email" className="neo-label">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          required
          autoComplete="email"
          data-testid="auth-signup-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="neo-input"
        />
      </div>

      <div>
        <label htmlFor="signup-password" className="neo-label">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          required
          autoComplete="new-password"
          data-testid="auth-signup-password"
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
        data-testid="auth-signup-submit"
        className="neo-btn"
      >
        Create account
      </button>
    </form>
  );
}
