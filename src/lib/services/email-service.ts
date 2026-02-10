/**
 * Email Service
 *
 * High-level email sending functions. Never throws — logs errors
 * and returns silently to avoid blocking primary operations.
 */

import React from 'react';
import { resendProvider } from '@/lib/email/resend-provider';
import { WelcomeEmail } from '@/lib/email/templates/welcome';
import { PasswordResetEmail } from '@/lib/email/templates/password-reset';
import { SubscriptionCanceledEmail } from '@/lib/email/templates/subscription-canceled';

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  try {
    await resendProvider.sendEmail({
      to,
      subject: 'Bem-vindo ao Consultor.AI!',
      react: React.createElement(WelcomeEmail, { name }),
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  try {
    await resendProvider.sendEmail({
      to,
      subject: 'Redefinição de Senha - Consultor.AI',
      react: React.createElement(PasswordResetEmail, { resetUrl }),
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}

export async function sendCancellationEmail(to: string, name: string): Promise<void> {
  try {
    await resendProvider.sendEmail({
      to,
      subject: 'Sua assinatura foi cancelada - Consultor.AI',
      react: React.createElement(SubscriptionCanceledEmail, { name }),
    });
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
  }
}
