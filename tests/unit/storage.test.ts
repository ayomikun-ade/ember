import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearSession,
  getHabits,
  getSession,
  getUsers,
  saveHabits,
  saveSession,
  saveUsers,
} from '@/lib/storage';
import type { Habit } from '@/types/habit';
import type { User } from '@/types/auth';

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns an empty users array when none are stored', () => {
    expect(getUsers()).toEqual([]);
  });

  it('persists and reads users', () => {
    const user: User = {
      id: '1',
      email: 'a@b.c',
      password: 'pw',
      createdAt: '2025-04-27T00:00:00.000Z',
    };
    saveUsers([user]);
    expect(getUsers()).toEqual([user]);
  });

  it('returns null when no session is set and persists/clears one', () => {
    expect(getSession()).toBe(null);
    saveSession({ userId: '1', email: 'a@b.c' });
    expect(getSession()).toEqual({ userId: '1', email: 'a@b.c' });
    clearSession();
    expect(getSession()).toBe(null);
  });

  it('persists and reads habits', () => {
    const habit: Habit = {
      id: '1',
      userId: '1',
      name: 'Read',
      description: '',
      frequency: 'daily',
      createdAt: '2025-04-27T00:00:00.000Z',
      completions: [],
    };
    expect(getHabits()).toEqual([]);
    saveHabits([habit]);
    expect(getHabits()).toEqual([habit]);
  });

  it('returns the fallback when stored JSON is corrupted', () => {
    window.localStorage.setItem('habit-tracker-users', 'not-json{');
    expect(getUsers()).toEqual([]);
  });
});
