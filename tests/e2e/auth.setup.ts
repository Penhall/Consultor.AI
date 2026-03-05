/**
 * Playwright Auth Setup
 *
 * Runs ONCE before the main test projects.
 * Logs in with seed accounts and saves cookies so tests don't re-login.
 *
 * Prerequisites: app must be running at http://localhost:3000
 */

import { test as setup } from '@playwright/test';
import * as path from 'path';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const SEED_PASSWORD = process.env.TEST_PASSWORD ?? 'seed123456';

export const USER_STATE = path.join(process.cwd(), 'playwright', '.auth', 'user.json');
export const ADMIN_STATE = path.join(process.cwd(), 'playwright', '.auth', 'admin.json');

async function loginAndSave(
  page: import('@playwright/test').Page,
  email: string,
  storageFile: string
): Promise<void> {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.waitForSelector('input[type="email"]', { timeout: 30000 });

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', SEED_PASSWORD);
  await page.click('button[type="submit"]');

  // Docker Supabase can be slow — allow up to 60 s for redirect
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 60000 });
  // Do NOT use waitForLoadState('networkidle') — Next.js dev keeps a persistent
  // HMR WebSocket open, so networkidle never fires reliably.
  // Wait for the sidebar nav link instead: it's server-rendered and only visible
  // after the auth guard has passed and the layout has fully mounted.
  await page.locator('nav a[href="/dashboard/leads"]').waitFor({ timeout: 30000 });

  await page.context().storageState({ path: storageFile });
}

setup('authenticate as seed consultant', async ({ page }) => {
  const email = process.env.TEST_EMAIL ?? 'consultor1@seed.local';
  await loginAndSave(page, email, USER_STATE);
});

setup('authenticate as seed admin', async ({ page }) => {
  await loginAndSave(page, 'consultor0@seed.local', ADMIN_STATE);
});
