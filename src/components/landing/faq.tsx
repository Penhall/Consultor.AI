/**
 * FAQ Component
 *
 * Accordion with common questions in Portuguese.
 */

'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
  {
    question: 'Como funciona o Consultor.AI?',
    answer:
      'O Consultor.AI conecta-se ao seu WhatsApp Business e automatiza a qualificação de leads usando inteligência artificial. Quando um potencial cliente envia mensagem, o bot inicia uma conversa personalizada para coletar informações essenciais como perfil, faixa etária e preferências.',
  },
  {
    question: 'Preciso ter conhecimento técnico?',
    answer:
      'Não! O Consultor.AI foi feito para consultores de vendas. A configuração é simples: conecte seu WhatsApp, personalize seu fluxo de conversa pelo dashboard, e pronto. Em menos de 30 minutos você estará operando.',
  },
  {
    question: 'O bot substitui o consultor?',
    answer:
      'De forma alguma. O Consultor.AI é um assistente que faz a triagem inicial 24/7. Quando o lead está qualificado, você assume a conversa pessoalmente para fechar a venda. O bot mantém sua identidade e tom de voz.',
  },
  {
    question: 'Quais integrações estão disponíveis?',
    answer:
      'Atualmente oferecemos integração com RD Station e Pipedrive para sincronização automática de leads. HubSpot e Agendor estão no roadmap. Também temos integração com a API do WhatsApp Business da Meta.',
  },
  {
    question: 'O sistema é seguro e está de acordo com a LGPD?',
    answer:
      'Sim. Todos os dados são criptografados, usamos Row-Level Security no banco de dados, e seguimos as diretrizes da LGPD. A IA é treinada para nunca solicitar dados sensíveis como CPF ou histórico médico via WhatsApp.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim, não há fidelidade. Você pode cancelar sua assinatura a qualquer momento pelo dashboard. Seus dados ficam disponíveis no plano gratuito e os créditos comprados avulso nunca expiram.',
  },
  {
    question: 'O que são créditos de IA?',
    answer:
      'Cada resposta gerada pela IA consome 1 crédito. O plano gratuito inclui 20 créditos/mês, o Pro 200 créditos/mês e o Agência 1000 créditos/mês. Você também pode comprar pacotes avulsos de 50 créditos.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white px-6 py-24" id="faq">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="mt-12 space-y-2">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="rounded-lg border">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-medium text-slate-900">{item.question}</span>
                <span className="ml-4 text-slate-400">{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="border-t px-6 py-4">
                  <p className="text-sm leading-6 text-slate-600">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
