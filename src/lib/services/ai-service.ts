/**
 * AI Service
 *
 * Generates AI-powered responses with compliance safeguards and provider fallback.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateWithGroq } from '@/lib/api/groq';
import { detectComplianceViolations } from '@/lib/ai/compliance';
import { getFallbackTemplate } from '@/lib/ai/templates';
import { decrementCredits } from '@/lib/services/credit-service';
import type { ConversationState } from '@/lib/flow-engine/types';
import type { Database } from '@/types/database';

type Lead = Database['public']['Tables']['leads']['Row'];

const MODEL_NAME = process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash';
const TEMPERATURE = parseFloat(process.env.GOOGLE_AI_TEMPERATURE || '0.7');
const MAX_TOKENS = parseInt(process.env.GOOGLE_AI_MAX_TOKENS || '500');

/**
 * Configuration for AI generation (Gemini).
 */
const generationConfig = {
  temperature: TEMPERATURE,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: MAX_TOKENS,
};

/**
 * Safety settings to prevent inappropriate content (Gemini).
 */
const safetySettings = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

export interface GenerateResponseParams {
  state: ConversationState;
  lead: Lead;
  consultantData?: {
    name?: string;
    business_name?: string;
    vertical?: string;
  };
  context?: Record<string, unknown>;
  /** User ID for credit deduction. If provided, credits are checked/deducted. */
  userId?: string;
}

type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };

function isGeminiConfigured(): boolean {
  return Boolean(process.env.GOOGLE_AI_API_KEY);
}

async function generateWithGemini(prompt: string): Promise<string> {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig,
    safetySettings: safetySettings as any,
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  if (!text) {
    throw new Error('Gemini returned empty response');
  }
  return text.trim();
}

/**
 * Generates AI response based on conversation state with compliance & fallback.
 */
export async function generateContextualResponse(
  params: GenerateResponseParams
): Promise<ServiceResult<string>> {
  try {
    const { state, lead, consultantData, context = {}, userId } = params;
    const vertical = consultantData?.vertical || 'saude';

    // Credit check — deduct 1 credit before generating AI response
    if (userId) {
      const creditResult = await decrementCredits(userId, 1);
      if (!creditResult.success) {
        return {
          success: false,
          error: creditResult.error,
        };
      }
    }

    const prompt = buildPrompt(vertical, state, lead, consultantData, context);

    let text: string | undefined;

    // Primary: Gemini
    if (isGeminiConfigured()) {
      try {
        text = await generateWithGemini(prompt);
      } catch (error) {
        console.warn('Gemini failed, falling back to Groq:', error);
      }
    }

    // Fallback: Groq
    if (!text) {
      try {
        text = await generateWithGroq(prompt, {
          temperature: TEMPERATURE,
          maxTokens: MAX_TOKENS,
        });
      } catch (error) {
        console.warn('Groq fallback failed:', error);
      }
    }

    // Final fallback: template
    if (!text) {
      return { success: true, data: getFallbackTemplate(vertical) };
    }

    // Compliance check
    const violations = detectComplianceViolations(text);
    if (violations.length > 0) {
      console.error('Compliance violations detected:', violations);
      return { success: true, data: getFallbackTemplate(vertical) };
    }

    return {
      success: true,
      data: text.trim(),
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      success: false,
      error: `Failed to generate AI response: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}

/**
 * Builds prompt based on vertical and conversation state
 */
function buildPrompt(
  vertical: string,
  state: ConversationState,
  lead: Lead,
  consultantData?: any,
  context?: Record<string, unknown>
): string {
  const basePrompt = buildBasePrompt(vertical, consultantData);
  const conversationContext = buildConversationContext(state, lead);
  const instructions = buildInstructions(vertical, state, context);

  return `${basePrompt}

${conversationContext}

${instructions}

RESPOSTA (máximo ${MAX_TOKENS} caracteres, tom acolhedor e profissional):`;
}

/**
 * Builds base system prompt
 */
function buildBasePrompt(vertical: string, consultantData?: any): string {
  const businessName = consultantData?.business_name || consultantData?.name;
  const intro = businessName
    ? `Você é um assistente virtual da ${businessName}.`
    : 'Você é um assistente virtual profissional.';

  const verticalInstructions = {
    saude: `${intro}

REGRAS OBRIGATÓRIAS (COMPLIANCE):
- NUNCA mencione preços exatos de planos (proibido pela ANS)
- NUNCA peça CPF, dados médicos ou condições pré-existentes
- NUNCA prometa "zero carência" ou "cobertura imediata"
- NUNCA faça afirmações enganosas sobre cobertura

PERMITIDO:
- Faixas de valores genéricas ("a partir de", "entre X e Y")
- Perguntar perfil (individual/família/casal/empresarial)
- Perguntar faixa etária (até 30, 31-45, 46-60, acima de 60)
- Perguntar preferência de coparticipação (sim/não)
- Recomendar tipos de planos baseado no perfil

TOM E ESTILO:
- Acolhedor e empático (saúde é sensível)
- Claro e objetivo (sem jargão médico)
- Consultivo (não apenas vendedor)
- Humano (mostre que se importa)`,

    imoveis: `${intro}

FOCO:
- Entender necessidade: tipo, localização, orçamento aproximado, finalidade
- Destacar diferenciais das propriedades
- Ser consultivo e transparente

TOM:
- Profissional mas amigável
- Entusiasta (imóveis são sonhos)
- Transparente sobre valores`,

    automoveis: `${intro}

FOCO:
- Entender: tipo de veículo, orçamento, uso
- Destacar benefícios e diferenciais
- Transparência sobre condições

TOM:
- Profissional e direto
- Focado em solução`,

    financeiro: `${intro}

FOCO:
- Entender objetivos financeiros
- Ser transparente sobre condições
- Nunca prometer retornos garantidos

TOM:
- Sério e confiável
- Educativo`,
  };

  if (vertical in verticalInstructions) {
    return verticalInstructions[vertical as keyof typeof verticalInstructions]!;
  }
  return verticalInstructions.saude;
}

/**
 * Builds conversation context from state
 */
function buildConversationContext(state: ConversationState, lead: Lead): string {
  let context = 'CONTEXTO DA CONVERSA:\n';

  if (lead.name) {
    context += `Nome do lead: ${lead.name}\n`;
  }

  if (Object.keys(state.variables).length > 0) {
    context += '\nVariáveis coletadas:\n';
    for (const [key, value] of Object.entries(state.variables)) {
      context += `- ${key}: ${JSON.stringify(value)}\n`;
    }
  }

  if (Object.keys(state.responses).length > 0) {
    context += '\nRespostas do lead:\n';
    for (const [stepId, response] of Object.entries(state.responses)) {
      context += `- ${stepId}: ${JSON.stringify(response)}\n`;
    }
  }

  return context;
}

/**
 * Builds specific instructions based on vertical and state
 */
function buildInstructions(
  vertical: string,
  state: ConversationState,
  context?: Record<string, unknown>
): string {
  if (vertical === 'saude') {
    return buildHealthInstructions(state, context);
  }

  return 'INSTRUÇÕES:\nGere uma resposta personalizada e útil para o lead baseado no contexto acima.';
}

/**
 * Builds health-specific instructions
 */
function buildHealthInstructions(
  state: ConversationState,
  _context?: Record<string, unknown>
): string {
  const profile = state.variables.perfil || state.responses.perfil;
  const age = state.variables.idade || state.responses.idade;
  const coparticipation = state.variables.coparticipacao || state.responses.coparticipacao;

  let instructions = 'INSTRUÇÕES PARA RESPOSTA:\n';

  const hasProfile = Boolean(profile);
  const hasAge = Boolean(age);
  const hasCoparticipation = Boolean(coparticipation);

  if (!hasProfile && !hasAge && !hasCoparticipation) {
    instructions += `
1. Dê boas-vindas de forma calorosa
2. Apresente-se brevemente como assistente virtual
3. Explique que vai ajudar a encontrar o plano de saúde ideal
4. Pergunte sobre o perfil (individual, casal, família ou empresarial)
5. Máximo 3-4 linhas`;
  } else if (hasProfile && hasAge && hasCoparticipation) {
    instructions += `
PERFIL COMPLETO COLETADO:
- Perfil: ${profile}
- Idade: ${age}
- Coparticipação: ${coparticipation}

TAREFA:
1. Valide empaticamente as escolhas do lead
2. Recomende 1-2 tipos de planos realistas para esse perfil
   - Exemplo: "Planos com rede credenciada regional" ou "Planos com abrangência nacional"
   - NÃO mencione marcas específicas (Amil, Bradesco, etc)
   - NÃO mencione valores exatos
3. Explique brevemente os benefícios para esse perfil
4. Inclua um call-to-action claro ("Posso te enviar as opções por WhatsApp?")
5. Tom: validação + recomendação + próximo passo
6. Máximo 5-6 linhas

IMPORTANTE:
- Seja específico para o perfil (ex: "Para uma família com sua faixa etária...")
- Mencione benefícios relevantes (ex: coparticipação = mensalidade menor)
- Crie senso de movimento ("Vou preparar algumas opções")`;
  } else {
    const missing = [];
    if (!hasProfile) missing.push('perfil');
    if (!hasAge) missing.push('faixa etária');
    if (!hasCoparticipation) missing.push('preferência de coparticipação');

    instructions += `
INFO PARCIAL:
${hasProfile ? `- Perfil: ${profile}` : ''}
${hasAge ? `- Idade: ${age}` : ''}
${hasCoparticipation ? `- Coparticipação: ${coparticipation}` : ''}

FALTANDO: ${missing.join(', ')}

TAREFA:
1. Agradeça a informação recebida
2. Explique brevemente por que precisa da próxima info
3. Pergunte sobre ${missing[0]}
4. Máximo 2-3 linhas
5. Tom: agradecimento + explicação + pergunta`;
  }

  return instructions;
}

/**
 * Fallback response when AI fails or is non-compliant.
 */
export function getFallbackResponse(vertical: string = 'saude'): string {
  return getFallbackTemplate(vertical);
}

/**
 * Checks if at least one AI provider is configured.
 */
export function isAIConfigured(): boolean {
  return Boolean(process.env.GOOGLE_AI_API_KEY || process.env.GROQ_API_KEY);
}

/**
 * Gets AI model information.
 */
export function getAIModelInfo() {
  return {
    model: MODEL_NAME,
    temperature: TEMPERATURE,
    maxTokens: MAX_TOKENS,
    configured: isAIConfigured(),
    providers: {
      gemini: Boolean(process.env.GOOGLE_AI_API_KEY),
      groq: Boolean(process.env.GROQ_API_KEY),
    },
  };
}
