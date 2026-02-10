# Changelog

Todas as mudancas notaveis neste projeto serao documentadas neste arquivo.

O formato e baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Phase 4 planning tasks (T121-T144) in tasks.md
- NEXT-STEPS-2026-01-30.md with detailed expansion roadmap
- Vertical architecture planning for real estate expansion
- HubSpot and Agendor CRM provider planning

### Changed
- Updated spec.md status from "Draft" to "Complete - Production Ready"
- Updated CLAUDE.md with current status and Phase 4 references
- Updated tasks.md with Phase 11 (Expansion) section

### Fixed
- N/A

## [0.3.0] - 2026-01-27

### Added
- **Integracoes CRM** (US7): RD Station, Pipedrive, HubSpot, Agendor
- Pagina de gerenciamento de integracoes (`/dashboard/integracoes`)
- Sync manual e automatico de leads para CRM
- Historico de sincronizacoes com paginacao
- API routes completas para CRM (`/api/integrations/crm/*`)
- React Query hooks para CRM (`useCRM.ts`)
- Database migration para tabelas CRM (`crm_integrations`, `crm_sync_logs`)
- Validacao Zod para operacoes CRM
- Bundle analyzer para otimizacao (`npm run analyze`)
- Error boundary especifico para dashboard
- Pagina 404 aprimorada com quick links
- Script de verificacao de release (`scripts/verify-release.ts`)
- Guia de monitoramento (`docs/guides/MONITORING.md`)
- Guia de deploy (`docs/guides/DEPLOYMENT.md`)

### Changed
- Providers atualizado para inicializar Sentry automaticamente
- Dashboard layout com novo link para Integracoes
- Build otimizado com bundle analyzer

### Technical
- 22 paginas renderizadas
- 25 API routes
- TypeScript: 0 erros
- ESLint: 0 erros (apenas warnings pre-existentes)
- Build time: ~67s

## [0.2.1] - 2026-01-25

### Added
- Sistema de Follow-ups automaticos
- Templates de mensagens reutilizaveis
- Filtros avancados para leads (busca, data, score, source)
- Skeleton loading para melhor UX
- Otimizacoes de cache com React Query

### Changed
- Performance melhorada com hooks otimizados
- Docker networking corrigido para Supabase

## [0.2.0] - 2026-01-22

### Added
- Lead detail page completo com timeline
- Exportacao de leads para CSV
- Infraestrutura de monitoring (Sentry, logging, performance)
- Testes de API routes (14/14 rotas)
- CI/CD com GitHub Actions
- Pre-commit hooks com Husky

### Changed
- Cobertura de testes para 80%+

### Fixed
- Correcoes de TypeScript em arquivos de teste

## [0.1.0] - 2026-01-20

### Added
- MVP inicial completo
- Autenticacao com Supabase
- CRUD de leads
- Flow Engine conversacional
- Integracao WhatsApp Business (Meta Cloud API)
- Geracao de respostas com IA (Gemini)
- Dashboard com analytics (6 metricas, graficos)
- Fluxo padrao de qualificacao para saude
- Sistema de scores automatico
- Auto-criacao de leads via WhatsApp
- Criptografia AES-256-GCM para tokens

### Technical
- Next.js 14 com App Router
- TypeScript strict mode
- Supabase com RLS
- Tailwind CSS + shadcn/ui
- Docker setup completo

---

## Versioning

Este projeto usa Semantic Versioning:
- **MAJOR**: Mudancas incompativeis de API
- **MINOR**: Funcionalidades novas compativeis
- **PATCH**: Correcoes de bugs compativeis

## Links

- [Repositorio](https://github.com/seu-usuario/consultor-ai)
- [Issues](https://github.com/seu-usuario/consultor-ai/issues)
- [Documentacao](./docs/)
