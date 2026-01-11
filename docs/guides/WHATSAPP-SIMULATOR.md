# Simulador de WhatsApp - Guia de Uso

**Data:** 2026-01-08
**Status:** ✅ Pronto para uso
**Objetivo:** Testar flow conversacional sem depender da API do WhatsApp

---

## 🎯 O que é?

Um simulador completo de WhatsApp que permite:
- ✅ Testar o flow engine conversacional
- ✅ Validar respostas com IA
- ✅ Verificar auto-criação de leads
- ✅ Testar botões interativos
- ✅ Visualizar estado da conversa
- ✅ Desenvolver sem API keys externas

**Tudo funciona localmente, sem internet!** (exceto chamadas à API do Gemini)

---

## 🚀 Como Usar

### 1. Iniciar o servidor

```bash
cd /mnt/e/PROJETOS/Consultor.AI
npm run dev
```

### 2. Acessar o simulador

Abra no navegador:
```
http://localhost:3000/dashboard/test/whatsapp-simulator
```

### 3. Conversar com o bot

1. Digite uma mensagem no campo de texto
2. Pressione **Enter** ou clique no botão de enviar
3. O bot responde automaticamente seguindo o flow
4. Se houver botões, clique neles para responder

---

## 📋 Pré-requisitos

### 1. Ter um consultor cadastrado

O simulador usa o primeiro consultor do banco de dados. Se não tiver nenhum:

```sql
-- Conecte-se ao Supabase e execute:
INSERT INTO consultants (email, name, whatsapp_number, vertical, slug)
VALUES (
  'teste@consultor.ai',
  'Consultor Teste',
  '5511999999999',
  'saude',
  'consultor-teste'
);
```

Ou use a interface de cadastro (se disponível).

### 2. Ter um flow ativo

O sistema precisa de um flow de saúde ativo. Verifique se existe:

```sql
SELECT * FROM flows WHERE vertical = 'saude' AND is_active = true;
```

Se não existir, execute o seed:

```bash
psql -h localhost -U postgres -d consultor_ai -f supabase/seed/seed.sql
```

---

## 🧪 Testando o Flow de Saúde

### Fluxo completo:

1. **Bot:** "Olá! 👋 Sou o assistente virtual..."
2. **Você:** "Olá" (ou qualquer mensagem)
3. **Bot:** "Qual é o seu perfil?" + botões
   - Individual
   - Casal
   - Familiar
   - Empresarial
4. **Você:** Clica em um botão (ex: "Familiar")
5. **Bot:** "Qual é a sua faixa etária?" + botões
   - Até 30 anos
   - 31 a 45 anos
   - 46 a 60 anos
   - Acima de 60 anos
6. **Você:** Clica em uma opção
7. **Bot:** "Você tem preferência por coparticipação?" + botões
   - Sim
   - Não
8. **Você:** Clica em uma opção
9. **Bot:** Gera resposta personalizada com IA 🤖

---

## 🔍 O que Acontece nos Bastidores

### 1. Auto-criação de Lead
```
Número simulado: 5511999999999
↓
Sistema verifica se lead existe
↓
Se não existe, cria automaticamente
↓
Lead criado com status "novo"
```

### 2. Criação de Conversation
```
Lead encontrado/criado
↓
Sistema busca flow ativo de "saude"
↓
Cria nova conversa com estado inicial
↓
Conversation ativa criada
```

### 3. Processamento de Mensagens
```
Mensagem recebida
↓
Flow Engine processa com base no estado atual
↓
Executa step (mensagem/escolha/ação)
↓
Atualiza estado da conversa
↓
Retorna resposta + próximo step
```

### 4. Geração de Resposta com IA
```
Todos os dados coletados
↓
Monta contexto com perfil + idade + coparticipação
↓
Chama API do Gemini
↓
Resposta personalizada gerada
↓
Lead marcado como "qualificado"
↓
Score calculado (0-100)
```

### 5. Salvamento de Mensagens
```
Cada mensagem (user + bot) salva no banco
↓
Histórico completo disponível
↓
Pode ser usado para analytics
```

---

## 📊 Verificando os Dados

### Ver leads criados

```sql
SELECT id, whatsapp_number, name, status, score, created_at
FROM leads
ORDER BY created_at DESC
LIMIT 10;
```

### Ver conversas

```sql
SELECT c.id, c.status, c.state, l.whatsapp_number
FROM conversations c
JOIN leads l ON l.id = c.lead_id
ORDER BY c.created_at DESC
LIMIT 10;
```

### Ver mensagens

```sql
SELECT m.direction, m.content, m.created_at
FROM messages m
JOIN conversations c ON c.id = m.conversation_id
ORDER BY m.created_at DESC
LIMIT 20;
```

### Ver analytics

Acesse o dashboard:
```
http://localhost:3000/dashboard/analytics
```

Você verá:
- Total de leads (incluindo os criados pelo simulador)
- Taxa de conversão
- Leads por status
- Gráficos atualizados

---

## 🎨 Interface do Simulador

### Layout estilo WhatsApp

- **Header verde**: Logo + nome do bot + status online
- **Fundo com padrão**: Similar ao WhatsApp real
- **Mensagens do usuário**: Balões verdes à direita
- **Mensagens do bot**: Balões cinza à esquerda
- **Botões interativos**: Quando o flow oferece escolhas
- **Input fixo**: Campo de texto + botão de enviar no rodapé

### Estados visuais

- **Digitando...**: Animação de 3 bolinhas quando aguardando resposta
- **Timestamps**: Hora em cada mensagem
- **Auto-scroll**: Rola automaticamente para última mensagem

---

## 🐛 Troubleshooting

### ❌ Erro: "Nenhum consultor encontrado"

**Solução**: Crie um consultor no banco (veja "Pré-requisitos" acima)

### ❌ Erro: "Nenhum flow ativo encontrado"

**Solução**: Execute o seed do banco de dados:
```bash
psql -h localhost -U postgres -d consultor_ai -f supabase/seed/seed.sql
```

### ❌ Erro: "Cannot read property 'id' of null"

**Causas possíveis**:
1. Supabase não está rodando
2. Credenciais erradas no `.env`
3. Migrations não foram aplicadas

**Solução**:
```bash
# Verificar Supabase
docker-compose ps

# Se não estiver rodando
docker-compose up -d

# Aplicar migrations
npx supabase db push
```

### ❌ Bot não responde / Fica carregando infinitamente

**Soluções**:
1. Verifique o console do navegador (F12) para erros
2. Verifique logs do servidor (`npm run dev`)
3. Confirme que API do Gemini está configurada (`.env`):
   ```env
   GOOGLE_AI_API_KEY=sua_chave_aqui
   ```

### ❌ Resposta da IA está genérica/ruim

**Isso é esperado!** O prompt pode ser melhorado. Edite:
```
src/lib/services/ai-service.ts
```

Ajuste o prompt do Gemini para melhorar as respostas.

---

## 🔧 Customização

### Alterar número simulado

Edite `src/app/dashboard/test/whatsapp-simulator/page.tsx`:

```typescript
const [phoneNumber] = useState('5511888888888'); // Novo número
```

### Adicionar mais mensagens iniciais

```typescript
const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    from: 'bot',
    text: 'Olá! 👋 Sou o assistente virtual...',
    timestamp: Date.now(),
  },
  {
    id: '2',
    from: 'bot',
    text: 'Como posso te ajudar hoje?',
    timestamp: Date.now(),
  },
]);
```

### Mudar cores do chat

As cores seguem o tema do WhatsApp:
- `bg-[#005c4b]` - Mensagens do usuário (verde)
- `bg-[#1f2c33]` - Mensagens do bot (cinza)
- `bg-[#0a1014]` - Fundo (preto)

Customize no arquivo do componente.

---

## 🚀 Próximos Passos

Agora que você tem o simulador funcionando:

1. ✅ **Desenvolva novas features** sem se preocupar com WhatsApp
2. ✅ **Teste diferentes flows** conversacionais
3. ✅ **Ajuste prompts da IA** para melhorar respostas
4. ✅ **Adicione novos steps** ao flow de saúde
5. ✅ **Crie flows para outros verticais** (imóveis, etc)
6. ✅ **Valide analytics** com dados simulados

Quando tudo estiver pronto:
- Integre com a API real do WhatsApp (Meta ou Twilio)
- Configure webhooks de produção
- Deploy em servidor com domínio real

---

## 📚 Arquivos Relacionados

- **Interface**: `src/app/dashboard/test/whatsapp-simulator/page.tsx`
- **Webhook Mock**: `src/app/api/webhook/mock/route.ts`
- **Flow Engine**: `src/lib/flow-engine/`
- **AI Service**: `src/lib/services/ai-service.ts`
- **Lead Auto-Create**: `src/lib/services/lead-auto-create.ts`
- **Default Flow**: `supabase/seed/default-health-flow.json`

---

## 💡 Dicas

1. **Use o console do navegador** para ver logs de debug
2. **Abra várias abas** do simulador para testar conversas diferentes
3. **Limpe o banco** periodicamente durante testes:
   ```sql
   DELETE FROM messages;
   DELETE FROM conversations;
   DELETE FROM leads WHERE whatsapp_number LIKE '5511%';
   ```
4. **Teste casos extremos**: mensagens muito longas, caracteres especiais, etc
5. **Valide o score calculado** para diferentes combinações de respostas

---

**Última atualização**: 2026-01-08
**Status**: ✅ Funcional e testado
**Modo**: Desenvolvimento local (sem API externa)
