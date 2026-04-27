import { describe, it, expect } from 'vitest';
import { validateHabitName } from '@/lib/validators';

describe('validateHabitName', () => {
  it('returns an error when habit name is empty', () => {
    const blank = validateHabitName('');
    expect(blank.valid).toBe(false);
    expect(blank.error).toBe('Habit name is required');

    const whitespace = validateHabitName('   ');
    expect(whitespace.valid).toBe(false);
    expect(whitespace.error).toBe('Habit name is required');
  });

  it('returns an error when habit name exceeds 60 characters', () => {
    const tooLong = 'a'.repeat(61);
    const result = validateHabitName(tooLong);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Habit name must be 60 characters or fewer');
  });

  it('returns a trimmed value when habit name is valid', () => {
    const result = validateHabitName('  Read Books  ');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('Read Books');
    expect(result.error).toBe(null);
  });
});
