/**
 * Password Reset Email Template
 *
 * Sent when user requests a password reset.
 */

import * as React from 'react';

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          padding: '30px',
          borderRadius: '8px 8px 0 0',
          textAlign: 'center' as const,
        }}
      >
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>Redefinição de Senha</h1>
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderTop: 'none',
          padding: '30px',
          borderRadius: '0 0 8px 8px',
        }}
      >
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
          Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para criar uma nova
          senha:
        </p>

        <div style={{ textAlign: 'center' as const, margin: '30px 0' }}>
          <a
            href={resetUrl}
            style={{
              background: '#3b82f6',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Redefinir Senha
          </a>
        </div>

        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
          Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição de senha,
          ignore este email.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />

        <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const }}>
          Consultor.AI - Seu assistente de vendas inteligente
        </p>
      </div>
    </div>
  );
}
