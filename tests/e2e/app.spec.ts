import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const SESSION_KEY = 'habit-tracker-session';
const USERS_KEY = 'habit-tracker-users';
const HABITS_KEY = 'habit-tracker-habits';

async function seedSession(
  page: Page,
  user: { id: string; email: string; password: string },
) {
  await page.addInitScript(
    ({ sessionKey, usersKey, u }) => {
      localStorage.setItem(
        usersKey,
        JSON.stringify([
          {
            id: u.id,
            email: u.email,
            password: u.password,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ]),
      );
      localStorage.setItem(
        sessionKey,
        JSON.stringify({ userId: u.id, email: u.email }),
      );
    },
    { sessionKey: SESSION_KEY, usersKey: USERS_KEY, u: user },
  );
}

test.describe('Habit Tracker app', () => {
  test('shows the splash screen and redirects unauthenticated users to /login', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await page.waitForURL('**/login');
  });

  test('redirects authenticated users from / to /dashboard', async ({
    page,
  }) => {
    await seedSession(page, {
      id: 'u1',
      email: 'one@ember.test',
      password: 'pw',
    });
    await page.goto('/');
    await page.waitForURL('**/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login');
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/signup');
    await page.getByTestId('auth-signup-email').fill('new@ember.test');
    await page.getByTestId('auth-signup-password').fill('password');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test("logs in an existing user and loads only that user's habits", async ({
    page,
  }) => {
    await page.addInitScript(
      ({ usersKey, habitsKey }) => {
        localStorage.setItem(
          usersKey,
          JSON.stringify([
            {
              id: 'u1',
              email: 'one@ember.test',
              password: 'pw1',
              createdAt: '2025-01-01T00:00:00.000Z',
            },
            {
              id: 'u2',
              email: 'two@ember.test',
              password: 'pw2',
              createdAt: '2025-01-01T00:00:00.000Z',
            },
          ]),
        );
        localStorage.setItem(
          habitsKey,
          JSON.stringify([
            {
              id: 'h1',
              userId: 'u1',
              name: 'Read Books',
              description: '',
              frequency: 'daily',
              createdAt: '2025-01-01T00:00:00.000Z',
              completions: [],
            },
            {
              id: 'h2',
              userId: 'u2',
              name: 'Drink Water',
              description: '',
              frequency: 'daily',
              createdAt: '2025-01-01T00:00:00.000Z',
              completions: [],
            },
          ]),
        );
      },
      { usersKey: USERS_KEY, habitsKey: HABITS_KEY },
    );

    await page.goto('/login');
    await page.getByTestId('auth-login-email').fill('one@ember.test');
    await page.getByTestId('auth-login-password').fill('pw1');
    await page.getByTestId('auth-login-submit').click();
    await page.waitForURL('**/dashboard');

    await expect(page.getByTestId('habit-card-read-books')).toBeVisible();
    await expect(page.getByTestId('habit-card-drink-water')).toHaveCount(0);
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await seedSession(page, {
      id: 'u1',
      email: 'creator@ember.test',
      password: 'pw',
    });
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('empty-state')).toBeVisible();

    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Drink Water');
    await page.getByTestId('habit-save-button').click();

    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({
    page,
  }) => {
    await seedSession(page, {
      id: 'u1',
      email: 'completer@ember.test',
      password: 'pw',
    });
    await page.addInitScript(
      ({ habitsKey }) => {
        localStorage.setItem(
          habitsKey,
          JSON.stringify([
            {
              id: 'h1',
              userId: 'u1',
              name: 'Drink Water',
              description: '',
              frequency: 'daily',
              createdAt: '2025-01-01T00:00:00.000Z',
              completions: [],
            },
          ]),
        );
      },
      { habitsKey: HABITS_KEY },
    );

    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    await expect(page.getByTestId('habit-streak-drink-water')).toContainText(
      '0',
    );
    await page.getByTestId('habit-complete-drink-water').click();
    await expect(page.getByTestId('habit-streak-drink-water')).toContainText(
      '1',
    );
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await page.goto('/signup');
    await page.getByTestId('auth-signup-email').fill('persist@ember.test');
    await page.getByTestId('auth-signup-password').fill('password');
    await page.getByTestId('auth-signup-submit').click();
    await page.waitForURL('**/dashboard');

    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Drink Water');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await seedSession(page, {
      id: 'u1',
      email: 'logout@ember.test',
      password: 'pw',
    });
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    await page.getByTestId('auth-logout-button').click();
    await page.waitForURL('**/login');
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({
    page,
    context,
  }) => {
    // Warm load (online): SW installs + activates
    await page.goto('/login');
    await expect(page.getByTestId('auth-login-email')).toBeVisible();
    await page.evaluate(() => navigator.serviceWorker.ready);

    // Reload once with the SW now controlling, so static chunks get cached
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('auth-login-email')).toBeVisible();

    // Go offline and reload — cached shell should still render
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByTestId('auth-login-email')).toBeVisible({
      timeout: 15_000,
    });
  });
});
