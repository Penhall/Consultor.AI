/**
 * Leads API Tests - GET /api/leads & POST /api/leads
 *
 * Tests list and creation of leads with authentication, validation, and edge cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/leads/route';
import { NextRequest } from 'next/server';
import * as supabaseServer from '@/lib/supabase/server';
import * as leadService from '@/lib/services/lead-service';
import { mockLeads } from '@tests/fixtures/leads';

// Mock modules
vi.mock('@/lib/supabase/server');
vi.mock('@/lib/services/lead-service');

describe('GET /api/leads', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default Supabase mock
    mockSupabase = {
      auth: {
        getSession: vi.fn(),
      },
      from: vi.fn(),
    };

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase);
  });

  it('deve listar leads com paginação padrão', async () => {
    // Arrange: User authenticated
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    // Arrange: Consultant exists
    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'consultant-test-1' },
            error: null,
          }),
        }),
      }),
    });
    mockSupabase.from = fromMock;

    // Arrange: Lead service returns paginated data
    vi.mocked(leadService.listLeads).mockResolvedValue({
      success: true,
      data: {
        data: mockLeads,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    });

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads?page=1&limit=20');
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.data).toHaveLength(2);
    expect(data.data.pagination.page).toBe(1);
    expect(leadService.listLeads).toHaveBeenCalledWith(
      'consultant-test-1',
      expect.objectContaining({
        page: 1,
        limit: 20,
      })
    );
  });

  it('deve filtrar por status', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'consultant-test-1' },
            error: null,
          }),
        }),
      }),
    });

    const qualifiedLeads = mockLeads.filter(l => l.status === 'qualificado');
    vi.mocked(leadService.listLeads).mockResolvedValue({
      success: true,
      data: {
        data: qualifiedLeads,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      },
    });

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/leads?page=1&limit=20&status=qualificado'
    );
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(leadService.listLeads).toHaveBeenCalledWith('consultant-test-1', {
      page: 1,
      limit: 20,
      status: 'qualificado',
      orderBy: 'created_at',
      order: 'desc',
    });
  });

  it('deve filtrar por search', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'consultant-test-1' },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(leadService.listLeads).mockResolvedValue({
      success: true,
      data: {
        data: [mockLeads[0]!],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      },
    });

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads?page=1&limit=20&search=João');
    const response = await GET(request);
    await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(leadService.listLeads).toHaveBeenCalledWith('consultant-test-1', {
      page: 1,
      limit: 20,
      search: 'João',
      orderBy: 'created_at',
      order: 'desc',
    });
  });

  it('deve ordenar por campo especificado', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'consultant-test-1' },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(leadService.listLeads).mockResolvedValue({
      success: true,
      data: {
        data: mockLeads,
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1, hasNext: false, hasPrev: false },
      },
    });

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/leads?page=1&limit=20&orderBy=score&order=asc'
    );
    const response = await GET(request);
    await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(leadService.listLeads).toHaveBeenCalledWith('consultant-test-1', {
      page: 1,
      limit: 20,
      orderBy: 'score',
      order: 'asc',
    });
  });

  it('deve retornar 401 se não autenticado', async () => {
    // Arrange: No session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads');
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autenticado');
  });

  it('deve retornar 404 se consultant não encontrado', async () => {
    // Arrange: User authenticated
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    // Arrange: No consultant found
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }),
    });

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads');
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Perfil de consultor não encontrado');
  });

  it('deve retornar 400 se parâmetros inválidos', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'consultant-test-1' },
            error: null,
          }),
        }),
      }),
    });

    // Act: Invalid page number
    const request = new NextRequest('http://localhost:3000/api/leads?page=0');
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Parâmetros inválidos');
  });

  it('deve retornar 500 se service falhar', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'consultant-test-1' },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(leadService.listLeads).mockResolvedValue({
      success: false,
      error: 'Database error',
    });

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads?page=1&limit=20');
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database error');
  });
});

describe('POST /api/leads', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      auth: {
        getSession: vi.fn(),
      },
      from: vi.fn(),
    };

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase);
  });

  it('deve criar lead com dados válidos', async () => {
    // Arrange: User authenticated
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    // Arrange: Consultant exists with available quota
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'consultant-test-1',
              monthly_lead_limit: 20,
              leads_count_current_month: 5,
            },
            error: null,
          }),
        }),
      }),
    });

    const newLead = {
      ...mockLeads[0]!,
      id: 'new-lead-id',
    };

    vi.mocked(leadService.createLead).mockResolvedValue({
      success: true,
      data: newLead,
    });

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        whatsapp_number: '+5511999998888',
        name: 'João Silva',
        status: 'novo',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('new-lead-id');
    expect(leadService.createLead).toHaveBeenCalledWith('consultant-test-1', {
      whatsapp_number: '+5511999998888',
      name: 'João Silva',
      status: 'novo',
    });
  });

  it('deve rejeitar whatsapp_number inválido', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'consultant-test-1',
              monthly_lead_limit: 20,
              leads_count_current_month: 5,
            },
            error: null,
          }),
        }),
      }),
    });

    // Act: Invalid WhatsApp number
    const request = new NextRequest('http://localhost:3000/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        whatsapp_number: '11999998888', // Missing +55
        name: 'João Silva',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Dados inválidos');
    expect(data.details).toBeDefined();
  });

  it('deve aplicar valores padrão', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'consultant-test-1',
              monthly_lead_limit: 20,
              leads_count_current_month: 5,
            },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(leadService.createLead).mockResolvedValue({
      success: true,
      data: { ...mockLeads[0]!, status: 'novo' },
    });

    // Act: No status provided
    const request = new NextRequest('http://localhost:3000/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        whatsapp_number: '+5511999998888',
      }),
    });
    const response = await POST(request);
    await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(leadService.createLead).toHaveBeenCalledWith(
      'consultant-test-1',
      expect.objectContaining({
        whatsapp_number: '+5511999998888',
        status: 'novo', // Default value
      })
    );
  });

  it('deve retornar 403 se limite mensal excedido', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    // Arrange: Consultant at limit
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'consultant-test-1',
              monthly_lead_limit: 20,
              leads_count_current_month: 20, // At limit
            },
            error: null,
          }),
        }),
      }),
    });

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        whatsapp_number: '+5511999998888',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Limite mensal');
  });

  it('deve retornar 401 se não autenticado', async () => {
    // Arrange: No session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        whatsapp_number: '+5511999998888',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Não autenticado');
  });

  it('deve retornar 404 se consultant não encontrado', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }),
    });

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        whatsapp_number: '+5511999998888',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Perfil de consultor não encontrado');
  });

  it('deve retornar 400 se service falhar', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'consultant-test-1',
              monthly_lead_limit: 20,
              leads_count_current_month: 5,
            },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(leadService.createLead).mockResolvedValue({
      success: false,
      error: 'Duplicate whatsapp_number',
    });

    // Act
    const request = new NextRequest('http://localhost:3000/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        whatsapp_number: '+5511999998888',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Duplicate whatsapp_number');
  });
});
