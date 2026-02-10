/**
 * Groq client wrapper (OpenAI-compatible endpoint).
 */

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile'
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export interface GroqOptions {
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export async function generateWithGroq(
  prompt: string,
  options: GroqOptions = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  const { temperature = 0.7, maxTokens = 500, systemPrompt } = options

  const body = {
    model: DEFAULT_MODEL,
    temperature,
    max_tokens: maxTokens,
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt },
    ],
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Groq request failed (${response.status}): ${detail}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Groq response missing content')
  }

  return content.trim()
}
