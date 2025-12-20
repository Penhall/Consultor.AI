-- Default Health Flow Seed
-- This inserts the default health insurance qualification flow

-- Insert default health flow (public flow, available to all consultants)
INSERT INTO flows (
  id,
  consultant_id,
  name,
  description,
  vertical,
  definition,
  is_active,
  is_public,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  NULL, -- NULL means it's a public template
  'Qualificação de Planos de Saúde',
  'Fluxo padrão para qualificação de leads interessados em planos de saúde. Coleta perfil, faixa etária e preferência de coparticipação.',
  'saude',
  '{
    "versao": "1.0",
    "inicio": "boas_vindas",
    "passos": [
      {
        "id": "boas_vindas",
        "tipo": "mensagem",
        "mensagem": "Olá! 👋 Seja muito bem-vindo(a)!\\n\\nSou o assistente virtual e estou aqui para te ajudar a encontrar o plano de saúde ideal para você e sua família.\\n\\nVamos começar?",
        "proxima": "pergunta_perfil"
      },
      {
        "id": "pergunta_perfil",
        "tipo": "escolha",
        "pergunta": "Primeiro, me conta: você está buscando um plano para:",
        "opcoes": [
          {
            "texto": "Individual (só para mim)",
            "valor": "individual",
            "proxima": "pergunta_idade"
          },
          {
            "texto": "Casal (eu + cônjuge)",
            "valor": "casal",
            "proxima": "pergunta_idade"
          },
          {
            "texto": "Família (eu + dependentes)",
            "valor": "familia",
            "proxima": "pergunta_idade"
          },
          {
            "texto": "Empresarial (CNPJ)",
            "valor": "empresarial",
            "proxima": "pergunta_idade"
          }
        ]
      },
      {
        "id": "pergunta_idade",
        "tipo": "escolha",
        "pergunta": "Perfeito! Agora me diz: qual a faixa etária do titular do plano?",
        "opcoes": [
          {
            "texto": "Até 30 anos",
            "valor": "ate_30",
            "proxima": "pergunta_coparticipacao"
          },
          {
            "texto": "De 31 a 45 anos",
            "valor": "31_45",
            "proxima": "pergunta_coparticipacao"
          },
          {
            "texto": "De 46 a 60 anos",
            "valor": "46_60",
            "proxima": "pergunta_coparticipacao"
          },
          {
            "texto": "Acima de 60 anos",
            "valor": "acima_60",
            "proxima": "pergunta_coparticipacao"
          }
        ]
      },
      {
        "id": "pergunta_coparticipacao",
        "tipo": "escolha",
        "pergunta": "Última pergunta: você prefere um plano com ou sem coparticipação?\\n\\n💡 Coparticipação = mensalidade menor, mas você paga uma parte quando usa (consultas, exames)",
        "opcoes": [
          {
            "texto": "Com coparticipação (mensalidade menor)",
            "valor": "sim",
            "proxima": "gerar_recomendacao"
          },
          {
            "texto": "Sem coparticipação (cobertura total)",
            "valor": "nao",
            "proxima": "gerar_recomendacao"
          }
        ]
      },
      {
        "id": "gerar_recomendacao",
        "tipo": "executar",
        "acao": "gerar_resposta_ia",
        "parametros": {
          "template": "recomendacao_planos"
        },
        "proxima": "atualizar_score"
      },
      {
        "id": "atualizar_score",
        "tipo": "executar",
        "acao": "calcular_score",
        "parametros": {
          "rules": {
            "pergunta_perfil": 30,
            "pergunta_idade": 30,
            "pergunta_coparticipacao": 40
          }
        },
        "proxima": "finalizar"
      },
      {
        "id": "finalizar",
        "tipo": "mensagem",
        "mensagem": "Ótimo! Vou preparar as melhores opções para o seu perfil e te envio em breve por aqui mesmo. 📋\\n\\nEnquanto isso, se tiver alguma dúvida, é só me chamar! 😊",
        "proxima": null
      }
    ]
  }'::jsonb,
  true, -- is_active
  true, -- is_public
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Create a comment
COMMENT ON TABLE flows IS 'Conversation flow definitions for lead qualification';
