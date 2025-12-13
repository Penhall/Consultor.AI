-- Seed data for Consultor.AI development environment
-- This file populates the database with sample data for testing and development

-- ==============================================
-- TEST CONSULTANT
-- ==============================================

INSERT INTO consultants (id, email, name, bio, whatsapp_number, vertical, slug)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'teste@consultor.ai',
    'João Silva',
    'Consultor especializado em planos de saúde com mais de 10 anos de experiência',
    '+5511999887766',
    'saude',
    'joao-silva'
) ON CONFLICT (email) DO NOTHING;

-- ==============================================
-- SAMPLE HEALTH PLAN FLOW
-- ==============================================

INSERT INTO flows (id, consultant_id, name, description, vertical, flow_definition, is_active, version)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Qualificação de Plano de Saúde',
    'Fluxo padrão para qualificação de leads interessados em planos de saúde',
    'saude',
    '{
      "id": "flow-health-plan",
      "name": "Qualificação Plano de Saúde",
      "version": "1.0",
      "steps": [
        {
          "id": "inicio",
          "tipo": "mensagem",
          "conteudo": "Olá! Sou o assistente virtual do {{nome_consultor}}. 👋\n\nVou te ajudar a encontrar o plano de saúde ideal para você!\n\nVamos começar?",
          "proxima": "perfil"
        },
        {
          "id": "perfil",
          "tipo": "escolha",
          "conteudo": "Qual é o seu perfil?",
          "opcoes": [
            {"texto": "Individual", "valor": "individual"},
            {"texto": "Família", "valor": "familia"},
            {"texto": "Empresa (MEI/PJ)", "valor": "empresa"}
          ],
          "proxima": "idade"
        },
        {
          "id": "idade",
          "tipo": "escolha",
          "conteudo": "Qual sua faixa etária?",
          "opcoes": [
            {"texto": "0-18 anos", "valor": "0-18"},
            {"texto": "19-23 anos", "valor": "19-23"},
            {"texto": "24-28 anos", "valor": "24-28"},
            {"texto": "29-33 anos", "valor": "29-33"},
            {"texto": "34-38 anos", "valor": "34-38"},
            {"texto": "39-43 anos", "valor": "39-43"},
            {"texto": "44-48 anos", "valor": "44-48"},
            {"texto": "49-53 anos", "valor": "49-53"},
            {"texto": "54-58 anos", "valor": "54-58"},
            {"texto": "59+ anos", "valor": "59+"}
          ],
          "proxima": "coparticipacao"
        },
        {
          "id": "coparticipacao",
          "tipo": "escolha",
          "conteudo": "Você prefere um plano com ou sem coparticipação?\n\n💡 *Coparticipação:* Você paga uma mensalidade mais baixa, mas contribui com um valor a cada consulta/exame.",
          "opcoes": [
            {"texto": "Com coparticipação", "valor": "sim"},
            {"texto": "Sem coparticipação", "valor": "nao"}
          ],
          "proxima": "resultado"
        },
        {
          "id": "resultado",
          "tipo": "executar",
          "acao": "gerar_resposta_ia",
          "conteudo": "Perfeito! Com base nas suas informações, vou gerar uma recomendação personalizada...",
          "proxima": "final"
        },
        {
          "id": "final",
          "tipo": "mensagem",
          "conteudo": "{{resultado_ia}}\n\n---\n\nGostou? Quer mais informações sobre algum plano específico?",
          "proxima": null
        }
      ]
    }',
    true,
    '1.0'
) ON CONFLICT DO NOTHING;

-- ==============================================
-- SAMPLE LEADS
-- ==============================================

INSERT INTO leads (id, consultant_id, whatsapp_number, name, email, status, score, metadata)
VALUES
    (
        '33333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        '+5511987654321',
        'Maria Santos',
        'maria.santos@example.com',
        'qualificado',
        85,
        '{"perfil": "familia", "idade": "34-38", "coparticipacao": "nao"}'
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        '11111111-1111-1111-1111-111111111111',
        '+5511976543210',
        'Pedro Oliveira',
        'pedro.oliveira@example.com',
        'em_contato',
        70,
        '{"perfil": "individual", "idade": "24-28", "coparticipacao": "sim"}'
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        '+5511965432109',
        'Ana Costa',
        NULL,
        'novo',
        NULL,
        '{}'
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        '11111111-1111-1111-1111-111111111111',
        '+5511954321098',
        'Carlos Souza',
        'carlos.souza@example.com',
        'fechado',
        95,
        '{"perfil": "empresa", "idade": "39-43", "coparticipacao": "nao", "plano_escolhido": "Unimed Nacional"}'
    ),
    (
        '77777777-7777-7777-7777-777777777777',
        '11111111-1111-1111-1111-111111111111',
        '+5511943210987',
        'Juliana Lima',
        'juliana.lima@example.com',
        'perdido',
        40,
        '{"perfil": "individual", "idade": "19-23", "coparticipacao": "sim", "motivo_perda": "preco_alto"}'
    )
ON CONFLICT DO NOTHING;

-- ==============================================
-- SAMPLE CONVERSATIONS
-- ==============================================

INSERT INTO conversations (id, lead_id, flow_id, state, current_step_id, started_at, completed_at)
VALUES
    (
        '88888888-8888-8888-8888-888888888888',
        '33333333-3333-3333-3333-333333333333',
        '22222222-2222-2222-2222-222222222222',
        '{
            "responses": {
                "perfil": "familia",
                "idade": "34-38",
                "coparticipacao": "nao"
            },
            "context": {
                "nome_consultor": "João Silva"
            }
        }',
        'final',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        '99999999-9999-9999-9999-999999999999',
        '44444444-4444-4444-4444-444444444444',
        '22222222-2222-2222-2222-222222222222',
        '{
            "responses": {
                "perfil": "individual",
                "idade": "24-28"
            },
            "context": {
                "nome_consultor": "João Silva"
            }
        }',
        'coparticipacao',
        NOW() - INTERVAL '1 day',
        NULL
    )
ON CONFLICT DO NOTHING;

-- ==============================================
-- SAMPLE MESSAGES
-- ==============================================

INSERT INTO messages (conversation_id, sender, content, message_type, sent_at)
VALUES
    -- Conversation 1 (Maria Santos - completed)
    ('88888888-8888-8888-8888-888888888888', 'bot', 'Olá! Sou o assistente virtual do João Silva. 👋\n\nVou te ajudar a encontrar o plano de saúde ideal para você!\n\nVamos começar?', 'text', NOW() - INTERVAL '2 days'),
    ('88888888-8888-8888-8888-888888888888', 'lead', 'Sim, vamos!', 'text', NOW() - INTERVAL '2 days'),
    ('88888888-8888-8888-8888-888888888888', 'bot', 'Qual é o seu perfil?', 'text', NOW() - INTERVAL '2 days'),
    ('88888888-8888-8888-8888-888888888888', 'lead', 'Família', 'text', NOW() - INTERVAL '2 days'),
    ('88888888-8888-8888-8888-888888888888', 'bot', 'Qual sua faixa etária?', 'text', NOW() - INTERVAL '2 days'),
    ('88888888-8888-8888-8888-888888888888', 'lead', '34-38', 'text', NOW() - INTERVAL '2 days'),
    ('88888888-8888-8888-8888-888888888888', 'bot', 'Você prefere um plano com ou sem coparticipação?', 'text', NOW() - INTERVAL '2 days'),
    ('88888888-8888-8888-8888-888888888888', 'lead', 'Sem coparticipação', 'text', NOW() - INTERVAL '2 days'),
    ('88888888-8888-8888-8888-888888888888', 'bot', 'Perfeito! Com base nas suas informações, vou gerar uma recomendação personalizada...', 'text', NOW() - INTERVAL '2 days'),
    ('88888888-8888-8888-8888-888888888888', 'bot', 'Com base no seu perfil (Família, 34-38 anos, sem coparticipação), recomendo:\n\n1. Unimed Nacional Familiar - R$ 1.850/mês\n2. Amil Blue Família - R$ 1.720/mês\n3. SulAmérica Clássico Familiar - R$ 1.980/mês\n\nTodos incluem cobertura nacional, sem carência e rede credenciada ampla.', 'text', NOW() - INTERVAL '2 days'),

    -- Conversation 2 (Pedro Oliveira - in progress)
    ('99999999-9999-9999-9999-999999999999', 'bot', 'Olá! Sou o assistente virtual do João Silva. 👋\n\nVou te ajudar a encontrar o plano de saúde ideal para você!\n\nVamos começar?', 'text', NOW() - INTERVAL '1 day'),
    ('99999999-9999-9999-9999-999999999999', 'lead', 'Sim', 'text', NOW() - INTERVAL '1 day'),
    ('99999999-9999-9999-9999-999999999999', 'bot', 'Qual é o seu perfil?', 'text', NOW() - INTERVAL '1 day'),
    ('99999999-9999-9999-9999-999999999999', 'lead', 'Individual', 'text', NOW() - INTERVAL '1 day'),
    ('99999999-9999-9999-9999-999999999999', 'bot', 'Qual sua faixa etária?', 'text', NOW() - INTERVAL '1 day'),
    ('99999999-9999-9999-9999-999999999999', 'lead', '24-28', 'text', NOW() - INTERVAL '1 day'),
    ('99999999-9999-9999-9999-999999999999', 'bot', 'Você prefere um plano com ou sem coparticipação?\n\n💡 *Coparticipação:* Você paga uma mensalidade mais baixa, mas contribui com um valor a cada consulta/exame.', 'text', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- ==============================================
-- SAMPLE AI RESPONSES
-- ==============================================

INSERT INTO ai_responses (conversation_id, prompt, response, model, tokens_used)
VALUES
    (
        '88888888-8888-8888-8888-888888888888',
        'Gere recomendações de planos de saúde para: perfil=familia, idade=34-38, coparticipacao=nao',
        'Com base no seu perfil (Família, 34-38 anos, sem coparticipação), recomendo:\n\n1. Unimed Nacional Familiar - R$ 1.850/mês\n2. Amil Blue Família - R$ 1.720/mês\n3. SulAmérica Clássico Familiar - R$ 1.980/mês\n\nTodos incluem cobertura nacional, sem carência e rede credenciada ampla.',
        'llama-3.1-70b-versatile',
        150
    )
ON CONFLICT DO NOTHING;

-- ==============================================
-- REFRESH MATERIALIZED VIEWS
-- ==============================================

REFRESH MATERIALIZED VIEW lead_statistics;

-- ==============================================
-- CONFIRMATION MESSAGE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully!';
    RAISE NOTICE 'Test consultant: teste@consultor.ai';
    RAISE NOTICE 'Sample leads: 5';
    RAISE NOTICE 'Sample conversations: 2';
    RAISE NOTICE 'Sample messages: 17';
END $$;
