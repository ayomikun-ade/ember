import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="neo-card w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-2">
          Ember
        </p>
        <h1 className="text-2xl font-black mb-1">Welcome back</h1>
        <p className="text-ink-muted text-sm mb-6">
          Log in to keep your streak alive.
        </p>

        <LoginForm />

        <p className="mt-6 text-sm text-ink-muted">
          New here?{' '}
          <Link
            href="/signup"
            className="font-bold text-accent underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
