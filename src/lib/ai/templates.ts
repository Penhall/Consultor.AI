/**
 * Fallback response templates when AI providers fail or are non-compliant.
 * Keep short, friendly and compliant (no pricing or sensitive data).
 */

const templates: Record<string, string> = {
  saude:
    'Olá! Obrigado por entrar em contato. Vou te ajudar a encontrar um plano de saúde adequado. Prefere um plano individual, casal, família ou empresarial? Também me diga a faixa etária do titular e se prefere com ou sem coparticipação.',
  imoveis:
    'Olá! Obrigado pelo contato. Para te sugerir o melhor imóvel, me conta tipo (casa/apto/comercial), bairro de interesse e faixa de orçamento aproximada.',
  automoveis:
    'Olá! Vamos encontrar o veículo ideal. Qual tipo você procura (hatch, sedan, SUV) e qual a faixa de orçamento aproximada?',
  financeiro:
    'Olá! Posso te ajudar com serviços financeiros. Qual seu objetivo principal (planejar finanças, investir, crédito) e valor aproximado que pretende trabalhar?',
}

export function getFallbackTemplate(vertical: string = 'saude'): string {
  return templates[vertical] ?? templates.saude
}
