import type { Habit } from '@/types/habit';

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
