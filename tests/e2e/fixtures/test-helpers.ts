/**
 * E2E Test Helpers
 *
 * Shared utilities for E2E tests
 */

import { type APIRequestContext, type Page } from '@playwright/test';

/**
 * Generate a unique test phone number
 */
export function generateTestPhone(prefix = '5511'): string {
  return `${prefix}${Date.now().toString().slice(-8)}`;
}

/**
 * Mock webhook response type
 */
export interface MockWebhookResponse {
  success: boolean;
  response: {
    text: string;
    buttons?: Array<{ id: string; title: string }>;
  };
  debug: {
    leadId: string;
    conversationId: string;
    currentStep: string;
    variables: Record<string, unknown>;
  };
}

/**
 * Send a message via mock webhook
 */
export async function sendMockMessage(
  request: APIRequestContext,
  from: string,
  text: string
): Promise<MockWebhookResponse> {
  const response = await request.post('/api/webhook/mock', {
    data: {
      from,
      text,
      timestamp: Date.now(),
    },
  });

  if (!response.ok()) {
    const error = await response.json();
    throw new Error(`Mock webhook failed: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Complete a full qualification flow
 */
export async function completeQualificationFlow(
  request: APIRequestContext,
  options: {
    phone?: string;
    profile?: string;
    age?: string;
    coparticipation?: string;
  } = {}
): Promise<{
  leadId: string;
  conversationId: string;
  finalResponse: MockWebhookResponse;
}> {
  const phone = options.phone || generateTestPhone();
  const profile = options.profile || 'individual';
  const age = options.age || '31_45';
  const coparticipation = options.coparticipation || 'nao';

  // Step 1: Initial message
  await sendMockMessage(request, phone, 'Olá, quero um plano de saúde');

  // Step 2: Profile
  await sendMockMessage(request, phone, profile);

  // Step 3: Age
  await sendMockMessage(request, phone, age);

  // Step 4: Coparticipation (triggers AI)
  const step4 = await sendMockMessage(request, phone, coparticipation);

  return {
    leadId: step4.debug.leadId,
    conversationId: step4.debug.conversationId,
    finalResponse: step4,
  };
}

/**
 * Login helper for authenticated tests
 */
export async function loginAsTestUser(
  page: Page,
  email = 'test@example.com',
  password = 'testpassword123'
): Promise<void> {
  await page.goto('/auth/login');

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  options: { timeout?: number } = {}
): Promise<void> {
  await page.waitForResponse(
    response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout: options.timeout || 10000 }
  );
}

/**
 * Verify lead exists in dashboard
 */
export async function verifyLeadInDashboard(page: Page, leadId: string): Promise<boolean> {
  await page.goto('/dashboard/leads');

  // Wait for leads to load
  await page
    .waitForSelector('[data-testid="leads-list"], .leads-list, table', {
      timeout: 10000,
    })
    .catch(() => null);

  // Check if lead is visible
  const leadElement = page.locator(`[data-lead-id="${leadId}"], [href*="${leadId}"]`);
  return (await leadElement.count()) > 0;
}

/**
 * Check if environment is properly configured for E2E tests
 */
export async function checkEnvironmentReady(
  request: APIRequestContext
): Promise<{ ready: boolean; message?: string }> {
  try {
    const response = await request.post('/api/webhook/mock', {
      data: {
        from: '5500000000000',
        text: 'test',
        timestamp: Date.now(),
      },
    });

    if (!response.ok()) {
      const error = await response.json().catch(() => ({}));
      // Environment not ready if no consultant or flow exists
      if (error.error?.includes('consultor')) {
        return { ready: false, message: 'No consultant found in database' };
      }
      if (error.error?.includes('flow')) {
        return { ready: false, message: 'No active flow found in database' };
      }
    }
    return { ready: true };
  } catch (e) {
    return { ready: false, message: `Connection error: ${e}` };
  }
}

/**
 * Test data generators
 */
export const testData = {
  profiles: ['individual', 'casal', 'familia', 'empresarial'],
  ages: ['ate_30', '31_45', '46_60', 'acima_60'],
  coparticipation: ['sim', 'nao'],

  randomProfile(): string {
    return this.profiles[Math.floor(Math.random() * this.profiles.length)]!;
  },

  randomAge(): string {
    return this.ages[Math.floor(Math.random() * this.ages.length)]!;
  },

  randomCoparticipation(): string {
    return this.coparticipation[Math.floor(Math.random() * this.coparticipation.length)]!;
  },
};
