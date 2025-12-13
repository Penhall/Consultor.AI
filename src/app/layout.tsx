import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Consultor.AI - AI-Powered WhatsApp Sales Assistant',
  description:
    'Automatize a qualificação de leads e agendamentos via WhatsApp com assistentes de IA personalizados',
  keywords: [
    'WhatsApp',
    'Sales Assistant',
    'Lead Qualification',
    'AI',
    'Automation',
    'Plano de Saúde',
    'Imobiliária',
  ],
  authors: [{ name: 'Consultor.AI Team' }],
  creator: 'Consultor.AI',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    title: 'Consultor.AI',
    description: 'Assistente de vendas por WhatsApp com IA',
    siteName: 'Consultor.AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consultor.AI',
    description: 'Assistente de vendas por WhatsApp com IA',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
