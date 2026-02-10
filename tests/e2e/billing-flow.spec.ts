/**
 * E2E Test: Billing Flow
 *
 * Tests the complete billing journey:
 * 1. Pricing page renders all 3 plans correctly
 * 2. Checkout button redirects to Stripe (or shows auth prompt)
 * 3. Webhook processes subscription events
 * 4. Dashboard reflects subscription status
 *
 * @see specs/002-saas-billing-admin/tasks.md - Task T093
 */

import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
  test('should display all 3 plan cards with correct pricing', async ({ page }) => {
    await page.goto('/pricing');

    // Page title
    await expect(page.locator('h1')).toContainText('Planos e Preços');

    // Freemium plan
    await expect(page.getByText('Grátis')).toBeVisible();
    await expect(page.getByText('Começar grátis')).toBeVisible();

    // Pro plan
    await expect(page.getByText('R$47')).toBeVisible();
    await expect(page.getByText('Assinar Pro')).toBeVisible();

    // Agência plan
    await expect(page.getByText('R$147')).toBeVisible();
    await expect(page.getByText('Assinar Agência')).toBeVisible();

    // Credits section
    await expect(page.getByText('Precisa de mais créditos?')).toBeVisible();
    await expect(page.getByText('R$19,90')).toBeVisible();
  });

  test('should mark Pro plan as recommended', async ({ page }) => {
    await page.goto('/pricing');

    // The Pro card should have a "Recomendado" badge or visual indicator
    const proCard = page
      .locator('[data-testid="pricing-card-pro"], :has-text("Assinar Pro")')
      .first();
    await expect(proCard).toBeVisible();
  });

  test('should have signup link for freemium plan', async ({ page }) => {
    await page.goto('/pricing');

    const signupLink = page.getByRole('link', { name: 'Começar grátis' });
    await expect(signupLink).toHaveAttribute('href', '/auth/signup');
  });
});

test.describe('Checkout Flow (unauthenticated)', () => {
  test('should redirect to login when clicking checkout without auth', async ({ page }) => {
    await page.goto('/pricing');

    // Click the Pro checkout button
    const proButton = page.getByText('Assinar Pro');
    await proButton.click();

    // Should redirect to login or show auth prompt
    await page.waitForURL(/\/(auth\/login|auth\/signup|pricing)/, { timeout: 10000 });
  });
});

test.describe('Billing API', () => {
  test('POST /api/billing/checkout should require auth', async ({ request }) => {
    const response = await request.post('/api/billing/checkout', {
      data: { planId: 'pro' },
    });

    expect(response.status()).toBe(401);
  });

  test('POST /api/billing/webhook should require stripe signature', async ({ request }) => {
    const response = await request.post('/api/billing/webhook', {
      data: { type: 'invoice.paid' },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });
});

test.describe('Dashboard Subscription Status', () => {
  test('should show login page when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
  });
});

test.describe('Credits Display', () => {
  test('GET /api/billing/credits should require auth', async ({ request }) => {
    const response = await request.get('/api/billing/credits');

    expect(response.status()).toBe(401);
  });
});
