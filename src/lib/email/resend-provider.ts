/**
 * Resend Email Provider
 *
 * Sends emails via Resend API. Falls back to console logging when
 * RESEND_API_KEY is not configured (development mode).
 */

import { Resend } from 'resend';
import type { EmailProvider, EmailMessage } from './email-provider';

const EMAIL_FROM = process.env.EMAIL_FROM || 'Consultor.AI <noreply@consultor.ai>';

class ResendEmailProvider implements EmailProvider {
  private client: Resend | null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.client = apiKey ? new Resend(apiKey) : null;
  }

  async sendEmail(message: EmailMessage): Promise<{ success: boolean; error?: string }> {
    if (!this.client) {
      // Console fallback for development
      console.log('[EMAIL] Console fallback (no RESEND_API_KEY)');
      console.log(`  To: ${message.to}`);
      console.log(`  Subject: ${message.subject}`);
      return { success: true };
    }

    try {
      const { error } = await this.client.emails.send({
        from: EMAIL_FROM,
        to: message.to,
        subject: message.subject,
        react: message.react,
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to send email:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

export const resendProvider: EmailProvider = new ResendEmailProvider();
