/**
 * Teste de Exemplo
 *
 * Este é um teste simples para validar que a infraestrutura
 * de testes está funcionando corretamente.
 *
 * Para rodar: npm run test
 */

import { describe, it, expect, vi } from 'vitest'

describe('Infraestrutura de Testes', () => {
  it('deve executar testes básicos', () => {
    const resultado = 2 + 2
    expect(resultado).toBe(4)
  })

  it('deve validar strings', () => {
    const mensagem = 'Consultor.AI'
    expect(mensagem).toContain('Consultor')
    expect(mensagem).toHaveLength(12)
  })

  it('deve validar arrays', () => {
    const leads = ['novo', 'em_contato', 'qualificado', 'fechado']
    expect(leads).toHaveLength(4)
    expect(leads).toContain('qualificado')
  })

  it('deve validar objetos', () => {
    const lead = {
      id: 'lead-1',
      name: 'João Silva',
      status: 'qualificado',
      score: 85,
    }

    expect(lead).toHaveProperty('name')
    expect(lead.status).toBe('qualificado')
    expect(lead.score).toBeGreaterThan(50)
  })

  it('deve validar valores booleanos', () => {
    const isTestePronto = true
    expect(isTestePronto).toBe(true)
    expect(isTestePronto).toBeTruthy()
  })
})

describe('Testes Assíncronos', () => {
  it('deve resolver promises', async () => {
    const promise = Promise.resolve('sucesso')
    await expect(promise).resolves.toBe('sucesso')
  })

  it('deve funcionar com async/await', async () => {
    const aguardar = async () => {
      return 'completado'
    }

    const resultado = await aguardar()
    expect(resultado).toBe('completado')
  })
})

describe('Mocks e Fixtures', () => {
  it('deve ter acesso às variáveis de ambiente', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.ENCRYPTION_KEY).toBeDefined()
  })

  it('deve permitir mocks de funções', () => {
    const mockFunction = vi.fn()

    mockFunction('teste')
    mockFunction('teste2')

    expect(mockFunction).toHaveBeenCalledTimes(2)
    expect(mockFunction).toHaveBeenCalledWith('teste')
  })
})
