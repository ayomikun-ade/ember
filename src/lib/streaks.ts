function subtractDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - days);
  return dt.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function calculateCurrentStreak(
  completions: string[],
  today?: string,
): number {
  const reference = today ?? todayISO();
  const unique = new Set(completions);

  if (!unique.has(reference)) return 0;

  let count = 0;
  let cursor = reference;
  while (unique.has(cursor)) {
    count += 1;
    cursor = subtractDays(cursor, 1);
  }

  return count;
}
