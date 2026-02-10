/**
 * Features Grid Component
 *
 * Six feature cards highlighting the platform's capabilities.
 */

const FEATURES = [
  {
    title: 'Qualificação Automática',
    description:
      'IA qualifica leads automaticamente via WhatsApp seguindo seu fluxo personalizado de perguntas.',
    icon: '🎯',
  },
  {
    title: 'Disponível 24/7',
    description:
      'Responde leads a qualquer hora do dia, mesmo quando você está offline ou atendendo outro cliente.',
    icon: '⏰',
  },
  {
    title: 'Dashboard Completo',
    description: 'Acompanhe leads, conversas, métricas e pipeline de vendas em tempo real.',
    icon: '📊',
  },
  {
    title: 'Fluxos Personalizados',
    description:
      'Crie fluxos de conversa customizados para diferentes perfis de clientes e verticais.',
    icon: '🔄',
  },
  {
    title: 'Integração CRM',
    description: 'Sincronize leads automaticamente com RD Station, Pipedrive e outros CRMs.',
    icon: '🔗',
  },
  {
    title: 'Conformidade ANS',
    description:
      'IA treinada para seguir regulamentações da ANS e LGPD. Sem promessas de preço ou dados sensíveis.',
    icon: '✅',
  },
];

export function FeaturesGrid() {
  return (
    <section className="bg-white px-6 py-24" id="features">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tudo que você precisa para vender mais
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Ferramentas inteligentes para consultores de planos de saúde
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(feature => (
            <div
              key={feature.title}
              className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
