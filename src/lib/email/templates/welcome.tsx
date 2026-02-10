/**
 * Welcome Email Template
 *
 * Sent to new users after registration.
 */

import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
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
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>
          Bem-vindo ao Consultor.AI!
        </h1>
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderTop: 'none',
          padding: '30px',
          borderRadius: '0 0 8px 8px',
        }}
      >
        <p style={{ fontSize: '16px', color: '#374151' }}>
          Olá, <strong>{name}</strong>!
        </p>

        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
          Sua conta foi criada com sucesso. Agora você pode começar a usar o Consultor.AI para
          automatizar a captação e qualificação de leads via WhatsApp.
        </p>

        <div style={{ textAlign: 'center' as const, margin: '30px 0' }}>
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://consultor.ai'}/dashboard`}
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
            Acessar Dashboard
          </a>
        </div>

        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
          Se tiver dúvidas, entre em contato com nosso suporte.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />

        <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const }}>
          Consultor.AI - Seu assistente de vendas inteligente
        </p>
      </div>
    </div>
  );
}
