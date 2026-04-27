import type { Habit } from '@/types/habit';
import { HabitCard } from './HabitCard';

type Props = {
  habits: Habit[];
  today: string;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onRequestDelete: (habit: Habit) => void;
};

export function HabitList({
  habits,
  today,
  onToggle,
  onEdit,
  onRequestDelete,
}: Props) {
  if (habits.length === 0) {
    return (
      <div data-testid="empty-state" className="neo-card text-center mt-6">
        <p className="text-lg font-black mb-1">No habits yet</p>
        <p className="text-ink-muted text-sm">
          Tap &ldquo;New habit&rdquo; to start a streak.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-5 mt-6 md:grid-cols-2">
      {habits.map((habit) => (
        <li key={habit.id}>
          <HabitCard
            habit={habit}
            today={today}
            onToggle={onToggle}
            onEdit={onEdit}
            onRequestDelete={onRequestDelete}
          />
        </li>
      ))}
    </ul>
  );
}
