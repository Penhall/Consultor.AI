import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-8">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Consultor.AI
        </h1>
        <p className="mb-8 text-xl text-slate-600">
          Assistente de Vendas por WhatsApp com Inteligência Artificial
        </p>
        <p className="mb-12 text-lg text-slate-500">
          Automatize a qualificação de leads, nutrição e agendamentos 24/7 com IA personalizada
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/cadastro">Começar Agora</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Fazer Login</Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Qualificação Automática</h3>
            <p className="text-sm text-slate-600">
              IA qualifica leads automaticamente via WhatsApp seguindo seu fluxo personalizado
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Disponível 24/7</h3>
            <p className="text-sm text-slate-600">
              Responde leads a qualquer hora do dia, mesmo quando você está offline
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Dashboard Completo</h3>
            <p className="text-sm text-slate-600">
              Acompanhe todos os leads, conversas e métricas em tempo real
            </p>
          </div>
        </div>

        <footer className="mt-16 text-sm text-slate-500">
          <p>Consultor.AI - Desenvolvido com IA de última geração</p>
        </footer>
      </div>
    </main>
  );
}
