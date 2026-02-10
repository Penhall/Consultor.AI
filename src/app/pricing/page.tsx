/**
 * Pricing Page
 *
 * Public page displaying 3 plan cards with checkout CTAs.
 * Authenticated subscribers see "Gerenciar Assinatura" instead.
 */

import { PricingCard } from '@/components/billing/pricing-card';
import { CheckoutButton } from '@/components/billing/checkout-button';
import { FREEMIUM_PLAN, PLAN_CONFIGS } from '@/lib/payment/plans';

export const metadata = {
  title: 'Preços | Consultor.AI',
  description: 'Escolha o plano ideal para o seu negócio de consultoria.',
};

export default function PricingPage() {
  const proPlan = PLAN_CONFIGS.pro;
  const agenciaPlan = PLAN_CONFIGS.agencia;

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Planos e Preços</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Escolha o plano ideal para automatizar seu atendimento e crescer suas vendas.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {/* Freemium */}
        <PricingCard
          name={FREEMIUM_PLAN.name}
          priceBRL={FREEMIUM_PLAN.priceBRL}
          features={[...FREEMIUM_PLAN.features]}
        >
          <a
            href="/auth/signup"
            className="block w-full rounded-lg border border-border bg-background px-6 py-3 text-center text-sm font-semibold transition-colors hover:bg-accent"
          >
            Começar grátis
          </a>
        </PricingCard>

        {/* Pro (recommended) */}
        <PricingCard
          name={proPlan.name}
          priceBRL={proPlan.priceBRL}
          features={proPlan.features}
          isRecommended
        >
          <CheckoutButton planId="pro" label="Assinar Pro" />
        </PricingCard>

        {/* Agência */}
        <PricingCard
          name={agenciaPlan.name}
          priceBRL={agenciaPlan.priceBRL}
          features={agenciaPlan.features}
        >
          <CheckoutButton planId="agencia" label="Assinar Agência" variant="outline" />
        </PricingCard>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-xl font-semibold">Precisa de mais créditos?</h2>
        <p className="mt-2 text-muted-foreground">
          Compre pacotes de 50 créditos avulsos por R$19,90. Os créditos comprados nunca expiram.
        </p>
      </div>
    </main>
  );
}
