/**
 * Landing Page
 *
 * Marketing page with Hero, Features, Testimonials, FAQ, Footer, and Cookie Consent.
 */

import { Hero } from '@/components/landing/hero';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { Testimonials } from '@/components/landing/testimonials';
import { FAQ } from '@/components/landing/faq';
import { Footer } from '@/components/landing/footer';
import { CookieConsentBanner } from '@/components/cookie-consent/banner';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturesGrid />
      <Testimonials />
      <FAQ />
      <Footer />
      <CookieConsentBanner />
    </main>
  );
}
