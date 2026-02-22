# Research: Consolidated Diagnostic Backlog

**Feature**: 005-diagnostic-backlog
**Date**: 2026-02-22

## R1: Backlog Categorization Strategy

**Decision**: Use 5 fixed categories matching the user's request + 1 "Roadmap Futuro" section for Phase 5 items.

**Rationale**: The user explicitly defined 5 categories (Críticos, Isolamento de Dados, Páginas Placeholder, Links Quebrados, Melhorias de UX). Adding "Roadmap Futuro" as a 6th section separates actionable items from future planning items that have no effort estimate.

**Alternatives considered**:

- Flat priority list (P1/P2/P3) — rejected because user wants category-based grouping
- RICE scoring (Reach, Impact, Confidence, Effort) — too complex for this scope
- MoSCoW (Must/Should/Could/Won't) — doesn't match the user's 5-category structure

## R2: Root Cause Analysis for "Acesso Negado Inesperado"

**Decision**: Group all 72 "Acesso Negado Inesperado" routes under a single root cause item (BL-001) rather than listing each route individually.

**Rationale**: The crawler report shows the same pattern for all 72 routes — authenticated users are redirected to login (pages) or get 401 (APIs). The root cause is the SSR cookie format (`sb-127-auth-token` with base64-encoded JSON) not being recognized by the Next.js middleware's Supabase SSR client. Listing 72 individual items would be noise; one item with the root cause and affected route count is more actionable.

**Alternatives considered**:

- List each route individually — rejected because it's 72 items with the same cause
- Group by page vs API — accepted as sub-detail within the single root cause item

## R3: Effort Estimation Baseline

**Decision**: Use P/M/G (Pequeno/Médio/Grande) scale calibrated to a single senior developer.

**Rationale**: The user explicitly requested P/M/G scale. Calibration: P = ≤2h (config change, add a page), M = ½-1 day (fix auth flow, add seed data), G = >1 day (RLS audit, route consolidation, new provider).

**Alternatives considered**:

- Story points — too abstract without a team velocity baseline
- T-shirt sizing (XS/S/M/L/XL) — user specified P/M/G
- Hours — too precise for backlog-level estimation

## R4: Handling Items in Multiple Categories

**Decision**: Place each item in its highest-priority category with cross-references to related sections.

**Rationale**: The auth cookie issue is both "Crítico" (blocks user flow) and "Isolamento de Dados" (affects tenant access). Placing it in "Críticos" (highest priority) with a note referencing the "Isolamento" section avoids duplication while maintaining traceability.

**Alternatives considered**:

- Duplicate items in both categories — rejected because it inflates counts
- Create a separate "cross-cutting" section — adds unnecessary complexity

## R5: LGPD Compliance Items Classification

**Decision**: Missing /termos and /privacidade pages are classified as "Links Quebrados" (primary) with LGPD compliance noted in the description.

**Rationale**: These are concrete broken links (404) found by the crawler. The LGPD angle is additional context (legal requirement to have these pages), not a separate category. They get elevated priority within "Links Quebrados" due to the compliance implication.

**Alternatives considered**:

- Create a separate "Compliance" category — not in the user's 5-category structure
- Put under "Críticos" — they don't block the main user flow, they block legal compliance
