import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { Providers } from '@/components/providers';
import { isValidSkinId } from '@/lib/skin/types';

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
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const rawSkin = cookieStore.get('skin')?.value;
  // Sanitizar: rejeitar valores inválidos/tampered antes de injetar no HTML
  const skin = isValidSkinId(rawSkin) ? rawSkin : 'corporate';

  return (
    <html
      lang="pt-BR"
      data-skin={skin}
      className={skin === 'noturno' ? 'dark' : ''}
      suppressHydrationWarning
    >
      <body className={inter.className}>
        <Providers initialSkin={skin}>{children}</Providers>
      </body>
    </html>
  );
}
