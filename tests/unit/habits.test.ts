import { describe, it, expect } from 'vitest';
import { toggleHabitCompletion } from '@/lib/habits';
import type { Habit } from '@/types/habit';

function makeHabit(completions: string[] = []): Habit {
  return {
    id: 'h1',
    userId: 'u1',
    name: 'Drink Water',
    description: '',
    frequency: 'daily',
    createdAt: '2025-04-27T08:00:00.000Z',
    completions,
  };
}

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    const habit = makeHabit([]);
    const result = toggleHabitCompletion(habit, '2025-04-27');
    expect(result.completions).toContain('2025-04-27');
  });

  it('removes a completion date when the date already exists', () => {
    const habit = makeHabit(['2025-04-26', '2025-04-27']);
    const result = toggleHabitCompletion(habit, '2025-04-27');
    expect(result.completions).not.toContain('2025-04-27');
    expect(result.completions).toContain('2025-04-26');
  });

  it('does not mutate the original habit object', () => {
    const habit = makeHabit(['2025-04-26']);
    const snapshot = JSON.parse(JSON.stringify(habit));
    toggleHabitCompletion(habit, '2025-04-27');
    expect(habit).toEqual(snapshot);
  });

  it('does not return duplicate completion dates', () => {
    const habit = makeHabit(['2025-04-27', '2025-04-27']);
    const result = toggleHabitCompletion(habit, '2025-04-26');
    const unique = new Set(result.completions);
    expect(unique.size).toBe(result.completions.length);
  });
});
