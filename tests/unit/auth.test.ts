import { describe, it, expect, beforeEach } from 'vitest';
import { loginUser, logoutUser, signupUser } from '@/lib/auth';
import { getSession, getUsers } from '@/lib/storage';

describe('auth', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('signupUser creates a user and an active session', () => {
    const result = signupUser('a@b.c', 'password');
    expect(result.ok).toBe(true);
    expect(getUsers()).toHaveLength(1);
    expect(getSession()?.email).toBe('a@b.c');
  });

  it('signupUser rejects a duplicate email with the spec error', () => {
    signupUser('a@b.c', 'password');
    const result = signupUser('A@B.C', 'other');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('User already exists');
  });

  it('loginUser succeeds with matching credentials', () => {
    signupUser('a@b.c', 'password');
    logoutUser();
    const result = loginUser('a@b.c', 'password');
    expect(result.ok).toBe(true);
    expect(getSession()?.email).toBe('a@b.c');
  });

  it('loginUser fails with bad credentials and the spec error', () => {
    signupUser('a@b.c', 'password');
    const result = loginUser('a@b.c', 'wrong');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Invalid email or password');
  });

  it('logoutUser clears the active session', () => {
    signupUser('a@b.c', 'password');
    logoutUser();
    expect(getSession()).toBe(null);
  });
});
