# Getting Started - Consultor.AI

Este guia irá te ajudar a configurar o ambiente de desenvolvimento do Consultor.AI do zero.

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### Obrigatórios

- **Node.js 20 LTS ou superior**
  - Download: https://nodejs.org/
  - Verificar versão: `node --version`
  - Deve retornar: `v20.x.x` ou superior

- **npm 10 ou superior**
  - Geralmente instalado com Node.js
  - Verificar versão: `npm --version`
  - Deve retornar: `10.x.x` ou superior

- **Docker Desktop**
  - Download: https://www.docker.com/products/docker-desktop/
  - Necessário para rodar Supabase localmente
  - Verificar: `docker --version`

- **Git**
  - Download: https://git-scm.com/
  - Verificar: `git --version`

### Opcionais (Recomendados)

- **VS Code** - Editor recomendado
  - Download: https://code.visualstudio.com/
  - Extensões recomendadas:
    - ESLint
    - Prettier
    - Tailwind CSS IntelliSense
    - TypeScript Error Translator

---

## Passo 1: Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/consultor-ai.git

# Entre no diretório
cd consultor-ai
```

---

## Passo 2: Instalar Dependências

```bash
# Instalar todas as dependências do projeto
npm install
```

Isso irá instalar:
- Next.js 14
- React 18
- TypeScript
- Supabase clients
- Tailwind CSS
- shadcn/ui
- Vitest, Playwright
- E todas as outras dependências listadas em `package.json`

**Tempo estimado:** 2-5 minutos (dependendo da sua conexão)

---

## Passo 3: Configurar Variáveis de Ambiente

```bash
# Copiar o arquivo de exemplo
cp .env.example .env.local
```

Edite `.env.local` e preencha as variáveis necessárias:

```env
# Para desenvolvimento local com Supabase, use estas:
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<será gerado no próximo passo>

# Estas você precisará obter dos serviços:
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
WHATSAPP_API_KEY=your-whatsapp-api-key-here
```

### Como obter as API keys:

**Google AI API:**
1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Selecione um projeto do Google Cloud (ou crie um novo)
5. Copie e cole em `GOOGLE_AI_API_KEY`

**WhatsApp API (Weni Cloud):**
1. Acesse: https://weni.ai
2. Crie uma conta
3. Configure seu número WhatsApp Business
4. Obtenha as credenciais da API
5. Cole em `WHATSAPP_API_KEY` e `WHATSAPP_API_URL`

---

## Passo 4: Configurar Supabase Local

### 4.1 Instalar Supabase CLI

```bash
# Instalar globalmente
npm install -g supabase

# Verificar instalação
supabase --version
```

### 4.2 Iniciar Supabase

```bash
# Inicializar Supabase (já foi feito, mas caso precise)
# supabase init

# Iniciar todos os serviços do Supabase
supabase start
```

**Primeira vez:** Isso irá baixar as imagens Docker necessárias (~2GB). Pode demorar 5-10 minutos.

Quando terminar, você verá algo assim:

```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhb...
service_role key: eyJhb...
```

**IMPORTANTE:** Copie o `anon key` e cole em `.env.local` na variável `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4.3 Rodar Migrations

```bash
# Aplicar schema do banco de dados
supabase db reset

# Ou, se já tiver dados, apenas aplicar novas migrations:
# supabase db push
```

Isso irá:
1. Criar todas as tabelas (consultants, leads, flows, etc.)
2. Criar índices
3. Configurar RLS policies
4. Popular dados de exemplo (seed)

### 4.4 Verificar o Banco

Abra o Supabase Studio em: http://localhost:54323

- **Table Editor**: Ver e editar tabelas
- **SQL Editor**: Executar queries
- **Database**: Ver schema

Você deve ver:
- ✅ 9 tabelas criadas
- ✅ 1 consultor de teste
- ✅ 5 leads de exemplo
- ✅ 1 fluxo de saúde

---

## Passo 5: Iniciar o Servidor de Desenvolvimento

```bash
# Iniciar Next.js dev server
npm run dev
```

Abra seu navegador em: **http://localhost:3000**

Você deve ver a página inicial do Consultor.AI! 🎉

---

## Passo 6: Rodar os Testes

### Testes Unitários

```bash
# Rodar todos os testes unitários
npm run test:unit

# Rodar em modo watch
npm run test:watch

# Rodar com coverage
npm run test:coverage
```

### Testes E2E

```bash
# Instalar navegadores do Playwright (apenas primeira vez)
npx playwright install

# Rodar testes E2E
npm run test:e2e

# Rodar em modo UI (recomendado)
npm run test:e2e:ui
```

### Linting e Formatação

```bash
# Verificar lint
npm run lint

# Corrigir problemas de lint automaticamente
npm run lint:fix

# Verificar formatação
npm run format:check

# Formatar código
npm run format
```

---

## Estrutura do Projeto

```
consultor-ai/
├── .github/              # GitHub Actions workflows
├── .rules/               # Regras de desenvolvimento
├── docs/                 # Documentação técnica
├── src/
│   ├── app/             # Next.js 14 App Router
│   │   ├── (auth)/      # Rotas de autenticação
│   │   ├── (dashboard)/ # Rotas do dashboard
│   │   ├── api/         # API routes
│   │   └── layout.tsx   # Layout root
│   ├── components/      # Componentes React
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utilitários e serviços
│   │   ├── supabase/    # Clients do Supabase
│   │   ├── api/         # Wrappers de APIs externas
│   │   └── utils.ts     # Funções utilitárias
│   ├── types/           # TypeScript types
│   └── hooks/           # Custom React hooks
├── supabase/
│   ├── migrations/      # SQL migrations
│   ├── functions/       # Edge functions
│   ├── seed.sql         # Dados iniciais
│   └── config.toml      # Configuração local
├── tests/
│   ├── unit/            # Testes unitários
│   ├── integration/     # Testes de integração
│   ├── e2e/             # Testes E2E
│   ├── mocks/           # Mocks para testes
│   └── fixtures/        # Dados de teste
└── package.json
```

---

## Comandos Úteis

### Desenvolvimento

```bash
npm run dev              # Iniciar servidor de desenvolvimento
npm run build            # Build para produção
npm run start            # Iniciar servidor de produção
npm run lint             # Verificar erros de lint
npm run format           # Formatar código
npm run type-check       # Verificar tipos TypeScript
```

### Banco de Dados (Supabase)

```bash
supabase start           # Iniciar Supabase local
supabase stop            # Parar Supabase
supabase db reset        # Resetar banco (apaga tudo e recria)
supabase db push         # Aplicar migrations
npm run db:types         # Gerar types do TypeScript do schema
```

### Testes

```bash
npm run test             # Rodar todos os testes
npm run test:unit        # Apenas testes unitários
npm run test:integration # Apenas testes de integração
npm run test:e2e         # Apenas testes E2E
npm run test:coverage    # Rodar com coverage report
```

---

## Troubleshooting

### Problema: "Port 54321 already in use"

**Solução:**
```bash
# Parar Supabase
supabase stop

# Verificar se ainda tem processos rodando
lsof -i :54321

# Matar processo se necessário
kill -9 <PID>

# Iniciar novamente
supabase start
```

### Problema: "Cannot find module '@/...'"

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules .next
npm install
```

### Problema: Testes falhando com "database not found"

**Solução:**
```bash
# Garantir que Supabase está rodando
supabase start

# Resetar banco de dados
supabase db reset
```

### Problema: "EACCES: permission denied"

**Solução:**
```bash
# Não use sudo com npm install
# Se necessário, corrija permissões:
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules
```

### Problema: Docker não está rodando

**Solução:**
- Abra Docker Desktop
- Aguarde até ver "Docker is running"
- Tente `supabase start` novamente

### Problema: Erro "MODULE_NOT_FOUND"

**Solução:**
```bash
# Limpar tudo e recomeçar
rm -rf node_modules package-lock.json .next
npm install
```

---

## Próximos Passos

Agora que você tem tudo configurado, você pode:

1. **Explorar o código:**
   - Leia `src/app/page.tsx` para ver a homepage
   - Veja `src/lib/supabase/client.ts` para entender como usar Supabase
   - Explore os componentes em `src/components/`

2. **Criar sua primeira feature:**
   - Veja o Implementation Plan em `docs/technical/Implementation-Plan.md`
   - Escolha uma task do Sprint 1
   - Crie um branch: `git checkout -b feature/minha-feature`
   - Implemente e teste
   - Abra um Pull Request

3. **Ler a documentação:**
   - [Software Requirements Specification](../technical/SRS-Software-Requirements-Specification.md)
   - [System Architecture Document](../architecture/SAD-System-Architecture-Document.md)
   - [API Specification](../api/API-Specification.md)
   - [Coding Guidelines](../../.rules/coding-guidelines.md)
   - [Testing Standards](../../.rules/testing-standards.md)

4. **Explorar o Supabase Studio:**
   - Abra http://localhost:54323
   - Veja as tabelas criadas
   - Execute queries SQL
   - Teste RLS policies

---

## Recursos Adicionais

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Vitest:** https://vitest.dev
- **Playwright:** https://playwright.dev

---

## Precisa de Ajuda?

- **Issues do GitHub:** Abra uma issue no repositório
- **Documentação:** Consulte `docs/README.md`
- **Troubleshooting:** Veja a seção acima

---

**Status:** ✅ Ambiente configurado com sucesso!
**Próximo:** Começar desenvolvimento do MVP - Sprint 1

Bom desenvolvimento! 🚀
