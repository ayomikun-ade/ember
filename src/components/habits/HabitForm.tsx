'use client';

import { useId, useState } from 'react';
import { validateHabitName } from '@/lib/validators';
import type { Habit } from '@/types/habit';

export type HabitFormSubmit = {
  id?: string;
  name: string;
  description: string;
};

type Props = {
  initial?: Habit;
  onCancel: () => void;
  onSave: (input: HabitFormSubmit) => void;
};

export function HabitForm({ initial, onCancel, onSave }: Props) {
  const titleId = useId();
  const nameId = useId();
  const descId = useId();
  const freqId = useId();

  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateHabitName(name);
    if (!result.valid) {
      setError(result.error);
      return;
    }
    onSave({
      id: initial?.id,
      name: result.value,
      description: description.trim(),
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-30 flex items-center justify-center px-4 py-6 overflow-y-auto"
    >
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onCancel}
        aria-hidden="true"
      />
      <form
        data-testid="habit-form"
        onSubmit={handleSubmit}
        noValidate
        className="relative neo-card w-full max-w-md bg-surface"
      >
        <h2 id={titleId} className="text-xl font-black mb-4">
          {initial ? 'Edit habit' : 'New habit'}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor={nameId} className="neo-label">
              Name
            </label>
            <input
              id={nameId}
              data-testid="habit-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className="neo-input"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor={descId} className="neo-label">
              Description{' '}
              <span className="text-ink-muted font-normal">(optional)</span>
            </label>
            <textarea
              id={descId}
              data-testid="habit-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="neo-input"
            />
          </div>

          <div>
            <label htmlFor={freqId} className="neo-label">
              Frequency
            </label>
            <select
              id={freqId}
              data-testid="habit-frequency-select"
              value="daily"
              onChange={() => {}}
              className="neo-input"
            >
              <option value="daily">Daily</option>
            </select>
          </div>

          {error && (
            <p role="alert" className="text-danger font-bold">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-2 flex-wrap">
            <button
              type="submit"
              data-testid="habit-save-button"
              className="neo-btn"
            >
              {initial ? 'Save changes' : 'Create habit'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="neo-btn neo-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
