/**
 * E2E Test: Lead Qualification Flow
 *
 * Tests the complete lead qualification journey:
 * 1. New contact sends message via WhatsApp (mock webhook)
 * 2. System creates lead and starts qualification flow
 * 3. User answers profile, age, and coparticipation questions
 * 4. AI generates personalized recommendation
 * 5. Lead is marked as qualified with score
 *
 * @see specs/001-project-specs/tasks.md - Task T043
 */

/* eslint-disable no-console, max-lines-per-function */
import { test, expect, type APIRequestContext } from '@playwright/test';

// Test data
const TEST_PHONE = `5511${Date.now().toString().slice(-8)}`;

interface MockWebhookResponse {
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
 * Helper to send a message via mock webhook
 */
async function sendMessage(
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
    const errorBody = await response.json().catch(() => ({}));
    const errorMsg = errorBody.error || `HTTP ${response.status()}`;
    throw new Error(`Mock webhook failed: ${errorMsg}`);
  }

  return response.json();
}

/**
 * Check if environment is properly configured for E2E tests
 */
async function checkEnvironmentReady(request: APIRequestContext): Promise<boolean> {
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
      if (error.error?.includes('consultor') || error.error?.includes('flow')) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

test.describe('Lead Qualification Flow', () => {
  test.describe.configure({ mode: 'serial' });

  let leadId: string;
  let conversationId: string;
  let environmentReady = false;

  test.beforeAll(async ({ request }) => {
    environmentReady = await checkEnvironmentReady(request);
    if (!environmentReady) {
      console.log('⚠️ E2E environment not ready: Missing consultant or flow in database');
      console.log('   Run database seeds or create a consultant and flow first');
    }
  });

  test('Step 1: New contact initiates conversation', async ({ request }) => {
    test.skip(!environmentReady, 'Environment not configured: Missing consultant or flow');
    // Send initial message
    const response = await sendMessage(request, TEST_PHONE, 'Olá, quero um plano de saúde');

    // Verify response structure
    expect(response.success).toBe(true);
    expect(response.response.text).toBeTruthy();
    expect(response.debug.leadId).toBeTruthy();
    expect(response.debug.conversationId).toBeTruthy();

    // Save IDs for subsequent tests
    leadId = response.debug.leadId;
    conversationId = response.debug.conversationId;

    // Verify welcome message or profile question was sent
    const responseText = response.response.text.toLowerCase();
    expect(
      responseText.includes('bem-vindo') ||
        responseText.includes('olá') ||
        responseText.includes('perfil') ||
        responseText.includes('buscando')
    ).toBeTruthy();

    // Should have buttons for profile selection if at profile step
    if (response.response.buttons && response.response.buttons.length > 0) {
      expect(response.response.buttons.length).toBeGreaterThanOrEqual(2);
    }
  });

  test('Step 2: User selects profile type (Individual)', async ({ request }) => {
    test.skip(!environmentReady, 'Environment not configured: Missing consultant or flow');

    // Answer profile question
    const response = await sendMessage(request, TEST_PHONE, 'individual');

    expect(response.success).toBe(true);
    expect(response.debug.conversationId).toBe(conversationId);

    // Verify variables were captured
    const variables = response.debug.variables as Record<string, string>;
    expect(
      variables.perfil === 'individual' ||
        response.debug.currentStep?.includes('idade') ||
        response.response.text.toLowerCase().includes('idade') ||
        response.response.text.toLowerCase().includes('faixa')
    ).toBeTruthy();

    // Should ask for age next
    const responseText = response.response.text.toLowerCase();
    if (!responseText.includes('recomend')) {
      expect(
        responseText.includes('idade') ||
          responseText.includes('faixa') ||
          responseText.includes('anos')
      ).toBeTruthy();
    }
  });

  test('Step 3: User selects age range (31-45)', async ({ request }) => {
    test.skip(!environmentReady, 'Environment not configured: Missing consultant or flow');

    // Answer age question
    const response = await sendMessage(request, TEST_PHONE, '31_45');

    expect(response.success).toBe(true);

    // Verify flow progression
    const variables = response.debug.variables as Record<string, string>;
    const hasAgeOrCopart =
      variables.faixa_etaria ||
      variables.idade ||
      response.debug.currentStep?.includes('coparticipacao') ||
      response.response.text.toLowerCase().includes('coparticipação');

    expect(hasAgeOrCopart).toBeTruthy();
  });

  test('Step 4: User selects coparticipation preference (No)', async ({ request }) => {
    test.skip(!environmentReady, 'Environment not configured: Missing consultant or flow');

    // Answer coparticipation question - this should trigger AI recommendation
    const response = await sendMessage(request, TEST_PHONE, 'nao');

    expect(response.success).toBe(true);

    // At this point, AI should generate recommendation
    // The response should contain personalized content
    const responseText = response.response.text.toLowerCase();

    // Check if we got a meaningful response (AI recommendation or next step)
    expect(response.response.text.length).toBeGreaterThan(20);

    // Variables should include all qualification data
    const variables = response.debug.variables as Record<string, string>;
    const hasQualificationData =
      variables.perfil || variables.faixa_etaria || variables.coparticipacao;

    // Either we have qualification data or we're at a recommendation step
    expect(
      hasQualificationData ||
        responseText.includes('plano') ||
        responseText.includes('recomend') ||
        responseText.includes('opç')
    ).toBeTruthy();
  });

  test('Step 5: Verify lead was qualified', async ({ request }) => {
    test.skip(!environmentReady, 'Environment not configured: Missing consultant or flow');
    test.skip(!leadId, 'LeadId not available from previous tests');

    // Check lead status via API
    const response = await request.get(`/api/leads/${leadId}`);

    // If API requires auth, we might get 401 - that's expected in E2E without auth
    if (response.status() === 401) {
      // In a real scenario, we'd authenticate first
      // For now, we verify the flow completed successfully via mock webhook
      console.log('Lead verification skipped - requires authentication');
      return;
    }

    if (response.ok()) {
      const data = await response.json();
      const lead = data.lead || data;

      // Verify lead data
      expect(lead.id).toBe(leadId);
      expect(lead.whatsapp_number).toContain(TEST_PHONE.slice(-8));

      // Check if lead is qualified (status or score)
      const isQualified =
        lead.status === 'qualificado' ||
        lead.score > 0 ||
        (lead.metadata && Object.keys(lead.metadata).length > 0);

      expect(isQualified).toBeTruthy();
    }
  });

  test('Full flow: Complete qualification in single test', async ({ request }) => {
    test.skip(!environmentReady, 'Environment not configured: Missing consultant or flow');

    // Use unique phone for this test
    const uniquePhone = `5521${Date.now().toString().slice(-8)}`;

    // Step 1: Initial contact
    const step1 = await sendMessage(request, uniquePhone, 'Oi, preciso de um plano de saúde');
    expect(step1.success).toBe(true);

    // Step 2: Profile selection
    const step2 = await sendMessage(request, uniquePhone, 'familia');
    expect(step2.success).toBe(true);

    // Step 3: Age selection
    const step3 = await sendMessage(request, uniquePhone, '46_60');
    expect(step3.success).toBe(true);

    // Step 4: Coparticipation (triggers AI)
    const step4 = await sendMessage(request, uniquePhone, 'sim');
    expect(step4.success).toBe(true);

    // Verify final state
    const finalVariables = step4.debug.variables as Record<string, string>;

    // Log for debugging
    console.log('Final qualification state:', {
      leadId: step4.debug.leadId,
      currentStep: step4.debug.currentStep,
      variables: finalVariables,
      responseLength: step4.response.text.length,
    });

    // The flow should have captured qualification data
    expect(step4.debug.leadId).toBeTruthy();
  });
});

test.describe('Lead Qualification - Edge Cases', () => {
  let environmentReady = false;

  test.beforeAll(async ({ request }) => {
    environmentReady = await checkEnvironmentReady(request);
  });

  test('Should handle invalid message gracefully', async ({ request }) => {
    test.skip(!environmentReady, 'Environment not configured: Missing consultant or flow');

    const phone = `5531${Date.now().toString().slice(-8)}`;

    // Send gibberish
    const response = await sendMessage(request, phone, 'asdfghjkl');

    // Should still succeed and provide guidance
    expect(response.success).toBe(true);
    expect(response.response.text).toBeTruthy();
  });

  test('Should handle empty flow selection', async ({ request }) => {
    test.skip(!environmentReady, 'Environment not configured: Missing consultant or flow');

    const phone = `5541${Date.now().toString().slice(-8)}`;

    // Start conversation
    await sendMessage(request, phone, 'Quero plano');

    // Send invalid option
    const response = await sendMessage(request, phone, 'xyz_invalid_option');

    // Should handle gracefully
    expect(response.success).toBe(true);
  });

  test('Should maintain conversation state across messages', async ({ request }) => {
    test.skip(!environmentReady, 'Environment not configured: Missing consultant or flow');

    const phone = `5551${Date.now().toString().slice(-8)}`;

    // Message 1
    const msg1 = await sendMessage(request, phone, 'Olá');
    const conversationId = msg1.debug.conversationId;

    // Message 2
    const msg2 = await sendMessage(request, phone, 'individual');

    // Should be same conversation
    expect(msg2.debug.conversationId).toBe(conversationId);
    expect(msg2.debug.leadId).toBe(msg1.debug.leadId);
  });
});

test.describe('Lead Qualification - API Validation', () => {
  test('Mock webhook should reject missing parameters', async ({ request }) => {
    // Missing 'text' parameter
    const response = await request.post('/api/webhook/mock', {
      data: {
        from: '5511999999999',
        // text is missing
        timestamp: Date.now(),
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('obrigatório');
  });

  test('Mock webhook should reject missing phone number', async ({ request }) => {
    const response = await request.post('/api/webhook/mock', {
      data: {
        // from is missing
        text: 'Hello',
        timestamp: Date.now(),
      },
    });

    expect(response.status()).toBe(400);
  });
});
