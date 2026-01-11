-- Development Seeds
-- Populates database with sample data for local development
-- Version: 1.0.0
-- Date: 2025-12-17
--
-- IMPORTANT: This seed file assumes you have created a test user in Supabase Auth
-- Create a test user first:
-- Email: demo@consultor.ai
-- Password: Demo@123456
--
-- Then get the user_id from auth.users and update the INSERT statements below

-- =====================================================
-- SAMPLE CONSULTANT
-- =====================================================

-- Insert demo consultant (user_id will be set to NULL for development)
INSERT INTO consultants (
    user_id,
    email,
    name,
    whatsapp_number,
    vertical,
    slug,
    subscription_tier,
    subscription_status,
    monthly_lead_limit,
    leads_count_current_month,
    settings
) VALUES (
    NULL,  -- Will be linked to auth user later
    'demo@consultor.ai',
    'Consultor Demo',
    '+5511999887766',
    'saude',
    'consultor-demo',
    'pro',
    'active',
    200,
    5,
    '{
        "notifications": {
            "email": true,
            "whatsapp": true
        },
        "preferences": {
            "language": "pt-BR",
            "timezone": "America/Sao_Paulo"
        }
    }'::JSONB
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- SAMPLE DEFAULT FLOW (Health Plans)
-- =====================================================

INSERT INTO flows (
    consultant_id,
    name,
    description,
    vertical,
    definition,
    version,
    is_active,
    is_default
) VALUES (
    NULL,  -- Public default flow
    'Qualificação Plano de Saúde',
    'Fluxo padrão para qualificação de leads de planos de saúde',
    'saude',
    '{
        "id": "flow-health-plan-default",
        "version": "1.0.0",
        "steps": [
            {
                "id": "inicio",
                "tipo": "mensagem",
                "conteudo": "Olá! 👋 Sou assistente do {{consultant_name}}. Vou te ajudar a encontrar o plano de saúde ideal para você e sua família!",
                "proxima": "perfil"
            },
            {
                "id": "perfil",
                "tipo": "escolha",
                "conteudo": "Para começar, qual é o seu perfil?",
                "opcoes": [
                    {
                        "texto": "Individual (só eu)",
                        "valor": "individual",
                        "emoji": "👤"
                    },
                    {
                        "texto": "Casal (eu + cônjuge)",
                        "valor": "casal",
                        "emoji": "👥"
                    },
                    {
                        "texto": "Família (com dependentes)",
                        "valor": "familia",
                        "emoji": "👨‍👩‍👧‍👦"
                    },
                    {
                        "texto": "Empresa (CNPJ)",
                        "valor": "empresa",
                        "emoji": "🏢"
                    }
                ],
                "proxima": "idade"
            },
            {
                "id": "idade",
                "tipo": "escolha",
                "conteudo": "Qual sua faixa etária?",
                "opcoes": [
                    {
                        "texto": "Até 30 anos",
                        "valor": "ate_30"
                    },
                    {
                        "texto": "31 a 45 anos",
                        "valor": "31_45"
                    },
                    {
                        "texto": "46 a 60 anos",
                        "valor": "46_60"
                    },
                    {
                        "texto": "Acima de 60 anos",
                        "valor": "acima_60"
                    }
                ],
                "proxima": "coparticipacao"
            },
            {
                "id": "coparticipacao",
                "tipo": "escolha",
                "conteudo": "Você prefere plano com coparticipação? (Mensalidade mais baixa, mas você paga uma parte em cada consulta)",
                "opcoes": [
                    {
                        "texto": "Sim, quero pagar menos por mês",
                        "valor": "sim",
                        "emoji": "💰"
                    },
                    {
                        "texto": "Não, prefiro cobertura total",
                        "valor": "nao",
                        "emoji": "🏥"
                    }
                ],
                "proxima": "gerar_resposta"
            },
            {
                "id": "gerar_resposta",
                "tipo": "executar",
                "acao": "gerar_resposta_ia",
                "proxima": "final"
            },
            {
                "id": "final",
                "tipo": "mensagem",
                "conteudo": "Ótimo! Estou enviando suas informações para {{consultant_name}}. Em breve você receberá um contato personalizado! 📱",
                "proxima": null
            }
        ]
    }'::JSONB,
    '1.0.0',
    true,
    true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- SAMPLE LEADS
-- Get consultant_id first for foreign key
-- =====================================================

DO $$
DECLARE
    demo_consultant_id UUID;
BEGIN
    -- Get the demo consultant ID
    SELECT id INTO demo_consultant_id
    FROM consultants
    WHERE email = 'demo@consultor.ai'
    LIMIT 1;

    -- Only proceed if consultant exists
    IF demo_consultant_id IS NOT NULL THEN

        -- Lead 1: Novo (just started)
        INSERT INTO leads (
            consultant_id,
            whatsapp_number,
            name,
            email,
            status,
            score,
            metadata,
            source,
            created_at
        ) VALUES (
            demo_consultant_id,
            '+5511999111111',
            'João Silva',
            'joao.silva@email.com',
            'novo',
            NULL,
            '{"profile": "individual", "age_range": "31_45"}'::JSONB,
            'whatsapp',
            NOW() - INTERVAL '2 hours'
        );

        -- Lead 2: Em contato (conversation started)
        INSERT INTO leads (
            consultant_id,
            whatsapp_number,
            name,
            status,
            score,
            metadata,
            source,
            created_at,
            last_contacted_at
        ) VALUES (
            demo_consultant_id,
            '+5511999222222',
            'Maria Santos',
            'em_contato',
            65,
            '{"profile": "familia", "age_range": "31_45", "coparticipacao": "sim"}'::JSONB,
            'whatsapp',
            NOW() - INTERVAL '1 day',
            NOW() - INTERVAL '3 hours'
        );

        -- Lead 3: Qualificado (ready for follow-up)
        INSERT INTO leads (
            consultant_id,
            whatsapp_number,
            name,
            email,
            status,
            score,
            metadata,
            source,
            qualified_at,
            created_at,
            last_contacted_at
        ) VALUES (
            demo_consultant_id,
            '+5511999333333',
            'Pedro Oliveira',
            'pedro.oliveira@email.com',
            'qualificado',
            85,
            '{
                "profile": "casal",
                "age_range": "46_60",
                "coparticipacao": "nao",
                "preferred_providers": ["Amil", "SulAmérica"]
            }'::JSONB,
            'whatsapp',
            NOW() - INTERVAL '6 hours',
            NOW() - INTERVAL '2 days',
            NOW() - INTERVAL '4 hours'
        );

        -- Lead 4: Fechado (converted!)
        INSERT INTO leads (
            consultant_id,
            whatsapp_number,
            name,
            email,
            status,
            score,
            metadata,
            source,
            qualified_at,
            created_at,
            last_contacted_at
        ) VALUES (
            demo_consultant_id,
            '+5511999444444',
            'Ana Costa',
            'ana.costa@email.com',
            'fechado',
            95,
            '{
                "profile": "familia",
                "age_range": "31_45",
                "coparticipacao": "sim",
                "chosen_provider": "Bradesco Saúde",
                "monthly_value": 850.00
            }'::JSONB,
            'whatsapp',
            NOW() - INTERVAL '1 day',
            NOW() - INTERVAL '7 days',
            NOW() - INTERVAL '1 day'
        );

        -- Lead 5: Perdido (lost)
        INSERT INTO leads (
            consultant_id,
            whatsapp_number,
            name,
            status,
            score,
            metadata,
            source,
            created_at,
            last_contacted_at
        ) VALUES (
            demo_consultant_id,
            '+5511999555555',
            'Carlos Ferreira',
            'perdido',
            30,
            '{
                "profile": "individual",
                "age_range": "ate_30",
                "loss_reason": "Preço muito alto"
            }'::JSONB,
            'whatsapp',
            NOW() - INTERVAL '10 days',
            NOW() - INTERVAL '8 days'
        );

    END IF;
END $$;

-- =====================================================
-- SAMPLE CONVERSATIONS
-- =====================================================

DO $$
DECLARE
    demo_consultant_id UUID;
    lead_maria_id UUID;
    lead_pedro_id UUID;
    default_flow_id UUID;
    conversation_maria_id UUID;
    conversation_pedro_id UUID;
BEGIN
    -- Get IDs
    SELECT id INTO demo_consultant_id FROM consultants WHERE email = 'demo@consultor.ai' LIMIT 1;
    SELECT id INTO lead_maria_id FROM leads WHERE whatsapp_number = '+5511999222222' LIMIT 1;
    SELECT id INTO lead_pedro_id FROM leads WHERE whatsapp_number = '+5511999333333' LIMIT 1;
    SELECT id INTO default_flow_id FROM flows WHERE is_default = true AND vertical = 'saude' LIMIT 1;

    IF demo_consultant_id IS NOT NULL AND lead_maria_id IS NOT NULL AND default_flow_id IS NOT NULL THEN
        -- Conversation for Maria (active)
        INSERT INTO conversations (
            lead_id,
            flow_id,
            status,
            current_step_id,
            state,
            message_count,
            completion_percentage,
            started_at,
            last_message_at
        ) VALUES (
            lead_maria_id,
            default_flow_id,
            'active',
            'coparticipacao',
            '{
                "responses": {
                    "perfil": "familia",
                    "idade": "31_45"
                },
                "context": {
                    "consultant_name": "Consultor Demo"
                }
            }'::JSONB,
            4,
            60,
            NOW() - INTERVAL '1 day',
            NOW() - INTERVAL '3 hours'
        ) RETURNING id INTO conversation_maria_id;

        -- Messages for Maria's conversation
        IF conversation_maria_id IS NOT NULL THEN
            INSERT INTO messages (conversation_id, direction, content, status, created_at) VALUES
                (conversation_maria_id, 'outbound', 'Olá! 👋 Sou assistente do Consultor Demo. Vou te ajudar a encontrar o plano de saúde ideal para você e sua família!', 'read', NOW() - INTERVAL '1 day'),
                (conversation_maria_id, 'inbound', 'Oi! Quero saber sobre planos', 'read', NOW() - INTERVAL '23 hours'),
                (conversation_maria_id, 'outbound', 'Para começar, qual é o seu perfil?', 'read', NOW() - INTERVAL '22 hours'),
                (conversation_maria_id, 'inbound', 'Família (com dependentes)', 'read', NOW() - INTERVAL '3 hours');
        END IF;

        -- Conversation for Pedro (completed)
        IF lead_pedro_id IS NOT NULL THEN
            INSERT INTO conversations (
                lead_id,
                flow_id,
                status,
                current_step_id,
                state,
                message_count,
                completion_percentage,
                started_at,
                completed_at,
                last_message_at
            ) VALUES (
                lead_pedro_id,
                default_flow_id,
                'completed',
                'final',
                '{
                    "responses": {
                        "perfil": "casal",
                        "idade": "46_60",
                        "coparticipacao": "nao"
                    },
                    "context": {
                        "consultant_name": "Consultor Demo"
                    }
                }'::JSONB,
                8,
                100,
                NOW() - INTERVAL '2 days',
                NOW() - INTERVAL '6 hours',
                NOW() - INTERVAL '6 hours'
            );
        END IF;
    END IF;
END $$;

-- =====================================================
-- SUMMARY
-- =====================================================

-- Show created data
DO $$
BEGIN
    RAISE NOTICE '✅ Seed data created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Consultants: %', (SELECT COUNT(*) FROM consultants);
    RAISE NOTICE 'Leads: %', (SELECT COUNT(*) FROM leads);
    RAISE NOTICE 'Flows: %', (SELECT COUNT(*) FROM flows);
    RAISE NOTICE 'Conversations: %', (SELECT COUNT(*) FROM conversations);
    RAISE NOTICE 'Messages: %', (SELECT COUNT(*) FROM messages);
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '1. Create test user in Supabase Auth: demo@consultor.ai';
    RAISE NOTICE '2. Update consultant.user_id in this seed file with actual auth user ID';
    RAISE NOTICE '3. Re-run seed: npm run db:seed';
END $$;
