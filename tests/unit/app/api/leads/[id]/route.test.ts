/**
 * Lead Detail API Tests - GET/PATCH/DELETE /api/leads/[id]
 *
 * Tests individual lead operations with authentication and authorization
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PATCH, DELETE } from '@/app/api/leads/[id]/route'
import { NextRequest } from 'next/server'
import * as supabaseServer from '@/lib/supabase/server'
import * as leadService from '@/lib/services/lead-service'
import { mockLeads } from '@tests/fixtures/leads'

// Mock modules
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/services/lead-service')

const mockContext = {
  params: { id: 'lead-test-1' },
}

describe('GET /api/leads/[id]', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      auth: {
        getSession: vi.fn(),
      },
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase)
  })

  it('deve retornar lead específico', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    vi.mocked(leadService.getLeadById).mockResolvedValue({
      success: true,
      data: mockLeads[0],
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads/lead-test-1')
    const response = await GET(request, mockContext)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('lead-test-1')
    expect(leadService.getLeadById).toHaveBeenCalledWith('lead-test-1')
  })

  it('deve retornar 401 se não autenticado', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads/lead-test-1')
    const response = await GET(request, mockContext)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Não autenticado')
  })

  it('deve retornar 404 se lead não encontrado', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    vi.mocked(leadService.getLeadById).mockResolvedValue({
      success: false,
      error: 'Lead não encontrado',
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads/non-existent')
    const response = await GET(request, { params: { id: 'non-existent' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Lead não encontrado')
  })

  it('deve retornar 500 em caso de erro interno', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    vi.mocked(leadService.getLeadById).mockResolvedValue({
      success: false,
      error: 'Database connection failed',
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads/lead-test-1')
    const response = await GET(request, mockContext)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
  })
})

describe('PATCH /api/leads/[id]', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      auth: {
        getSession: vi.fn(),
      },
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase)
  })

  it('deve atualizar lead com dados válidos', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    const updatedLead = { ...mockLeads[0], name: 'João Updated', score: 90 }

    vi.mocked(leadService.updateLead).mockResolvedValue({
      success: true,
      data: updatedLead,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads/lead-test-1', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'João Updated',
        score: 90,
      }),
    })
    const response = await PATCH(request, mockContext)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.name).toBe('João Updated')
    expect(data.data.score).toBe(90)
    expect(leadService.updateLead).toHaveBeenCalledWith('lead-test-1', {
      name: 'João Updated',
      score: 90,
    })
  })

  it('deve atualizar apenas campos fornecidos', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    vi.mocked(leadService.updateLead).mockResolvedValue({
      success: true,
      data: { ...mockLeads[0], status: 'qualificado' },
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads/lead-test-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'qualificado' }),
    })
    const response = await PATCH(request, mockContext)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(leadService.updateLead).toHaveBeenCalledWith('lead-test-1', {
      status: 'qualificado',
    })
  })

  it('deve retornar 400 se dados inválidos', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    // Act: Invalid score (> 100)
    const request = new NextRequest('http://localhost:3000/api/leads/lead-test-1', {
      method: 'PATCH',
      body: JSON.stringify({ score: 150 }),
    })
    const response = await PATCH(request, mockContext)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Dados inválidos')
  })

  it('deve retornar 401 se não autenticado', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads/lead-test-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
    })
    const response = await PATCH(request, mockContext)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Não autenticado')
  })

  it('deve retornar 404 se lead não encontrado', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    vi.mocked(leadService.updateLead).mockResolvedValue({
      success: false,
      error: 'Lead não encontrado',
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads/non-existent', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
    })
    const response = await PATCH(request, { params: { id: 'non-existent' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Lead não encontrado')
  })
})

describe('DELETE /api/leads/[id]', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      auth: {
        getSession: vi.fn(),
      },
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase)
  })

  it('deve deletar lead com sucesso', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    vi.mocked(leadService.deleteLead).mockResolvedValue({
      success: true,
      data: undefined,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads/lead-test-1', {
      method: 'DELETE',
    })
    const response = await DELETE(request, mockContext)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.message).toBe('Lead deletado com sucesso')
    expect(leadService.deleteLead).toHaveBeenCalledWith('lead-test-1')
  })

  it('deve retornar 401 se não autenticado', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads/lead-test-1', {
      method: 'DELETE',
    })
    const response = await DELETE(request, mockContext)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Não autenticado')
  })

  it('deve retornar 500 se falhar ao deletar', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    vi.mocked(leadService.deleteLead).mockResolvedValue({
      success: false,
      error: 'Failed to delete lead',
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads/lead-test-1', {
      method: 'DELETE',
    })
    const response = await DELETE(request, mockContext)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to delete lead')
  })
})
