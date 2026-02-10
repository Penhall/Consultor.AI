# Roadmap - Consultor.AI

**Ultima Atualizacao**: 2026-02-10
**Versao**: 0.4.0

---

## Resumo Executivo

O **Consultor.AI** completou todas as fases planejadas e esta **pronto para producao**. O sistema inclui o core de WhatsApp/leads/IA, billing SaaS com Stripe, painel admin, emails transacionais e landing page.

---

## Status das Fases

| Fase                      | Status   | Conclusao  | Principais Entregas                            |
| ------------------------- | -------- | ---------- | ---------------------------------------------- |
| **MVP (Fase 1)**          | COMPLETO | 2026-01-20 | Flow Engine, WhatsApp, AI, Dashboard           |
| **Testes (Fase 1.5)**     | COMPLETO | 2026-01-20 | 240 testes, CI/CD, 100% coverage API           |
| **Polish (Fase 2)**       | COMPLETO | 2026-01-25 | Lead detail, export, follow-ups, monitoring    |
| **CRM (Fase 3)**          | COMPLETO | 2026-01-27 | RD Station, Pipedrive, Flow Editor             |
| **SaaS Billing (Fase 4)** | COMPLETO | 2026-02-09 | Stripe, creditos, admin, email, landing, OAuth |

---

## Metricas Atuais

| Metrica           | Valor   |
| ----------------- | ------- |
| Paginas           | 22+     |
| API Routes        | 25+     |
| Arquivos de Teste | 34      |
| Testes Passando   | 319/319 |
| TypeScript Errors | 0       |
| ESLint Errors     | 0       |

---

## Fase 4: SaaS Billing - COMPLETO

Implementado na branch `002-saas-billing-admin` e mergeado em `main`:

- **Stripe Integration** - Checkout, customer portal, webhooks
- **3 Planos** - Freemium (R$0), Pro (R$47/mes), Agencia (R$147/mes)
- **Sistema de Creditos** - Mensais (resetam) + comprados (permanentes)
- **Painel Admin** - Metricas SaaS, gestao de usuarios
- **Email Transacional** - Resend (welcome, password reset, cancelamento)
- **Landing Page** - Hero, features, pricing, testimonials, FAQ
- **Cookie Consent (LGPD)** - Banner com persistencia localStorage
- **OAuth** - Meta WhatsApp Embedded Signup
- **File Upload** - Supabase Storage integration
- **pg_cron** - Credit reset mensal, stats hourly

---

## Checklist Pre-Deploy para Producao

### Infraestrutura

- [ ] Supabase Production: Criar projeto em supabase.com
- [ ] Aplicar todas as migrations em producao
- [ ] Configurar Stripe (produtos, precos, webhook)
- [ ] Configurar Resend (dominio, API key)
- [ ] Variaveis de ambiente no Vercel/host
- [ ] DNS e SSL configurados
- [ ] Meta App com webhook URL de producao

### Seguranca

- [ ] Secrets review: nenhum secret em codigo
- [ ] RLS ativo em todas as tabelas
- [ ] CORS configurado para dominio de producao
- [ ] Rate limiting com Redis

### Monitoramento

- [ ] Sentry DSN configurado
- [ ] Alertas para error rate > 1%
- [ ] Stripe webhook monitoring

Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para o guia completo de deploy.

---

## Fase 5: Expansao (Planejamento)

### Prioridade Alta (P1)

#### 5.1 Segundo Vertical: Imoveis

Expandir para corretores de imoveis:

- [ ] Flow template para qualificacao de imoveis (tipo, preco, localizacao, financiamento)
- [ ] Campos especificos em leads
- [ ] AI prompts customizados para setor imobiliario
- [ ] Compliance rules para propaganda imobiliaria

#### 5.2 HubSpot & Agendor Providers

Completar ecossistema de CRM:

- [ ] `src/lib/services/crm-providers/hubspot.ts`
- [ ] `src/lib/services/crm-providers/agendor.ts`
- [ ] OAuth flow para HubSpot

### Prioridade Media (P2)

#### 5.3 Voice Cloning (ElevenLabs)

- [ ] Integracao com ElevenLabs API
- [ ] Upload de samples de voz
- [ ] Geracao de audio a partir de texto AI
- [ ] Envio de voice notes via WhatsApp

#### 5.4 Template Marketplace

- [ ] CRUD de templates publicos vs. privados
- [ ] Rating e reviews
- [ ] Categorizacao por vertical
- [ ] Import/export de flows

### Prioridade Baixa (P3)

- **Multi-tenant** - Organizacoes com multiplos consultores, roles, billing por organizacao
- **Mobile App** - React Native, push notifications, offline support
- **Canva API** - Geracao de imagens personalizadas, branding por consultor

---

## Melhorias Tecnicas Recomendadas

1. **Performance** - ISR para paginas publicas, code splitting agressivo
2. **Developer Experience** - Storybook, API mock server, seed script melhorado
3. **Cobertura de testes** - Adicionar component tests para charts e billing components

---

## Cronograma Sugerido

| Periodo            | Atividade                                         |
| ------------------ | ------------------------------------------------- |
| Fev 2026 (sem 1-2) | Deploy producao, onboarding 5-10 consultores beta |
| Fev 2026 (sem 3-4) | Feedback, bug fixes, inicio vertical Imoveis      |
| Mar 2026           | Lancamento vertical Imoveis, Agendor provider     |
| Abr 2026           | Voice cloning MVP, Template marketplace           |

---

## KPIs para Acompanhamento

### Metricas de Adocao

| Metrica              | Target Q1 |
| -------------------- | --------- |
| Consultores Ativos   | 20        |
| Leads Processados    | 500+      |
| Taxa de Qualificacao | >60%      |
| NPS                  | >50       |

### Metricas Tecnicas

| Metrica         | Target |
| --------------- | ------ |
| Uptime          | 99.5%  |
| P95 API Latency | <500ms |
| P95 AI Response | <3s    |
| Error Rate      | <1%    |

---

**Documentos Relacionados**:

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guia de deploy
- [MONITORING.md](./MONITORING.md) - Configuracao de monitoramento
