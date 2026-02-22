/**
 * Landing Page
 *
 * Marketing page with Hero, Features, Testimonials, FAQ, Footer, and Cookie Consent.
 */

import Link from 'next/link';
import { Hero } from '@/components/landing/hero';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { Testimonials } from '@/components/landing/testimonials';
import { FAQ } from '@/components/landing/faq';
import { Footer } from '@/components/landing/footer';
import { CookieConsentBanner } from '@/components/cookie-consent/banner';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">CA</span>
          </div>
          <span className="text-lg font-semibold text-slate-900">Consultor.AI</span>
        </div>
        <Link
          href="/auth/login"
          className="text-sm font-medium text-slate-700 hover:text-blue-600"
        >
          Entrar
        </Link>
      </nav>
      <Hero />
      <FeaturesGrid />
      <Testimonials />
      <FAQ />
      <Footer />
      <CookieConsentBanner />
    </main>
  );
}
