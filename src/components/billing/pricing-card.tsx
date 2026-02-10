/**
 * Pricing Card Component
 *
 * Displays a single plan with name, price, features, and CTA button.
 * Supports highlighted variant for recommended plan.
 */

'use client';

import type { ReactNode } from 'react';

interface PricingCardProps {
  name: string;
  priceBRL: number;
  features: string[];
  isRecommended?: boolean;
  children?: ReactNode;
}

export function PricingCard({
  name,
  priceBRL,
  features,
  isRecommended = false,
  children,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-2xl border p-8 ${
        isRecommended
          ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary'
          : 'border-border bg-card'
      }`}
    >
      {isRecommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
          Mais popular
        </span>
      )}

      <h3 className="text-xl font-bold">{name}</h3>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">
          {priceBRL === 0 ? 'Grátis' : `R$${priceBRL}`}
        </span>
        {priceBRL > 0 && <span className="text-sm text-muted-foreground">/mês</span>}
      </div>

      <ul className="mt-6 space-y-3">
        {features.map(feature => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-8">{children}</div>
    </div>
  );
}
