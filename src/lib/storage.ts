import type { Session, User } from '@/types/auth';
import type { Habit } from '@/types/habit';
import { HABITS_KEY, SESSION_KEY, USERS_KEY } from './constants';

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers(): User[] {
  return readJSON<User[]>(USERS_KEY, []);
}

export function saveUsers(users: User[]): void {
  writeJSON(USERS_KEY, users);
}

export function getSession(): Session | null {
  return readJSON<Session | null>(SESSION_KEY, null);
}

export function saveSession(session: Session): void {
  writeJSON(SESSION_KEY, session);
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function getHabits(): Habit[] {
  return readJSON<Habit[]>(HABITS_KEY, []);
}

export function saveHabits(habits: Habit[]): void {
  writeJSON(HABITS_KEY, habits);
}
