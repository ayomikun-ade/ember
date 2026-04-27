import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="neo-card w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-2">
          Ember
        </p>
        <h1 className="text-2xl font-black mb-1">Build the streak</h1>
        <p className="text-ink-muted text-sm mb-6">
          Create an account to start tracking habits.
        </p>

        <SignupForm />

        <p className="mt-6 text-sm text-ink-muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold text-accent underline underline-offset-4"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
