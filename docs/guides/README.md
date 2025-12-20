# Guias de Configuração e Setup

Esta pasta contém todos os guias de configuração, setup, troubleshooting e documentação de correções do projeto Consultor.AI.

## 📂 Conteúdo

### Guias de Setup

- **[DOCKER-SETUP.md](./DOCKER-SETUP.md)** - Guia completo de configuração do Docker
- **[SETUP-COMPLETE.md](./SETUP-COMPLETE.md)** - Checklist de setup completo do ambiente
- **[SUPABASE-MIGRATION.md](./SUPABASE-MIGRATION.md)** - Guia de migração e configuração do Supabase

### Troubleshooting

- **[DOCKER-BUILD-FIX.md](./DOCKER-BUILD-FIX.md)** - Soluções para problemas comuns de build do Docker

### Próximos Passos

- **[NEXT-STEPS.md](./NEXT-STEPS.md)** - Roadmap e próximos passos de desenvolvimento

## 🎯 Propósito

Esta pasta foi criada para manter a raiz do projeto limpa e organizada. Seguindo a regra definida em `.rules/development-standards.md` Section 0, **NUNCA** crie arquivos de documentação diretamente na raiz do projeto.

## 📝 Quando Adicionar Arquivos Aqui

Adicione documentos nesta pasta quando:

- ✅ Criar guias de setup ou configuração
- ✅ Documentar soluções para problemas encontrados
- ✅ Escrever tutoriais de deploy ou migração
- ✅ Criar checklists de processos
- ✅ Documentar troubleshooting steps

## ❌ O Que NÃO Colocar Aqui

Não adicione:

- ❌ Especificações técnicas → Use `docs/technical/`
- ❌ Documentação de arquitetura → Use `docs/architecture/`
- ❌ Documentação de API → Use `docs/api/`
- ❌ Notas internas/TODOs → Use `docs/internal/`
- ❌ Scripts executáveis → Use `scripts/`

## 🔗 Documentação Relacionada

- **[CLAUDE.md](../../CLAUDE.md)** - Guia completo do projeto para IA
- **[README.md](../../README.md)** - Visão geral do projeto
- **[.rules/development-standards.md](../../.rules/development-standards.md)** - Padrões de desenvolvimento (inclui regras de organização)

## 📋 Template para Novos Guias

Ao criar um novo guia, use este template:

```markdown
# Nome do Guia

## Objetivo

[Descreva brevemente o que este guia resolve ou ensina]

## Pré-requisitos

- [ ] Requisito 1
- [ ] Requisito 2

## Passos

### 1. Primeiro Passo

```bash
# comandos exemplo
```

[Explicação]

### 2. Segundo Passo

[...]

## Verificação

Como verificar se funcionou:

```bash
# comando de verificação
```

## Troubleshooting

### Problema: [descrição]

**Solução**: [...]

## Referências

- [Link 1]
- [Link 2]

---

**Última Atualização**: YYYY-MM-DD
**Versão**: X.Y.Z
```

---

**Última Atualização**: 2025-12-17
**Mantido por**: Equipe Consultor.AI
