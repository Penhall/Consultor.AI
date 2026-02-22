# Feature Specification: Consolidated Diagnostic Backlog

**Feature Branch**: `005-diagnostic-backlog`
**Created**: 2026-02-22
**Status**: Draft
**Input**: Gerar backlog consolidado a partir dos relatórios de diagnóstico (diagnostics/reports/) organizado por criticidade, com descrição, papel afetado, esforço e sugestão de solução. Nenhuma implementação nesta fase.

## User Scenarios & Testing

### User Story 1 - Backlog de Correções Críticas (Priority: P1)

Como líder técnico do Consultor.AI, preciso de um backlog organizado dos problemas críticos que impedem o fluxo principal do usuário (login → dashboard → gerenciar leads), para que a equipe possa priorizar as correções na próxima sprint.

**Why this priority**: Sem autenticação funcional no ambiente Docker, nenhuma das 15 páginas protegidas (dashboard, admin) pode ser acessada. Isso bloqueia 100% do fluxo de trabalho do consultor e do administrador.

**Independent Test**: Pode ser validado verificando que o relatório 02-backlog.md contém uma seção "Críticos" com todos os itens que impedem o fluxo principal do usuário, cada um com descrição, papel afetado, esforço estimado e sugestão de solução.

**Acceptance Scenarios**:

1. **Given** os relatórios 00-project-mapping.md e 01-link-crawler.md existem, **When** o backlog é gerado, **Then** a seção "Críticos" lista o problema de autenticação SSR (cookie não reconhecido pelo middleware) afetando 72 rotas, com esforço e solução sugerida.
2. **Given** os relatórios de diagnóstico mostram APIs retornando 401 para usuários autenticados, **When** o backlog é gerado, **Then** cada grupo de APIs afetadas é listado com a causa raiz comum (falha na propagação do token de sessão).
3. **Given** existem rotas "quebradas" por falta de seed data, **When** o backlog é gerado, **Then** essas rotas são listadas separadamente com a solução de completar o seed para as entidades faltantes.

---

### User Story 2 - Backlog de Links Quebrados e Páginas Ausentes (Priority: P2)

Como product owner, preciso saber quais links na landing page levam a páginas inexistentes e quais páginas estão duplicadas, para que possamos corrigir a navegação antes do lançamento público.

**Why this priority**: Links quebrados na landing page (página pública mais visitada) prejudicam a credibilidade e conversão. Páginas legais ausentes (/termos, /privacidade) podem ter implicações de compliance LGPD.

**Independent Test**: Pode ser validado verificando que o relatório lista todos os links internos que retornaram 404, todas as páginas ausentes exigidas por compliance, e rotas duplicadas, cada item com esforço e solução.

**Acceptance Scenarios**:

1. **Given** o crawl identificou 4 links quebrados únicos na landing page, **When** o backlog é gerado, **Then** cada link é listado com: página de origem, URL destino, texto do link, status HTTP e sugestão de correção.
2. **Given** as páginas /termos e /privacidade não existem mas são linkadas do footer, **When** o backlog é gerado, **Then** essas páginas são classificadas como necessárias para compliance LGPD com prioridade alta.
3. **Given** /dashboard/flows e /dashboard/fluxos coexistem como rotas duplicadas, **When** o backlog é gerado, **Then** a duplicidade é documentada com recomendação de unificação.

---

### User Story 3 - Backlog de Melhorias e Implementações Pendentes (Priority: P3)

Como product owner, preciso de uma visão completa das melhorias de UX e implementações futuras identificadas pelo diagnóstico, para alimentar o roadmap de produto.

**Why this priority**: Embora não bloqueiem o uso atual, estas melhorias impactam a experiência do usuário e completude da plataforma.

**Independent Test**: Pode ser validado verificando que o relatório inclui seções para: isolamento de dados entre tenants (RLS), páginas placeholder que precisam de conteúdo, melhorias de UX e features previstas mas ausentes.

**Acceptance Scenarios**:

1. **Given** o mapeamento do projeto identifica providers CRM previstos mas não implementados (HubSpot, Agendor), **When** o backlog é gerado, **Then** esses itens aparecem na seção de implementações pendentes com esforço estimado.
2. **Given** o diagnóstico de navegação não encontrou placeholders (0 rotas na categoria), **When** o backlog é gerado, **Then** a seção de placeholders registra "nenhum placeholder identificado" e documenta que as rotas retornam conteúdo real ou redirecionam.
3. **Given** existem observações sobre duplicidade de rotas e naming inconsistente (EN vs PT-BR), **When** o backlog é gerado, **Then** a seção de melhorias UX documenta cada inconsistência com sugestão de padronização.

---

### Edge Cases

- O que acontece se um dos relatórios de diagnóstico não existir? O backlog deve documentar quais relatórios estavam disponíveis e quais seções ficaram incompletas.
- Como lidar com itens que aparecem em múltiplas categorias (ex: autenticação é tanto "crítico" quanto "isolamento de dados")? O item deve aparecer na categoria de maior prioridade com referência cruzada nas demais.
- O que fazer com itens já planejados para Fase 5 (Voice Cloning, Mobile App)? Devem ser listados em seção separada "Roadmap Futuro" sem esforço estimado, apenas como referência.

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE gerar um relatório consolidado em formato Markdown no caminho `diagnostics/reports/02-backlog.md`
- **FR-002**: O relatório DEVE conter exatamente 5 seções principais: (1) Críticos, (2) Isolamento de Dados entre Tenants, (3) Páginas Placeholder, (4) Links Quebrados, (5) Melhorias de UX
- **FR-003**: Cada item do backlog DEVE conter: ID único, descrição do problema, papel(is) afetado(s), esforço estimado (P/M/G), e sugestão de solução
- **FR-004**: A seção "Críticos" DEVE listar todos os problemas que impedem o fluxo principal (autenticação, rotas inacessíveis por falha de sessão)
- **FR-005**: A seção "Isolamento de Dados" DEVE avaliar se o RLS está ativo e funcional em todas as tabelas que contêm dados de consultor, documentando riscos identificados
- **FR-006**: A seção "Páginas Placeholder" DEVE documentar rotas que retornaram conteúdo vazio, TODO visível, ou Lorem ipsum (baseado no campo "Placeholder" do relatório de crawl)
- **FR-007**: A seção "Links Quebrados" DEVE listar todos os links internos que retornaram status 404 ou redirecionamento inesperado, com página de origem e texto do link
- **FR-008**: A seção "Melhorias de UX" DEVE documentar duplicidade de rotas, naming inconsistente, e oportunidades de melhoria identificadas nos relatórios
- **FR-009**: Cada item DEVE ter um esforço estimado usando a escala: P (Pequeno: até 2 horas), M (Médio: meio dia a 1 dia), G (Grande: mais de 1 dia)
- **FR-010**: O relatório DEVE incluir um resumo executivo no topo com contagem total de itens por categoria e por esforço
- **FR-011**: O relatório DEVE incluir uma seção "Dados de Origem" listando os relatórios utilizados como fonte com data de cada um
- **FR-012**: O relatório DEVE ser baseado exclusivamente nos dados dos relatórios existentes em `diagnostics/reports/` — nenhuma análise nova deve ser executada
- **FR-013**: O relatório DEVE incluir seção "Roadmap Futuro" para features previstas mas não implementadas (Fase 5), separada do backlog acionável
- **FR-014**: Nenhuma correção ou implementação de código DEVE ser realizada nesta fase — apenas geração do relatório

### Key Entities

- **Backlog Item**: Representa um problema ou melhoria identificado. Atributos: ID, categoria (crítico/isolamento/placeholder/link-quebrado/ux), descrição, papéis afetados (admin/consultant/público), esforço (P/M/G), sugestão de solução, rotas relacionadas.
- **Diagnostic Report Source**: Representa um relatório de diagnóstico utilizado como fonte. Atributos: nome do arquivo, caminho, data de geração, tipo (mapeamento/crawl).

## Success Criteria

### Measurable Outcomes

- **SC-001**: O relatório 02-backlog.md é gerado com sucesso contendo todas as 5 seções obrigatórias mais resumo executivo
- **SC-002**: 100% dos problemas identificados nos relatórios 00 e 01 são categorizados no backlog (nenhum item perdido entre relatórios fonte e backlog)
- **SC-003**: Cada item do backlog possui os 5 campos obrigatórios (ID, descrição, papel afetado, esforço, sugestão de solução) — cobertura de 100%
- **SC-004**: O resumo executivo reflete corretamente a contagem de itens por categoria, verificável por contagem manual
- **SC-005**: O relatório pode ser lido e compreendido por um stakeholder não-técnico em menos de 10 minutos
- **SC-006**: Nenhum arquivo de código-fonte foi modificado durante a geração do backlog (apenas o relatório Markdown foi criado)

## Scope Boundaries

### In Scope

- Análise e consolidação dos relatórios existentes em `diagnostics/reports/`
- Categorização de problemas nas 5 categorias definidas
- Estimativa de esforço para cada item
- Sugestão de solução de alto nível para cada item
- Geração do relatório Markdown

### Out of Scope

- Execução de novos diagnósticos ou crawls
- Correção de qualquer bug ou problema identificado
- Análise de código-fonte além do que já está documentado nos relatórios
- Testes automatizados para o conteúdo do backlog
- Priorização de sprint (o backlog é insumo para priorização, não a priorização em si)

## Assumptions

- Os relatórios `diagnostics/reports/00-project-mapping.md` e `diagnostics/reports/01-link-crawler.md` estão disponíveis e atualizados
- A escala de esforço (P/M/G) é baseada em um desenvolvedor sênior trabalhando sozinho
- "Crítico" significa que impede o fluxo principal de trabalho do usuário (login → dashboard → ações)
- Items da Fase 5 do roadmap não recebem estimativa de esforço pois dependem de decisões futuras
- O formato da landing page (/auth/signup vs /auth/register) é um erro de link, não um problema arquitetural
