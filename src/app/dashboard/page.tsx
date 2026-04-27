'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { HabitForm, type HabitFormSubmit } from '@/components/habits/HabitForm';
import { HabitList } from '@/components/habits/HabitList';
import { logoutUser } from '@/lib/auth';
import { createHabit, toggleHabitCompletion } from '@/lib/habits';
import { getHabits, getSession, saveHabits } from '@/lib/storage';
import type { Habit } from '@/types/habit';

function getTodayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function DashboardView() {
  const router = useRouter();
  const today = useMemo(getTodayLocal, []);
  const [userId, setUserId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Habit | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;
    setUserId(session.userId);
    setEmail(session.email);
    setHabits(getHabits().filter((h) => h.userId === session.userId));
  }, []);

  function persist(nextForUser: Habit[]) {
    const allOthers = getHabits().filter((h) => h.userId !== userId);
    saveHabits([...allOthers, ...nextForUser]);
    setHabits(nextForUser);
  }

  function handleSave({ id, name, description }: HabitFormSubmit) {
    if (id) {
      persist(
        habits.map((h) => (h.id === id ? { ...h, name, description } : h)),
      );
    } else {
      persist([...habits, createHabit({ name, description, userId })]);
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    persist(habits.filter((h) => h.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  function handleToggle(id: string) {
    persist(
      habits.map((h) => (h.id === id ? toggleHabitCompletion(h, today) : h)),
    );
  }

  function handleLogout() {
    logoutUser();
    router.replace('/login');
  }

  return (
    <main
      data-testid="dashboard-page"
      className="min-h-screen px-4 py-6 md:px-8 md:py-10"
    >
      <div className="max-w-4xl mx-auto">
        <header className="flex items-start justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold">
              Ember
            </p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Habit Tracker
            </h1>
            {email && (
              <p className="mt-1 text-sm text-ink-muted">Signed in as {email}</p>
            )}
          </div>
          <button
            type="button"
            data-testid="auth-logout-button"
            onClick={handleLogout}
            className="neo-btn neo-btn-secondary"
            aria-label="Log out"
          >
            <HugeiconsIcon icon={Logout01Icon} size={18} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </header>

        <button
          type="button"
          data-testid="create-habit-button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="neo-btn"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={18} />
          New habit
        </button>

        <HabitList
          habits={habits}
          today={today}
          onToggle={handleToggle}
          onEdit={(habit) => {
            setEditing(habit);
            setFormOpen(true);
          }}
          onRequestDelete={(habit) => setPendingDelete(habit)}
        />
      </div>

      {formOpen && (
        <HabitForm
          initial={editing ?? undefined}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this habit?"
          description={`"${pendingDelete.name}" will be removed permanently.`}
          confirmLabel="Delete habit"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardView />
    </ProtectedRoute>
  );
}
