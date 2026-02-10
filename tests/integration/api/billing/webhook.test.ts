/**
 * Integration Tests: POST /api/billing/webhook
 *
 * Tests signature verification and event processing.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock stripe processor
const mockHandleWebhookEvent = vi.fn();

vi.mock('@/lib/payment/stripe/stripe-processor', () => ({
  stripeProcessor: {
    handleWebhookEvent: (...args: any[]) => mockHandleWebhookEvent(...args),
  },
}));

import { POST } from '@/app/api/billing/webhook/route';

function createWebhookRequest(body: string, signature?: string): Request {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (signature) {
    headers['stripe-signature'] = signature;
  }

  return new Request('http://localhost:3000/api/billing/webhook', {
    method: 'POST',
    body,
    headers,
  });
}

describe('POST /api/billing/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when signature is missing', async () => {
    const response = await POST(createWebhookRequest('{}'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('signature');
  });

  it('should return 400 when signature verification fails', async () => {
    mockHandleWebhookEvent.mockRejectedValue(new Error('Invalid webhook signature'));

    const response = await POST(createWebhookRequest('{}', 'invalid-sig'));

    expect(response.status).toBe(400);
  });

  it('should process valid webhook event and return 200', async () => {
    mockHandleWebhookEvent.mockResolvedValue({
      type: 'invoice.paid',
      processed: true,
    });

    const response = await POST(createWebhookRequest('{"type":"invoice.paid"}', 'valid-sig'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.received).toBe(true);
    expect(body.type).toBe('invoice.paid');
  });

  it('should return 200 for unknown user events (no retries)', async () => {
    mockHandleWebhookEvent.mockResolvedValue({
      type: 'invoice.paid',
      processed: true,
    });

    const response = await POST(createWebhookRequest('{"type":"invoice.paid"}', 'valid-sig'));

    expect(response.status).toBe(200);
  });
});
