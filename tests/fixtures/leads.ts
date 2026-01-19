/**
 * Test Fixtures: Leads
 * Mock data para testes de leads e conversações
 */

export const mockLeads = [
  {
    id: 'lead-test-1',
    consultant_id: 'consultant-test-1',
    whatsapp_number: '+5511999998888',
    name: 'João Silva',
    email: null,
    status: 'qualificado' as const,
    score: 85,
    source: 'whatsapp',
    qualified_at: '2026-01-10T11:00:00Z',
    last_contacted_at: '2026-01-10T11:00:00Z',
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    metadata: {
      perfil: 'individual',
      idade: '31-45',
      coparticipacao: 'nao',
    },
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T11:00:00Z',
  },
  {
    id: 'lead-test-2',
    consultant_id: 'consultant-test-1',
    whatsapp_number: '+5511988887777',
    name: 'Maria Santos',
    email: null,
    status: 'em_contato' as const,
    score: 60,
    source: 'whatsapp',
    qualified_at: null,
    last_contacted_at: '2026-01-11T15:00:00Z',
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    metadata: {
      perfil: 'familia',
      idade: '46-60',
      coparticipacao: 'sim',
    },
    created_at: '2026-01-11T14:30:00Z',
    updated_at: '2026-01-11T15:00:00Z',
  },
]

export const mockConversations = [
  {
    id: 'conv-test-1',
    lead_id: 'lead-test-1',
    flow_id: 'flow-health-1',
    state: {
      currentStepId: 'gerar_resposta',
      variables: {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      },
      responses: {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      },
      history: [
        { stepId: 'inicio', timestamp: '2026-01-10T10:00:00Z' },
        { stepId: 'perfil', timestamp: '2026-01-10T10:01:00Z', response: 'individual' },
        { stepId: 'idade', timestamp: '2026-01-10T10:02:00Z', response: '31-45' },
        { stepId: 'coparticipacao', timestamp: '2026-01-10T10:03:00Z', response: 'nao' },
      ],
    },
    status: 'completed' as const,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:05:00Z',
  },
]

export const mockConsultants = [
  {
    id: 'consultant-test-1',
    email: 'test@consultant.com',
    name: 'Consultor Teste',
    whatsapp_number: '+5511977776666',
    vertical: 'saude' as const,
    slug: 'consultor-teste',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]
