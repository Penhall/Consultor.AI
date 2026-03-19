# Skin System Design — Consultor.AI

**Data**: 2026-03-18
**Status**: Aprovado
**Versão**: 1.0
**Inspiração**: [PettoFlow](https://github.com/Penhall/PettoFlow) — data-theme + ThemeContext + localStorage

---

## Visão Geral

Sistema de skins (temas visuais) para o Consultor.AI com 4 variantes, troca instantânea no header, persistência dual (localStorage + banco de dados), e refatoração completa dos componentes existentes para usar CSS variables em vez de cores hardcoded.

---

## Decisões de Design

| Decisão           | Escolha                               | Motivo                                                   |
| ----------------- | ------------------------------------- | -------------------------------------------------------- |
| Mecanismo de tema | CSS Variables + `data-skin` attribute | Alinha com shadcn/ui existente, zero dependências extras |
| Troca de skin     | Header dropdown + Settings page       | Acesso rápido + configuração persistida                  |
| Persistência      | localStorage (cache) + banco de dados | Sem flash + sincronização entre dispositivos             |
| Refatoração       | Completa (todos os componentes)       | Garante que todas as skins funcionem 100%                |
| Anti-flash SSR    | Cookie `skin` lido no `layout.tsx`    | Elimina FOUC sem `next-themes`                           |

---

## Arquitetura

### Fluxo de dados

```
[Usuário escolhe skin]
        ↓
SkinContext.setSkin(id)
  → aplica data-skin="noturno" no document.documentElement
  → salva no localStorage["consultor-ai-skin"]
  → PATCH /api/consultants/me { theme: id }
  → seta cookie "skin" com maxAge=365days
        ↓
layout.tsx (Server Component) lê cookies().get('skin')
  → <html data-skin="noturno" ...>
        ↓
globals.css: [data-skin="noturno"] { --primary: ...; }
        ↓
Tailwind: bg-primary → hsl(var(--primary)) → cor correta
```

### Estrutura de arquivos

```
src/
├── lib/skin/
│   ├── types.ts              — SkinId, SkinMeta interface
│   ├── skins.ts              — 4 skin definitions (name, icon, description)
│   └── skin-context.tsx      — SkinProvider + useSkin() hook
│
├── components/ui/
│   └── skin-switcher.tsx     — DropdownMenu no header
│
└── app/
    ├── layout.tsx            — lê cookie → data-skin no <html>
    └── dashboard/
        └── perfil/
            └── page.tsx      — adicionar seção "Aparência" (já existe, não criar novo arquivo)
```

---

## As 4 Skins

### 1. 🏢 Corporate _(padrão atual)_

**Personalidade**: Profissional, confiável, B2B. Tom sério para consultores.

```css
[data-skin='corporate'] {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

---

### 2. 🌙 Noturno _(dark mode)_

**Personalidade**: Elegante, focado, protege a visão. Modo escuro com acento violeta/índigo.

```css
[data-skin='noturno'] {
  --background: 224 71% 4%;
  --foreground: 213 31% 91%;
  --card: 224 71% 7%;
  --card-foreground: 213 31% 91%;
  --popover: 224 71% 4%;
  --popover-foreground: 213 31% 91%;
  --primary: 263 70% 65%;
  --primary-foreground: 224 71% 4%;
  --secondary: 223 47% 11%;
  --secondary-foreground: 213 31% 91%;
  --muted: 223 47% 11%;
  --muted-foreground: 215 20% 65%;
  --accent: 216 34% 17%;
  --accent-foreground: 213 31% 91%;
  --destructive: 0 63% 31%;
  --destructive-foreground: 213 31% 91%;
  --border: 216 34% 17%;
  --input: 216 34% 17%;
  --ring: 263 70% 65%;
  --radius: 0.5rem;
}
```

---

### 3. ⚡ Moderno _(clean & vibrant)_

**Personalidade**: Startup, contemporâneo, leveza visual. Espaços amplos, acento teal, cantos mais arredondados.

```css
[data-skin='moderno'] {
  --background: 0 0% 98%;
  --foreground: 240 10% 4%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 4%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 4%;
  --primary: 172 66% 36%;
  --primary-foreground: 0 0% 100%;
  --secondary: 172 30% 94%;
  --secondary-foreground: 172 66% 25%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 46%;
  --accent: 172 40% 90%;
  --accent-foreground: 172 66% 25%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 240 6% 90%;
  --input: 240 6% 90%;
  --ring: 172 66% 36%;
  --radius: 0.75rem;
}
```

---

### 4. 📜 Clássico _(traditional SaaS)_

**Personalidade**: Maduro, sóbrio, confiável. Fundo creme quente, acento roxo profundo — enterprise clássico.

```css
[data-skin='classico'] {
  --background: 40 20% 97%;
  --foreground: 270 30% 10%;
  --card: 40 15% 99%;
  --card-foreground: 270 30% 10%;
  --popover: 40 15% 99%;
  --popover-foreground: 270 30% 10%;
  --primary: 270 60% 38%;
  --primary-foreground: 0 0% 100%;
  --secondary: 270 20% 94%;
  --secondary-foreground: 270 60% 30%;
  --muted: 30 10% 93%;
  --muted-foreground: 270 15% 45%;
  --accent: 270 30% 90%;
  --accent-foreground: 270 60% 30%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 270 20% 85%;
  --input: 270 20% 85%;
  --ring: 270 60% 38%;
  --radius: 0.375rem;
}
```

---

## Componentes — UI do Switcher

### Header Dropdown (`skin-switcher.tsx`)

- Ícone `Palette` (Lucide) no topbar, ao lado do `UserMenu`
- `DropdownMenu` com 4 opções + check mark na skin ativa
- Troca instantânea ao clicar (sem reload de página)

```tsx
// Estrutura visual
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="ghost" size="icon">
      <Palette className="h-5 w-5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Aparência</DropdownMenuLabel>
    <DropdownMenuSeparator />
    {SKINS.map(skin => (
      <DropdownMenuItem key={skin.id} onClick={() => setSkin(skin.id)}>
        <span>{skin.icon}</span>
        <span>{skin.name}</span>
        {currentSkin === skin.id && <Check className="ml-auto h-4 w-4" />}
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

### Settings Page — Cards visuais

- Grid 2x2 de cards clicáveis adicionados à **página existente** `/dashboard/perfil`
- Cada card contém: mini-preview SVG + nome + descrição + badge "Ativo"
- Mini-preview: SVG estático 120x80px com as cores representativas da skin

---

## Refatoração de Componentes

### Mapeamento de substituições

| Classe hardcoded                          | Substituição            | Aplicável em            |
| ----------------------------------------- | ----------------------- | ----------------------- |
| `bg-white`                                | `bg-background`         | Cards, modais, sidebars |
| `bg-gray-50`                              | `bg-muted`              | Fundos secundários      |
| `bg-gray-800`, `dark:bg-gray-800`         | `bg-card`               | Cards em dark           |
| `text-gray-900`, `dark:text-white`        | `text-foreground`       | Títulos, body           |
| `text-gray-600`, `dark:text-gray-400`     | `text-muted-foreground` | Labels, subheadings     |
| `border-gray-200`, `dark:border-gray-700` | `border-border`         | Divisores, cards        |
| `bg-gray-200 dark:bg-gray-700` (skeleton) | `bg-muted`              | Skeletons de loading    |

### Componentes alvo (prioridade)

1. `src/app/dashboard/page.tsx` — 30+ classes hardcoded
2. `src/app/dashboard/layout.tsx` — sidebar, topbar
3. `src/components/dashboard/metric-card.tsx`
4. `src/components/leads/lead-card.tsx`, `lead-list.tsx`, `lead-filters.tsx`
5. `src/components/admin/admin-sidebar.tsx`, `stats-card.tsx`
6. `src/components/billing/pricing-card.tsx`
7. `src/components/landing/` (hero, footer, features, testimonials)
8. `src/components/auth/login-form.tsx`, `signup-form.tsx`
9. `src/components/ui/` (badge, card, button — verificar)
10. Demais componentes com padrão `dark:` explícito

---

## Banco de Dados

### Migration

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_theme_to_consultants.sql
ALTER TABLE consultants
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) NOT NULL DEFAULT 'corporate'
CHECK (theme IN ('corporate', 'noturno', 'moderno', 'classico'));
```

### API endpoint

`PATCH /api/consultants/me` — já existente, adicionar campo `theme` ao schema Zod de validação.

---

## Persistência — Detalhamento

```typescript
// SkinContext.setSkin()
async function setSkin(id: SkinId) {
  // 1. Aplicação imediata (visual)
  document.documentElement.setAttribute('data-skin', id);
  // Skin noturno também ativa a classe .dark para compatibilidade com
  // qualquer dark: variant remanescente durante a transição do refactor
  if (id === 'noturno') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // 2. Cache local (anti-flash próxima visita via JS)
  localStorage.setItem('consultor-ai-skin', id);

  // 3. Cookie (anti-flash SSR — próxima navegação server-side)
  document.cookie = `skin=${id}; path=/; max-age=${365 * 24 * 60 * 60}`;

  // 4. Banco de dados (sync entre dispositivos)
  await fetch('/api/consultants/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme: id }),
  });
}
```

```typescript
// app/layout.tsx (Server Component)
import { cookies } from 'next/headers';

const VALID_SKINS = ['corporate', 'noturno', 'moderno', 'classico'] as const;

export default async function RootLayout({ children }) {
  const cookieVal = cookies().get('skin')?.value;
  // Sanitize: rejeita valores inválidos/tampered antes de injetar no HTML
  const skin = VALID_SKINS.includes(cookieVal as any) ? cookieVal : 'corporate';
  return (
    <html lang="pt-BR" data-skin={skin} className={skin === 'noturno' ? 'dark' : ''}>
      ...
    </html>
  );
}
```

### Notas de persistência

- **`:root` mantido**: O bloco `:root` existente no `globals.css` é preservado como fallback no-JS. O seletor `[data-skin]` tem especificidade maior e sempre vence quando presente.
- **`.dark` deprecado progressivamente**: A classe `.dark` continua funcionando durante o período de refatoração. Após todos os `dark:` variants serem migrados para CSS variables, `.dark` pode ser removido. `setSkin('noturno')` adiciona `.dark` automaticamente para evitar regressões.
- **`VALID_SKINS` no layout**: O array `VALID_SKINS` em `layout.tsx` deve ser importado de `src/lib/skin/types.ts` (não duplicado) para manter fonte única da verdade — atenção à boundary Server Component.
- **Flash cross-device (limitação conhecida)**: Na primeira visita em um novo dispositivo, o cookie ainda não existe. O layout renderiza `corporate` por padrão. Após hidratação, o `SkinContext` lê o banco e corrige — causando um flash único. Isso é aceito como comportamento previsto; uma solução completa (SSR com leitura do DB no layout) está fora do escopo.

---

## Testes

- Unit: `SkinContext` — `setSkin` aplica `data-skin`, gerencia classe `.dark`, salva localStorage, chama API
- Unit: `SkinContext` — inicialização lê localStorage como fallback
- Unit: `SkinSwitcher` — renderiza 4 opções, destaca ativa com check mark, chama `setSkin` ao clicar
- Integration: `PATCH /api/consultants/me` (novo endpoint) — aceita `theme` válido, rejeita valor fora do enum, requer autenticação
- Integration: `layout.tsx` — cookie com valor válido renderiza `data-skin` correto; cookie com valor inválido/tampered renderiza `corporate`
- E2E: Trocar skin → recarregar → skin persiste (sem flash no mesmo dispositivo)

---

## Out of Scope

- Skins personalizáveis pelo usuário (custom color picker)
- Skins por página/seção
- Skin preview em tempo real no Settings antes de aplicar
- Animações de transição entre skins (fade/morph)
- Exportar/importar skins customizadas
- SSR com leitura do DB no layout (cross-device first-visit sem flash)

---

## Resumo de Entregas

| #   | Entrega                                                             | Tipo       |
| --- | ------------------------------------------------------------------- | ---------- |
| 1   | `globals.css` — 4 blocos `[data-skin]`, `:root` preservado          | CSS        |
| 2   | `src/lib/skin/` — types, skins, context                             | TypeScript |
| 3   | `skin-switcher.tsx` no header                                       | Componente |
| 4   | Seção "Aparência" adicionada à página existente `/dashboard/perfil` | Página     |
| 5   | `layout.tsx` com leitura + sanitização de cookie SSR                | Next.js    |
| 6   | Migration SQL `theme` em `consultants`                              | Database   |
| 7   | **Novo endpoint** `PATCH /api/consultants/me` (criar do zero)       | API        |
| 8   | Atualizar `src/types/database.ts` com campo `theme`                 | TypeScript |
| 9   | Refatoração de ~15 componentes (todos os `dark:` variants)          | Refactor   |
| 10  | Testes unitários, integração e E2E                                  | Tests      |
