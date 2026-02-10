/**
 * Testimonials Component
 *
 * Three consultant testimonial cards with name, role, and quote.
 */

const TESTIMONIALS = [
  {
    name: 'Carlos Silva',
    role: 'Consultor de Planos de Saúde - SP',
    quote:
      'O Consultor.AI triplicou minha captação de leads. Agora consigo atender muito mais clientes sem perder a qualidade no primeiro contato.',
  },
  {
    name: 'Ana Santos',
    role: 'Corretora de Saúde - RJ',
    quote:
      'A qualificação automática é incrível. Os leads já chegam com todas as informações que preciso para fazer a cotação na hora.',
  },
  {
    name: 'Roberto Oliveira',
    role: 'Agência de Planos - MG',
    quote:
      'Minha equipe usa o dashboard para acompanhar tudo em tempo real. A integração com CRM economiza horas de trabalho manual.',
  },
];

export function Testimonials() {
  return (
    <section className="bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            O que dizem nossos consultores
          </h2>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {TESTIMONIALS.map(testimonial => (
            <div key={testimonial.name} className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm leading-6 text-slate-600">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="mt-4 border-t pt-4">
                <p className="font-semibold text-slate-900">{testimonial.name}</p>
                <p className="text-xs text-slate-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
