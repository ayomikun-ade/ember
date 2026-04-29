import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Delete02Icon,
  Fire02Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { calculateCurrentStreak } from "@/lib/streaks";
import { getHabitSlug } from "@/lib/slug";
import type { Habit } from "@/types/habit";

type Props = {
  habit: Habit;
  today: string;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onRequestDelete: (habit: Habit) => void;
};

export function HabitCard({
  habit,
  today,
  onToggle,
  onEdit,
  onRequestDelete,
}: Props) {
  const slug = getHabitSlug(habit.name);
  const streak = calculateCurrentStreak(habit.completions, today);
  const completedToday = habit.completions.includes(today);

  return (
    <article
      data-testid={`habit-card-${slug}`}
      data-completed={completedToday ? "true" : "false"}
      className={`neo-card transition-colors ${
        completedToday ? "bg-accent-strong text-ink" : "bg-surface"
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-black tracking-tight wrap-break-word">
            {habit.name}
          </h3>
          {habit.description && (
            <p className="mt-1 text-sm text-ink-muted">{habit.description}</p>
          )}
        </div>
        <span
          data-testid={`habit-streak-${slug}`}
          className="neo-tag whitespace-nowrap"
          aria-label={`Current streak: ${streak} day${streak === 1 ? "" : "s"}`}
        >
          <HugeiconsIcon icon={Fire02Icon} size={14} />
          {streak}
        </span>
      </header>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          data-testid={`habit-complete-${slug}`}
          aria-pressed={completedToday}
          onClick={() => onToggle(habit.id)}
          className={`neo-btn ${completedToday ? "neo-btn-secondary" : ""}`}
        >
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
          {completedToday ? "Done today" : "Mark done"}
        </button>
        <button
          type="button"
          data-testid={`habit-edit-${slug}`}
          onClick={() => onEdit(habit)}
          className="neo-btn neo-btn-secondary"
          aria-label={`Edit ${habit.name}`}
        >
          <HugeiconsIcon icon={PencilEdit02Icon} size={18} />
        </button>
        <button
          type="button"
          data-testid={`habit-delete-${slug}`}
          data-action="confirm-delete-button"
          onClick={() => onRequestDelete(habit)}
          className="neo-btn neo-btn-danger"
          aria-label={`Delete ${habit.name}`}
        >
          <HugeiconsIcon icon={Delete02Icon} size={18} />
        </button>
      </div>
    </article>
  );
}
