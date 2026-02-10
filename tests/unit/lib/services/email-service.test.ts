/**
 * Email Service Tests
 *
 * Tests email sending functions with mocked Resend provider.
 * Verifies that errors never throw and are only logged.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock resend provider
const mockSendEmail = vi.fn();

vi.mock('@/lib/email/resend-provider', () => ({
  resendProvider: {
    sendEmail: (...args: any[]) => mockSendEmail(...args),
  },
}));

import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendCancellationEmail,
} from '@/lib/services/email-service';

describe('email-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendEmail.mockResolvedValue({ success: true });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      await sendWelcomeEmail('user@test.com', 'João');

      expect(mockSendEmail).toHaveBeenCalledOnce();
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: expect.stringContaining('Bem-vindo'),
        })
      );
    });

    it('should not throw on error', async () => {
      mockSendEmail.mockRejectedValue(new Error('API error'));

      await expect(sendWelcomeEmail('user@test.com', 'João')).resolves.toBeUndefined();
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      await sendPasswordResetEmail('user@test.com', 'https://example.com/reset');

      expect(mockSendEmail).toHaveBeenCalledOnce();
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: expect.stringContaining('Senha'),
        })
      );
    });

    it('should not throw on error', async () => {
      mockSendEmail.mockRejectedValue(new Error('API error'));

      await expect(
        sendPasswordResetEmail('user@test.com', 'https://example.com/reset')
      ).resolves.toBeUndefined();
    });
  });

  describe('sendCancellationEmail', () => {
    it('should send cancellation email', async () => {
      await sendCancellationEmail('user@test.com', 'Maria');

      expect(mockSendEmail).toHaveBeenCalledOnce();
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: expect.stringContaining('cancelada'),
        })
      );
    });

    it('should not throw on error', async () => {
      mockSendEmail.mockRejectedValue(new Error('API error'));

      await expect(sendCancellationEmail('user@test.com', 'Maria')).resolves.toBeUndefined();
    });
  });
});
