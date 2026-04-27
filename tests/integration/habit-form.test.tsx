import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/app/dashboard/page';
import { HabitForm } from '@/components/habits/HabitForm';
import type { Habit } from '@/types/habit';

const replaceMock = vi.fn();
const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
}));

const SESSION_KEY = 'habit-tracker-session';
const HABITS_KEY = 'habit-tracker-habits';
const USERS_KEY = 'habit-tracker-users';

const SESSION = { userId: 'u1', email: 'user@ember.test' };

function seedSession() {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(SESSION));
  window.localStorage.setItem(
    USERS_KEY,
    JSON.stringify([
      {
        id: 'u1',
        email: 'user@ember.test',
        password: 'pw',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ]),
  );
}

function seedHabit(overrides: Partial<Habit> = {}): Habit {
  const habit: Habit = {
    id: 'h1',
    userId: 'u1',
    name: 'Drink Water',
    description: 'Stay hydrated',
    frequency: 'daily',
    createdAt: '2025-01-01T00:00:00.000Z',
    completions: [],
    ...overrides,
  };
  window.localStorage.setItem(HABITS_KEY, JSON.stringify([habit]));
  return habit;
}

function getStoredHabits(): Habit[] {
  const raw = window.localStorage.getItem(HABITS_KEY);
  return raw ? (JSON.parse(raw) as Habit[]) : [];
}

describe('habit form', () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
    window.localStorage.clear();
  });

  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup();
    render(<HabitForm onCancel={() => {}} onSave={() => {}} />);

    await user.click(screen.getByTestId('habit-save-button'));

    expect(screen.getByRole('alert').textContent).toBe(
      'Habit name is required',
    );
  });

  it('creates a new habit and renders it in the list', async () => {
    seedSession();

    const user = userEvent.setup();
    render(<DashboardPage />);
    await screen.findByTestId('dashboard-page');
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();

    await user.click(screen.getByTestId('create-habit-button'));
    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water');
    await user.click(screen.getByTestId('habit-save-button'));

    expect(
      await screen.findByTestId('habit-card-drink-water'),
    ).toBeInTheDocument();

    const stored = getStoredHabits();
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Drink Water');
    expect(stored[0].userId).toBe('u1');
    expect(stored[0].frequency).toBe('daily');
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    seedSession();
    seedHabit({
      id: 'h1',
      createdAt: '2025-01-01T00:00:00.000Z',
      completions: ['2025-04-26'],
    });

    const user = userEvent.setup();
    render(<DashboardPage />);
    await screen.findByTestId('dashboard-page');

    await user.click(screen.getByTestId('habit-edit-drink-water'));

    const nameInput = screen.getByTestId(
      'habit-name-input',
    ) as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'Hydrate Often');
    await user.click(screen.getByTestId('habit-save-button'));

    const stored = getStoredHabits();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('h1');
    expect(stored[0].userId).toBe('u1');
    expect(stored[0].createdAt).toBe('2025-01-01T00:00:00.000Z');
    expect(stored[0].completions).toEqual(['2025-04-26']);
    expect(stored[0].name).toBe('Hydrate Often');
    expect(stored[0].frequency).toBe('daily');
  });

  it('deletes a habit only after explicit confirmation', async () => {
    seedSession();
    seedHabit();

    const user = userEvent.setup();
    render(<DashboardPage />);
    await screen.findByTestId('dashboard-page');

    await user.click(screen.getByTestId('habit-delete-drink-water'));

    expect(
      screen.getByTestId('habit-card-drink-water'),
    ).toBeInTheDocument();
    expect(getStoredHabits()).toHaveLength(1);

    await user.click(screen.getByTestId('confirm-delete-button'));

    expect(
      screen.queryByTestId('habit-card-drink-water'),
    ).not.toBeInTheDocument();
    expect(getStoredHabits()).toHaveLength(0);
  });

  it('toggles completion and updates the streak display', async () => {
    seedSession();
    seedHabit();

    const user = userEvent.setup();
    render(<DashboardPage />);
    await screen.findByTestId('dashboard-page');

    expect(screen.getByTestId('habit-streak-drink-water').textContent).toContain(
      '0',
    );

    await user.click(screen.getByTestId('habit-complete-drink-water'));

    expect(screen.getByTestId('habit-streak-drink-water').textContent).toContain(
      '1',
    );
  });
});
