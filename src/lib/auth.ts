import type { User } from '@/types/auth';
import {
  clearSession,
  getUsers,
  saveSession,
  saveUsers,
} from './storage';

export type AuthResult = { ok: true } | { ok: false; error: string };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function signupUser(email: string, password: string): AuthResult {
  const normalized = normalizeEmail(email);

  if (!normalized) return { ok: false, error: 'Email is required' };
  if (!password) return { ok: false, error: 'Password is required' };

  const users = getUsers();

  if (users.some((u) => u.email === normalized)) {
    return { ok: false, error: 'User already exists' };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    email: normalized,
    password,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, newUser]);
  saveSession({ userId: newUser.id, email: newUser.email });
  return { ok: true };
}

export function loginUser(email: string, password: string): AuthResult {
  const normalized = normalizeEmail(email);

  if (!normalized || !password) {
    return { ok: false, error: 'Invalid email or password' };
  }

  const user = getUsers().find(
    (u) => u.email === normalized && u.password === password,
  );

  if (!user) {
    return { ok: false, error: 'Invalid email or password' };
  }

  saveSession({ userId: user.id, email: user.email });
  return { ok: true };
}

export function logoutUser(): void {
  clearSession();
}
