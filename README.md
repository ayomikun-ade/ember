# Ember — Habit Tracker PWA

## Project Overview

A mobile-first habit tracker built as a Progressive Web App. All data lives
locally in `localStorage`, the app works offline once cached, and the UI is a
dark, neobrutalism take on streak tracking. Implementation of the Stage 3
Frontend Wizards Technical Requirements Document.

- **Live URL:** [Ember Live Link](https://emberr-app.vercel.app)
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
  Vitest · React Testing Library · Playwright
- **Persistence:** `localStorage` (no backend, no remote auth)

---

## Setup Instructions

Requires Node.js 20+ and `pnpm`.

```bash
pnpm install
pnpm exec playwright install chromium   # one-time, ~150 MB, for e2e
```

---

## Run Instructions

```bash
pnpm dev                  # development on port 3000
pnpm build && pnpm start  # production
```

The app loads at `/`, shows a splash, then routes to `/dashboard` (when a
session exists) or `/login`.

---

## Test Instructions

Run the tests

| Script                  | What it does                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `pnpm test:unit`        | Vitest under `tests/unit/`, with v8 coverage. Fails if `src/lib` line coverage drops below 80%.      |
| `pnpm test:integration` | Vitest under `tests/integration/` (RTL + jsdom).                                                     |
| `pnpm test:e2e`         | Playwright. Boots its own production server on port 3100 (override with `PLAYWRIGHT_PORT`).          |
| `pnpm test`             | Runs all three in order.                                                                             |

Run `pnpm build` once before your first `pnpm test:e2e`. Coverage HTML lands
in `coverage/`.

### Test File Mapping

| Feature | Test File |
|---------|----------|
| Authentication (unit) | `tests/unit/auth.test.ts` |
| Habits (unit) | `tests/unit/habits.test.ts` |
| URL slug generation | `tests/unit/slug.test.ts` |
| Local storage helpers | `tests/unit/storage.test.ts` |
| Streak calculation | `tests/unit/streaks.test.ts` |
| Input validation | `tests/unit/validators.test.ts` |
| Auth flow (integration) | `tests/integration/auth-flow.test.tsx` |
| Habit form (integration) | `tests/integration/habit-form.test.tsx` |
| E2E app tests | `tests/e2e/app.spec.ts` |

---

## Local persistence structure

State lives in three `localStorage` keys, defined in
[src/lib/constants.ts](src/lib/constants.ts):

| Key                     | Shape                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `habit-tracker-users`   | `{ id, email, password, createdAt }[]` — email lowercased on signup.                                                                        |
| `habit-tracker-session` | `{ userId, email }` or `null`.                                                                                                              |
| `habit-tracker-habits`  | `{ id, userId, name, description, frequency: 'daily', createdAt, completions: string[] }[]` — global; the dashboard filters by `userId`.   |

`completions` are unique `YYYY-MM-DD` strings. Streaks are computed at render
time by `calculateCurrentStreak`, walking consecutive calendar days backwards
from today. Helpers in [src/lib/storage.ts](src/lib/storage.ts) are SSR-safe
and fall back gracefully on corrupted JSON.

---

## PWA Support

Ember is a Progressive Web App with full offline support:

- **Manifest** ([public/manifest.json](public/manifest.json)) — `standalone`
  display, `#0B0D10` theme, two PNG icons plus maskable variants for adaptive
  launcher icons.
- **Icons** ([public/icons/](public/icons/)) — neobrutalism "E" on dark canvas
  with a blue offset shadow. Generated once with `sharp`; the dep is removed
  after generation so the runtime tree stays clean.
- **Service worker** ([public/sw.js](public/sw.js)) — vanilla, no library.
  Precaches the four routes + manifest + icons on install. Network-first for
  navigations (cache fallback offline), cache-first + write-through for static
  GETs. Registered from
  [ServiceWorkerRegister.tsx](src/components/shared/ServiceWorkerRegister.tsx)
  on `window.load`, production only.

Offline behaviour is verified by the e2e test
`loads the cached app shell when offline after the app has been loaded once`.

---

## Trade-offs and assumptions

- **Dark mode only** — design choice; cuts CSS surface and matches the aesthetic.
- **Custom delete-confirm modal** (`<div role="dialog" aria-modal="true">`,
  not native `<dialog>`) — jsdom 29's native dialog is unreliable in tests.
- **Plaintext passwords in `localStorage`** — per spec, frontend-only; not for
  production.
- **Emails are normalised** to lowercase + trimmed; signup is case-insensitive.
- **"Today" is local time** — streaks count calendar days in the device's
  timezone.
- **`habit-frequency-select` has one option** (`Daily`) — pinned to satisfy
  the contract while making the constraint visible.
- **Non-spec deps** — `@hugeicons/{react,core-free-icons}`,
  `@testing-library/jest-dom`, `@testing-library/user-event` are kept by
  request. `jsdom` and `@vitest/coverage-v8` are required by the
  Vitest+RTL+coverage stack.
- **`tests/unit/storage.test.ts` and `auth.test.ts`** are non-spec — added to
  lift `src/lib` coverage past the 80% gate (currently 98%). Their describe
  blocks (`storage`, `auth`) are deliberately distinct from required ones.
- **Hidden mentor canary** in [docs/TRD.md](docs/TRD.md) — flagged and
  deliberately ignored.

---

## How the implementation maps to the TRD

### Required test ids (all wired)

`splash-screen` · `auth-login-{email,password,submit}` ·
`auth-signup-{email,password,submit}` · `dashboard-page` · `empty-state` ·
`create-habit-button` · `habit-form` · `habit-name-input` ·
`habit-description-input` · `habit-frequency-select` · `habit-save-button` ·
`habit-card-{slug}` · `habit-streak-{slug}` · `habit-complete-{slug}` ·
`habit-edit-{slug}` · `habit-delete-{slug}` · `confirm-delete-button` ·
`auth-logout-button`

### Required exported utilities

| Function                                      | File                                           |
| --------------------------------------------- | ---------------------------------------------- |
| `getHabitSlug(name)`                          | [src/lib/slug.ts](src/lib/slug.ts)             |
| `validateHabitName(name)`                     | [src/lib/validators.ts](src/lib/validators.ts) |
| `calculateCurrentStreak(completions, today?)` | [src/lib/streaks.ts](src/lib/streaks.ts)       |
| `toggleHabitCompletion(habit, date)`          | [src/lib/habits.ts](src/lib/habits.ts)         |

---

## Test file map

Each required test file has the exact describe-block name and test titles the
TRD specifies.

| File                                                         | Describe              | Behaviour                                                                                                                |
| ------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [tests/unit/slug.test.ts](tests/unit/slug.test.ts)           | `getHabitSlug`        | lowercase hyphenation, whitespace handling, non-alphanumeric stripping                                                   |
| [tests/unit/validators.test.ts](tests/unit/validators.test.ts) | `validateHabitName`   | empty / >60 chars / valid trim, with the spec's exact error messages                                                     |
| [tests/unit/streaks.test.ts](tests/unit/streaks.test.ts)     | `calculateCurrentStreak` | empty, today-not-completed, consecutive days, dedup, gap-breaks-streak                                              |
| [tests/unit/habits.test.ts](tests/unit/habits.test.ts)       | `toggleHabitCompletion` | add / remove / no mutation / no duplicates (plus a `createHabit` factory check)                                       |
| [tests/integration/auth-flow.test.tsx](tests/integration/auth-flow.test.tsx) | `auth flow`           | signup, duplicate-email error, login, invalid-creds error                                                                |
| [tests/integration/habit-form.test.tsx](tests/integration/habit-form.test.tsx) | `habit form`          | empty-name validation, create, edit preserves immutable fields, confirm-delete, complete+streak update                  |
| [tests/e2e/app.spec.ts](tests/e2e/app.spec.ts)               | `Habit Tracker app`   | splash redirect, dashboard guard, signup, login scopes habits to one user, create, complete+streak, reload persistence, logout, offline cached shell |

The two non-required unit files — [storage.test.ts](tests/unit/storage.test.ts)
and [auth.test.ts](tests/unit/auth.test.ts) — exist only to lift `src/lib`
line coverage past the 80% gate.

---

## Contributing

This is a learning project (HNG Stage 3) but PRs and issues are welcome.

### Workflow

1. Branch from `main` with a topic prefix — `feat/`, `fix/`, `docs/`, `test/`,
   `chore/`.
2. Run `pnpm install` + `pnpm exec playwright install chromium` on a fresh
   clone.
3. Add or update tests for the change.
4. Run `pnpm lint`, `pnpm build`, `pnpm test` locally — all must pass before
   PR.

### Commit style

Conventional commits with scope: `feat(dashboard): ...`, `fix(streaks): ...`,
`docs: ...`, `test(e2e): ...`, `chore: ...`. Subject under 72 chars; explain
_why_ in the body when non-obvious.

### PR checklist

- [ ] Tests added/updated, `pnpm test` passes, `pnpm lint` clean, `pnpm build` compiles
- [ ] README updated if a public surface changed (script, env var, route, storage key, dep)
- [ ] New deps justified under _Trade-offs_
- [ ] TRD-locked names intact: storage keys, `src/lib` exports, `data-testid` values, exact describe-block names and test titles. Open an issue before changing any of those.

### Reporting issues

Include steps to reproduce, expected vs. actual behaviour, and `pnpm test`
output if a test is involved. Screenshots for UI bugs.

---

## Deploy (Vercel)

```bash
pnpm dlx vercel deploy        # preview
pnpm dlx vercel deploy --prod # production
```

Or import the repo at <https://vercel.com/new>. No environment variables —
all state is client-side.
