/**
 * Hero Component
 *
 * Landing page hero with value proposition, subtitle, and CTA.
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Venda mais com{' '}
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Inteligência Artificial
          </span>
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-600">
          Automatize a captação, qualificação e nutrição de leads via WhatsApp. Seu assistente de
          vendas 24/7 com IA personalizada para consultores de planos de saúde.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="px-8">
            <Link href="/auth/signup">Começar Gratuitamente</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/pricing">Ver Planos</Link>
          </Button>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Sem cartão de crédito. Comece com 20 créditos grátis.
        </p>
      </div>
    </section>
  );
}
