import { vi } from 'vitest';

/**
 * Creates a mock Google AI client for testing
 *
 * @example
 * ```ts
 * import { createMockGoogleAIClient } from '@/tests/mocks/google-ai';
 *
 * const mockGoogleAI = createMockGoogleAIClient();
 * mockGoogleAI.generateResponse.mockResolvedValue('Mocked AI response');
 * ```
 */
export function createMockGoogleAIClient() {
  return {
    generateResponse: vi.fn().mockResolvedValue('Mocked AI response'),
    generateLeadResponse: vi.fn().mockResolvedValue(
      'Com base no seu perfil, recomendo os seguintes planos...'
    ),
    chat: vi.fn().mockResolvedValue('Mocked chat response'),
  };
}

/**
 * Mock Google Generative AI SDK
 */
export function createMockGoogleGenerativeAI() {
  return {
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: vi.fn().mockReturnValue('Mocked AI response'),
        },
      }),
      startChat: vi.fn(() => ({
        sendMessage: vi.fn().mockResolvedValue({
          response: {
            text: vi.fn().mockReturnValue('Mocked chat response'),
          },
        }),
      })),
    })),
  };
}

/**
 * Mock response for lead recommendation
 */
export const mockLeadRecommendation = `Com base no seu perfil (Família, 34-38 anos, sem coparticipação), recomendo:

1. Unimed Nacional Familiar - a partir de R$ 1.850/mês
2. Amil Blue Família - a partir de R$ 1.720/mês
3. SulAmérica Clássico Familiar - a partir de R$ 1.980/mês

Todos incluem cobertura nacional, sem carência e rede credenciada ampla.

Os valores podem variar conforme região e condições específicas.`;
