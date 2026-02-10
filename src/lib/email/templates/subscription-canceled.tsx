/**
 * Subscription Canceled Email Template
 *
 * Sent when a user's subscription is canceled. Includes retention message.
 */

import * as React from 'react';

interface SubscriptionCanceledEmailProps {
  name: string;
}

export function SubscriptionCanceledEmail({ name }: SubscriptionCanceledEmailProps) {
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
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          padding: '30px',
          borderRadius: '8px 8px 0 0',
          textAlign: 'center' as const,
        }}
      >
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>Sentimos sua falta!</h1>
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
          Sua assinatura do Consultor.AI foi cancelada. Sua conta ainda está ativa no plano
          gratuito, mas os recursos premium não estarão mais disponíveis.
        </p>

        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
          Se mudou de ideia, você pode reativar sua assinatura a qualquer momento:
        </p>

        <div style={{ textAlign: 'center' as const, margin: '30px 0' }}>
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://consultor.ai'}/pricing`}
            style={{
              background: '#f59e0b',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Reativar Assinatura
          </a>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />

        <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' as const }}>
          Consultor.AI - Seu assistente de vendas inteligente
        </p>
      </div>
    </div>
  );
}
