/**
 * Email Provider Interface
 *
 * Strategy pattern for email sending. Implementations: Resend, Console (dev).
 */

import type { ReactElement } from 'react';

export interface EmailMessage {
  to: string;
  subject: string;
  react: ReactElement;
}

export interface EmailProvider {
  sendEmail(message: EmailMessage): Promise<{ success: boolean; error?: string }>;
}
