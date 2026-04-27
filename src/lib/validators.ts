export function validateHabitName(name: string): {
  valid: boolean;
  value: string;
  error: string | null;
} {
  const value = name.trim();

  if (value.length === 0) {
    return { valid: false, value, error: 'Habit name is required' };
  }

  if (value.length > 60) {
    return {
      valid: false,
      value,
      error: 'Habit name must be 60 characters or fewer',
    };
  }

  return { valid: true, value, error: null };
}
