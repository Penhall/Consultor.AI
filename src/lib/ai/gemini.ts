/**
 * Google AI (Gemini) Integration
 * Generates personalized responses for leads
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

const MODEL_NAME = process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash'
const TEMPERATURE = parseFloat(process.env.GOOGLE_AI_TEMPERATURE || '0.4')
const MAX_TOKENS = parseInt(process.env.GOOGLE_AI_MAX_TOKENS || '200')

/**
 * Configuration for AI generation
 */
const generationConfig = {
  temperature: TEMPERATURE,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: MAX_TOKENS,
}

/**
 * Safety settings to prevent inappropriate content
 */
const safetySettings = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
]

export interface GenerateResponseParams {
  consultantId: string
  leadMessage: string
  leadPhone: string
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  consultantData?: {
    name: string
    businessName: string
    vertical: string
  }
}

/**
 * Generates a personalized AI response for a lead
 */
export async function generateAIResponse(params: GenerateResponseParams): Promise<string> {
  const {
    leadMessage,
    conversationHistory = [],
    consultantData,
  } = params

  // Build conversation context
  const historyContext = conversationHistory.length > 0
    ? conversationHistory
        .map(msg => `${msg.role === 'user' ? 'Lead' : 'Você'}: ${msg.content}`)
        .join('\n')
    : 'Esta é a primeira mensagem do lead.'

  // Build system prompt based on vertical
  const systemPrompt = buildSystemPrompt(consultantData?.vertical || 'saude', consultantData)

  // Build full prompt
  const fullPrompt = `${systemPrompt}

HISTÓRICO DA CONVERSA:
${historyContext}

NOVA MENSAGEM DO LEAD:
${leadMessage}

RESPOSTA (máximo ${MAX_TOKENS} caracteres, tom acolhedor e profissional):`

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig,
      safetySettings: safetySettings as any,
    })

    const result = await model.generateContent(fullPrompt)
    const response = result.response
    const text = response.text()

    return text.trim()
  } catch (error) {
    console.error('Error generating AI response:', error)

    // Fallback response
    return getFallbackResponse(consultantData?.vertical || 'saude')
  }
}

/**
 * Builds system prompt based on vertical
 */
function buildSystemPrompt(vertical: string, consultantData?: any): string {
  const basePrompt = `Você é um assistente virtual profissional e acolhedor${
    consultantData?.businessName ? ` da ${consultantData.businessName}` : ''
  }.

INSTRUÇÕES IMPORTANTES:
- Seja empático, claro e direto
- Não use jargão técnico desnecessário
- Faça perguntas para qualificar o lead
- Ofereça ajuda genuína, não apenas venda`

  const verticalPrompts = {
    saude: `${basePrompt}
- Nunca mencione preços exatos (é proibido por lei)
- Nunca peça CPF, dados médicos ou condições pré-existentes
- Nunca prometa "zero carência" ou "cobertura imediata" (ilegal)
- Foque em entender: perfil (individual/família), faixa etária, preferência de coparticipação
- Seja humano e acolhedor ao falar de saúde`,

    imoveis: `${basePrompt}
- Foque em entender: tipo de imóvel, localização, orçamento, finalidade (morar/investir)
- Destaque diferenciais da propriedade
- Seja consultivo, não apenas vendedor`,

    automoveis: `${basePrompt}
- Foque em entender: tipo de veículo, orçamento, uso (pessoal/comercial)
- Destaque benefícios e diferenciais
- Seja consultivo e transparente`,

    financeiro: `${basePrompt}
- Foque em entender necessidades financeiras
- Seja transparente sobre condições
- Nunca prometa retornos garantidos`,
  }

  return verticalPrompts[vertical as keyof typeof verticalPrompts] || verticalPrompts.saude
}

/**
 * Fallback responses when AI fails
 */
function getFallbackResponse(vertical: string): string {
  const fallbacks = {
    saude: 'Olá! Obrigado por entrar em contato. Estou aqui para te ajudar a encontrar o melhor plano de saúde para você. Pode me contar um pouco sobre o que você está procurando?',
    imoveis: 'Olá! Seja bem-vindo(a)! Estou aqui para te ajudar a encontrar o imóvel ideal. O que você está procurando?',
    automoveis: 'Olá! Obrigado pelo contato. Vou te ajudar a encontrar o veículo perfeito. Qual tipo de veículo você tem em mente?',
    financeiro: 'Olá! Obrigado por entrar em contato. Como posso te ajudar com seus objetivos financeiros?',
  }

  return fallbacks[vertical as keyof typeof fallbacks] || fallbacks.saude
}

/**
 * Checks if API key is configured
 */
export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GOOGLE_AI_API_KEY)
}

/**
 * Gets model information
 */
export function getModelInfo() {
  return {
    model: MODEL_NAME,
    temperature: TEMPERATURE,
    maxTokens: MAX_TOKENS,
    configured: isGeminiConfigured(),
  }
}
