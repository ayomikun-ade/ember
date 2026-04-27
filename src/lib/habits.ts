import type { Habit } from '@/types/habit';

export type CreateHabitInput = {
  name: string;
  description: string;
  userId: string;
};

export function createHabit({
  name,
  description,
  userId,
}: CreateHabitInput): Habit {
  return {
    id: crypto.randomUUID(),
    userId,
    name,
    description,
    frequency: 'daily',
    createdAt: new Date().toISOString(),
    completions: [],
  };
}

export function toggleHabitCompletion(habit: Habit, date: string): Habit {
  const has = habit.completions.includes(date);
  const next = has
    ? habit.completions.filter((d) => d !== date)
    : [...habit.completions, date];

  return {
    ...habit,
    completions: Array.from(new Set(next)),
  };
}
