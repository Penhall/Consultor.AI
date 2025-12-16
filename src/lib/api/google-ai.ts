import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Google AI Client Wrapper
 *
 * Wrapper around Google's Generative AI SDK for generating AI responses
 * in the conversation flow.
 *
 * Documentation: https://ai.google.dev/docs
 */

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export class GoogleAIClient {
  private client: GoogleGenerativeAI;
  private defaultModel: string;
  private defaultTemperature: number;
  private defaultMaxTokens: number;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
    }

    this.client = new GoogleGenerativeAI(apiKey);
    this.defaultModel = process.env.GOOGLE_AI_MODEL || 'gemini-pro';
    this.defaultTemperature = parseFloat(process.env.GOOGLE_AI_TEMPERATURE || '0.4');
    this.defaultMaxTokens = parseInt(process.env.GOOGLE_AI_MAX_TOKENS || '200', 10);
  }

  /**
   * Generate a response from Google AI based on the prompt
   *
   * @param prompt - The prompt to send to the AI
   * @param options - Optional configuration overrides
   * @returns The generated text response
   *
   * @example
   * ```ts
   * const client = new GoogleAIClient();
   * const response = await client.generateResponse(
   *   'Recomende planos de saúde para: família, 35 anos, sem coparticipação'
   * );
   * ```
   */
  async generateResponse(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({
        model: options?.model || this.defaultModel,
      });

      const generationConfig = {
        temperature: options?.temperature ?? this.defaultTemperature,
        maxOutputTokens: options?.maxTokens ?? this.defaultMaxTokens,
      };

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No response generated from Google AI');
      }

      return text;
    } catch (error) {
      console.error('Google AI API error:', error);
      throw new AIServiceError('Failed to generate response from Google AI', error);
    }
  }

  /**
   * Generate a response for lead qualification
   *
   * @param leadData - Information about the lead
   * @returns Personalized recommendation
   *
   * @example
   * ```ts
   * const recommendation = await client.generateLeadResponse({
   *   perfil: 'familia',
   *   idade: '34-38',
   *   coparticipacao: 'nao',
   *   vertical: 'saude'
   * });
   * ```
   */
  async generateLeadResponse(leadData: Record<string, string>): Promise<string> {
    const { perfil, idade, coparticipacao, vertical = 'saude' } = leadData;

    // Build context-specific prompt based on vertical
    let prompt = '';

    if (vertical === 'saude') {
      prompt = `Você é um assistente de vendas especializado em planos de saúde.

Com base nas seguintes informações do lead:
- Perfil: ${perfil}
- Faixa etária: ${idade}
- Preferência de coparticipação: ${coparticipacao === 'sim' ? 'Com coparticipação' : 'Sem coparticipação'}

Gere uma recomendação personalizada de planos de saúde. Inclua:
1. 2-3 opções de planos adequados ao perfil
2. Faixa de preço aproximada (em reais)
3. Principais benefícios de cada plano

IMPORTANTE:
- NÃO mencione preços específicos, apenas faixas (ex: "a partir de R$ X")
- NÃO garanta aprovação ou cobertura específica
- Mencione que os valores e condições podem variar
- Mantenha tom profissional mas amigável
- Limite a resposta a 150 palavras

Responda em português brasileiro.`;
    } else {
      // Generic prompt for other verticals
      prompt = `Gere uma recomendação personalizada com base nos seguintes dados do lead:
${JSON.stringify(leadData, null, 2)}

Mantenha a resposta profissional, clara e em até 150 palavras.`;
    }

    return this.generateResponse(prompt);
  }

  /**
   * Generate a chat completion with conversation history
   *
   * @param messages - Array of previous messages
   * @param newMessage - The new user message
   * @returns AI response
   */
  async chat(
    messages: Array<{ role: 'user' | 'model'; content: string }>,
    newMessage: string
  ): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.defaultModel,
      });

      const chat = model.startChat({
        history: messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature: this.defaultTemperature,
          maxOutputTokens: this.defaultMaxTokens,
        },
      });

      const result = await chat.sendMessage(newMessage);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No response generated from chat');
      }

      return text;
    } catch (error) {
      console.error('Google AI chat error:', error);
      throw new AIServiceError('Failed to generate chat response', error);
    }
  }
}

/**
 * Custom error class for AI service errors
 */
export class AIServiceError extends Error {
  constructor(
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

/**
 * Singleton instance of Google AI client
 */
export const googleAIClient = new GoogleAIClient();
