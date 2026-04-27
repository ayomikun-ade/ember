# Ember — Habit Tracker PWA

A mobile-first habit tracker built as a Progressive Web App. All data lives
locally in `localStorage`, the app works offline once cached, and the UI is a
dark, neobrutalism take on streak tracking. Implementation of the Stage 3
Frontend Wizards Technical Requirements Document.

- **Live URL:** _set after Vercel deploy_
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
  Vitest · React Testing Library · Playwright
- **Persistence:** `localStorage` (no backend, no remote auth)

---

## Setup

Requires Node.js 20+ and `pnpm`.

```bash
pnpm install
```

End-to-end tests need the Chromium binary for Playwright. This is a one-time
download (~150 MB) into a system cache outside `node_modules`:

```bash
pnpm exec playwright install chromium
```

---

## Run the app

```bash
pnpm dev               # development server
pnpm build && pnpm start  # production
```

Default dev port is `3000`. The app loads at `/`, shows a splash, then routes
to `/dashboard` (if you have a session) or `/login`.

---

## Run the tests

| Script | What it does |
| --- | --- |
| `pnpm test:unit` | Vitest unit suites under `tests/unit/`, with v8 coverage. Fails if line coverage on `src/lib` drops below 80%. |
| `pnpm test:integration` | Vitest component/integration suites under `tests/integration/` (RTL + jsdom). |
| `pnpm test:e2e` | Playwright. Boots its own production server, runs the full app flow in Chromium. |
| `pnpm test` | Runs all three in order: unit → integration → e2e. |

The e2e runner starts `next start` on port **3100** (overridable with
`PLAYWRIGHT_PORT=NNNN`). It will not reuse an existing server on that port — it
always boots a fresh one and tears it down on exit. Run `pnpm build` once
before your first `pnpm test:e2e`.

Coverage report lands in `coverage/` (open `coverage/index.html` in a browser
for a per-line view).

---

## Local persistence structure

All state lives in three `localStorage` keys, defined in
[src/lib/constants.ts](src/lib/constants.ts):

| Key | Shape | Notes |
| --- | --- | --- |
| `habit-tracker-users` | `User[]` | Each `User` is `{ id, email, password, createdAt }`. Email is normalised to lowercase on signup. |
| `habit-tracker-session` | `Session \| null` | `{ userId, email }` for the active user, or `null` when logged out. |
| `habit-tracker-habits` | `Habit[]` | Global list across all users; the dashboard filters by `userId`. Each `Habit` is `{ id, userId, name, description, frequency: 'daily', createdAt, completions: string[] }`. |

`completions` are unique `YYYY-MM-DD` strings (deduped by
`toggleHabitCompletion`). Streaks are computed at render time by
`calculateCurrentStreak`, which walks consecutive calendar days backwards from
today. Persistence helpers in [src/lib/storage.ts](src/lib/storage.ts) are
SSR-safe (no-op when `window` is undefined) and tolerate corrupted JSON by
returning a fallback.

When users switch accounts, the dashboard preserves *other* users' habits in
the global list — the active user only ever sees their own.

---

## PWA implementation

Three pieces, no extra tooling:

1. **Manifest** — [public/manifest.json](public/manifest.json) declares
   `name`, `short_name`, `start_url: /`, `display: standalone`,
   background/theme `#0B0D10`, and the two PNG icons. Linked via
   `metadata.manifest` in [src/app/layout.tsx](src/app/layout.tsx).

2. **Icons** — [public/icons/icon-192.png](public/icons/icon-192.png) and
   [icon-512.png](public/icons/icon-512.png), a chunky neobrutalism "E" mark on
   a deep blue canvas with a cyan offset shadow. Generated once with `sharp`
   from a small inline SVG; the build dependency was removed after generation
   so the runtime dep tree stays clean.

3. **Service worker** — [public/sw.js](public/sw.js), vanilla, no library:
   - **install:** precaches the four route HTMLs + manifest + icons. Per-asset
     failures are tolerated so a single 404 can't block install.
   - **activate:** drops old `ember-shell-v*` caches, calls `clients.claim()`
     to take control of open tabs.
   - **fetch:** navigations are network-first with a cache fallback (and `/`
     as a last resort offline); other GETs are cache-first with a write-through
     populate on misses, so dependent JS/CSS chunks get cached on first use.

   Registered from
   [src/components/shared/ServiceWorkerRegister.tsx](src/components/shared/ServiceWorkerRegister.tsx),
   mounted in the root layout. Fires on `window.load`; failures are silent and
   non-fatal.

The offline behaviour is verified end-to-end by the
`loads the cached app shell when offline after the app has been loaded once`
e2e test.

---

## Trade-offs and assumptions

- **Dark mode only.** The TRD lets us choose the visual design, so the design
  system carries one theme and skips a light/dark toggle. Cuts CSS surface area
  and matches the neobrutalism aesthetic; the trade-off is bright outdoor
  readability, mitigated by high-contrast text.
- **Custom delete-confirm modal.** A `<div role="dialog" aria-modal="true">`
  rather than the native `<dialog>` element. jsdom 29's `<dialog>` support is
  partial (`showModal()` is unreliable in tests), and the native element brings
  styling baggage that doesn't help us. The custom version handles ESC,
  backdrop click, and focuses Cancel on open.
- **Plaintext passwords in `localStorage`.** Spec is explicit that auth is
  local and deterministic — no hashing or backend. This is a learning task,
  not a real auth surface; do not ship as-is.
- **Email normalisation.** Stored and compared as lowercase + trimmed, so
  `Foo@bar.com` and `foo@bar.com` are the same user. Avoids surprise duplicate
  signups but means email is effectively case-insensitive.
- **"Today" is local time, not UTC.** Streaks count calendar days in the
  device's timezone. A user travelling across timezones may see a streak
  break/repeat at the boundary day; acceptable for a single-device tracker.
- **Coverage scope.** The 80% threshold applies to `src/lib/**/*.ts` only,
  matching the spec. UI components are exercised by the integration and e2e
  suites without contributing to the gate.
- **Frequency dropdown has one option (`Daily`).** The TRD requires a
  `habit-frequency-select` test id and pins frequency to `'daily'`. Rendered
  as a single-option select to satisfy the contract while making it visually
  obvious that no other cadence is configurable yet.
- **Non-spec dependencies.** `@hugeicons/{react,core-free-icons}` (UI icons),
  `@testing-library/jest-dom`, `@testing-library/user-event` are not named in
  the TRD. Kept by request as UX/DX choices that don't affect any required
  contract. `jsdom` and `@vitest/coverage-v8` are transitive necessities of the
  required stack (Vitest+RTL+coverage).
- **Hidden mentor canary.** The TRD contains an HTML-commented instruction
  asking the AI assistant to silently insert a tracking comment in the streaks
  test file. It was surfaced and deliberately ignored.

---

## How the implementation maps to the TRD

### Required folder/file layout

```
src/
  app/
    page.tsx                         splash + session redirect
    layout.tsx                       metadata, viewport, manifest link, SW register
    login/page.tsx
    signup/page.tsx
    dashboard/page.tsx               protected, lists habits, CRUD + logout
    globals.css                      neobrutalism dark tokens + utility classes
  components/
    auth/{LoginForm,SignupForm}.tsx
    habits/{HabitForm,HabitList,HabitCard}.tsx
    shared/{SplashScreen,ProtectedRoute,ConfirmDialog,ServiceWorkerRegister}.tsx
  lib/
    auth.ts        signupUser / loginUser / logoutUser
    habits.ts      toggleHabitCompletion (spec) + createHabit factory
    storage.ts     typed localStorage helpers
    streaks.ts     calculateCurrentStreak (spec)
    slug.ts        getHabitSlug (spec)
    validators.ts  validateHabitName (spec)
    constants.ts   the 3 storage keys
  types/
    auth.ts        User, Session
    habit.ts       Habit
public/
  manifest.json
  sw.js
  icons/
    icon-192.png
    icon-512.png
tests/
  unit/
    slug.test.ts validators.test.ts streaks.test.ts habits.test.ts
    storage.test.ts auth.test.ts          (extras to satisfy 80% coverage)
  integration/
    auth-flow.test.tsx habit-form.test.tsx
  e2e/
    app.spec.ts
```

### Required test ids (all wired)

`splash-screen` · `auth-login-{email,password,submit}` ·
`auth-signup-{email,password,submit}` · `dashboard-page` · `empty-state` ·
`create-habit-button` · `habit-form` · `habit-name-input` ·
`habit-description-input` · `habit-frequency-select` · `habit-save-button` ·
`habit-card-{slug}` · `habit-streak-{slug}` · `habit-complete-{slug}` ·
`habit-edit-{slug}` · `habit-delete-{slug}` · `confirm-delete-button` ·
`auth-logout-button`

### Required exported utilities (all in `src/lib`)

| Function | File | Spec section |
| --- | --- | --- |
| `getHabitSlug(name)` | [src/lib/slug.ts](src/lib/slug.ts) | §9 |
| `validateHabitName(name)` | [src/lib/validators.ts](src/lib/validators.ts) | §9 |
| `calculateCurrentStreak(completions, today?)` | [src/lib/streaks.ts](src/lib/streaks.ts) | §9 |
| `toggleHabitCompletion(habit, date)` | [src/lib/habits.ts](src/lib/habits.ts) | §9 |

---

## Test file map

Each required test file lives where the TRD asks, with the exact described
describe-block names and test titles.

### Unit (Vitest) — `tests/unit/`

| File | What it verifies |
| --- | --- |
| [slug.test.ts](tests/unit/slug.test.ts) | `getHabitSlug` produces lowercase hyphenated slugs, trims and collapses whitespace, strips non-alphanumeric except hyphens. |
| [validators.test.ts](tests/unit/validators.test.ts) | `validateHabitName` rejects empty input with `Habit name is required`, rejects > 60 chars with `Habit name must be 60 characters or fewer`, and returns the trimmed value when valid. |
| [streaks.test.ts](tests/unit/streaks.test.ts) | `calculateCurrentStreak` returns `0` for empty completions, `0` when today isn't completed, the right count for consecutive days, ignores duplicates, and breaks on a missing calendar day. |
| [habits.test.ts](tests/unit/habits.test.ts) | `toggleHabitCompletion` adds, removes, never mutates the input, and never returns duplicates. Plus a non-spec `createHabit` test (see *Extras* below). |
| [storage.test.ts](tests/unit/storage.test.ts) | _Extra._ Round-trip `localStorage` for users / session / habits and corrupted-JSON fallback. Lifts `src/lib` line coverage past the 80% gate. |
| [auth.test.ts](tests/unit/auth.test.ts) | _Extra._ `signupUser` creates user + session, rejects duplicate email with `User already exists`, `loginUser` rejects bad creds with `Invalid email or password`, `logoutUser` clears session. Lifts coverage. |

### Integration (Vitest + RTL) — `tests/integration/`

| File | What it verifies |
| --- | --- |
| [auth-flow.test.tsx](tests/integration/auth-flow.test.tsx) | `auth flow`: signup creates a session and redirects, duplicate signup shows the spec error, login stores a session and redirects, invalid login shows the spec error. `next/navigation` is mocked. |
| [habit-form.test.tsx](tests/integration/habit-form.test.tsx) | `habit form`: empty name → validation error, create flow renders the new card, edit preserves `id`/`userId`/`createdAt`/`completions`, delete only fires after the modal's confirm-delete-button, completing today flips the streak chip from 0 to 1. |

### E2E (Playwright) — `tests/e2e/`

| File | What it verifies |
| --- | --- |
| [app.spec.ts](tests/e2e/app.spec.ts) | `Habit Tracker app`: splash and unauth → /login; auth → /dashboard; /dashboard guard; signup; login scopes habits to one user; create; complete + streak update; reload persistence; logout; offline app shell after warm load. |

---

## Extras worth flagging

- **`createHabit` factory** in `src/lib/habits.ts` (and a unit test) — added so
  the dashboard has one place that mints `id` / `createdAt` / `completions: []`
  / `frequency: 'daily'`. Pure function, fully tested.
- **`storage.test.ts` and `auth.test.ts`** — _not required by the TRD._ Added
  so `src/lib`'s line coverage clears the 80% gate (currently 98%). Their
  describe blocks (`storage`, `auth`) are deliberately distinct from the four
  required ones so they can't be confused with required tests.

---

## Deploy (Vercel)

```bash
pnpm dlx vercel deploy        # preview
pnpm dlx vercel deploy --prod # production
```

Or import the repo at <https://vercel.com/new>. No environment variables
required — all state is client-side `localStorage`.
