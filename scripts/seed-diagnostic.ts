/**
 * Diagnostic Seed Script for Consultor.AI
 *
 * Populates a local Supabase database with realistic Brazilian test data
 * for diagnostic and debugging purposes.
 *
 * Usage: npx tsx scripts/seed-diagnostic.ts
 *
 * SAFETY: This script REFUSES to run against non-local databases.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v5 as uuidv5 } from 'uuid';

// ============================================================================
// Types
// ============================================================================

interface SeedConsultantConfig {
  index: number;
  email: string;
  password: string;
  name: string;
  whatsappNumber: string;
  city: string;
  ddd: string;
  plan: 'freemium' | 'pro' | 'agencia';
  credits: number;
  monthlyCreditsAllocation: number;
  isAdmin: boolean;
}

interface CreatedConsultant {
  id: string;
  userId: string;
  email: string;
  name: string;
  plan: string;
  ddd: string;
}

interface CreatedLead {
  id: string;
  consultantId: string;
  consultantName: string;
  name: string;
  whatsappNumber: string;
  status: string;
  score: number;
  metadata: Record<string, string>;
  createdAt: Date;
}

interface CreatedConversation {
  id: string;
  leadId: string;
  status: string;
  messageCount: number;
  createdAt: Date;
}

type SeedCounts = {
  authUsers: number;
  consultants: number;
  leads: number;
  conversations: number;
  messages: number;
  followUps: number;
  messageTemplates: number;
};

// ============================================================================
// Constants
// ============================================================================

const SEED_NAMESPACE = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

// ============================================================================
// Brazilian Data Arrays
// ============================================================================

const FIRST_NAMES = [
  'Ana', 'Beatriz', 'Carlos', 'Daniel', 'Eduardo', 'Fernanda', 'Gabriel',
  'Helena', 'Igor', 'Julia', 'Lucas', 'Mariana', 'Nicolas', 'Olivia',
  'Pedro', 'Rafaela', 'Samuel', 'Tatiana', 'Vinicius', 'Yasmin',
  'André', 'Bruna', 'Caio', 'Diana', 'Felipe', 'Giovanna', 'Henrique',
  'Isabela', 'João', 'Karina', 'Leonardo', 'Manuela', 'Nathan', 'Priscila',
  'Ricardo', 'Sofia', 'Thiago', 'Valentina', 'Wagner', 'Zara',
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira',
  'Almeida', 'Nascimento', 'Lima', 'Araújo', 'Pereira', 'Barbosa',
  'Ribeiro', 'Carvalho', 'Gomes', 'Martins', 'Rocha', 'Correia',
  'Dias', 'Teixeira', 'Costa', 'Nunes', 'Moreira', 'Cardoso',
  'Melo', 'Freitas', 'Vieira', 'Castro', 'Monteiro', 'Pinto',
];

const CITY_DDDS: Array<{ city: string; ddd: string }> = [
  { city: 'São Paulo', ddd: '11' },
  { city: 'Rio de Janeiro', ddd: '21' },
  { city: 'Belo Horizonte', ddd: '31' },
  { city: 'Curitiba', ddd: '41' },
  { city: 'Porto Alegre', ddd: '51' },
  { city: 'Brasília', ddd: '61' },
  { city: 'Salvador', ddd: '71' },
  { city: 'Recife', ddd: '81' },
  { city: 'Fortaleza', ddd: '85' },
  { city: 'Belém', ddd: '91' },
];

// ============================================================================
// Status & Metadata Distributions
// ============================================================================

type LeadStatus = 'novo' | 'em_contato' | 'qualificado' | 'agendado' | 'fechado' | 'perdido';

const STATUS_DISTRIBUTION: Array<{ status: LeadStatus; count: number; scoreMin: number; scoreMax: number }> = [
  { status: 'novo', count: 3, scoreMin: 0, scoreMax: 20 },
  { status: 'em_contato', count: 3, scoreMin: 20, scoreMax: 45 },
  { status: 'qualificado', count: 3, scoreMin: 60, scoreMax: 85 },
  { status: 'agendado', count: 2, scoreMin: 50, scoreMax: 75 },
  { status: 'fechado', count: 2, scoreMin: 80, scoreMax: 100 },
  { status: 'perdido', count: 2, scoreMin: 0, scoreMax: 30 },
];

const PERFIL_OPTIONS = ['individual', 'casal', 'familia', 'empresarial'] as const;
const FAIXA_ETARIA_OPTIONS = ['ate_30', '31_45', '46_60', 'acima_60'] as const;
const COPARTICIPACAO_OPTIONS = ['sim', 'nao'] as const;

// ============================================================================
// Message Content Templates (Portuguese)
// ============================================================================

const OUTBOUND_MESSAGES = [
  'Olá! Bem-vindo ao Consultor.AI! Sou o assistente virtual e vou te ajudar a encontrar o plano de saúde ideal. Vamos começar?',
  'Para encontrar a melhor opção, preciso saber: qual o perfil do plano que você procura?',
  'Ótimo! Agora me diga: qual a faixa etária do titular do plano?',
  'Perfeito! Uma última pergunta: você tem preferência por plano com coparticipação? Com coparticipação o valor mensal é menor, mas há um custo por procedimento.',
  'Baseado nas suas respostas, encontrei algumas opções excelentes para o seu perfil! Vou preparar uma recomendação personalizada.',
  'Obrigado pelo seu interesse! Um de nossos consultores entrará em contato em breve para apresentar as melhores opções. Até logo!',
];

const INBOUND_RESPONSES: Record<string, string[]> = {
  perfil: ['Individual', 'Para casal', 'Para minha família', 'Para empresa'],
  idade: ['Tenho menos de 30 anos', 'Entre 31 e 45 anos', 'Entre 46 e 60 anos', 'Acima de 60 anos'],
  coparticipacao: ['Sim, com coparticipação', 'Não, prefiro sem coparticipação'],
};

// ============================================================================
// Follow-up Templates
// ============================================================================

const FOLLOW_UP_TITLES = [
  'Retorno sobre cotação',
  'Acompanhamento semanal',
  'Verificar interesse',
  'Lembrete de reunião',
  'Enviar proposta atualizada',
];

const FOLLOW_UP_MESSAGES = [
  'Olá! Passando para saber se você teve alguma dúvida sobre as opções de plano que conversamos.',
  'Oi! Gostaria de saber se conseguiu analisar a proposta que enviei. Posso ajudar em algo?',
  'Bom dia! Só passando para lembrar que temos condições especiais este mês. Quer saber mais?',
  'Olá! Vi que você demonstrou interesse em nossos planos. Posso agendar uma conversa para tirar suas dúvidas?',
  'Oi! Tenho novidades sobre os planos que conversamos. Quando podemos conversar?',
];

// ============================================================================
// Message Template Definitions
// ============================================================================

const TEMPLATE_DEFINITIONS = [
  {
    name: 'Boas-vindas',
    category: 'greeting' as const,
    content: 'Olá {{nome_lead}}, sou {{nome_consultor}}! Tudo bem? Estou aqui para te ajudar a encontrar o plano de saúde ideal para você e sua família.',
    variables: ['{{nome_lead}}', '{{nome_consultor}}'],
  },
  {
    name: 'Retorno semanal',
    category: 'follow_up' as const,
    content: 'Oi {{nome_lead}}, passando para saber se você teve alguma dúvida sobre as opções de plano que conversamos. Estou à disposição!',
    variables: ['{{nome_lead}}'],
  },
  {
    name: 'Qualificação inicial',
    category: 'qualification' as const,
    content: '{{nome_lead}}, para encontrar o melhor plano de saúde para você, preciso de algumas informações rápidas. Podemos começar?',
    variables: ['{{nome_lead}}'],
  },
];

// ============================================================================
// Consultant Configs
// ============================================================================

const CONSULTANT_CONFIGS: SeedConsultantConfig[] = [
  { index: 0, email: 'consultor0@seed.local', password: 'seed123456', name: 'Marcos Oliveira', whatsappNumber: '+5511999000001', city: 'São Paulo', ddd: '11', plan: 'freemium', credits: 20, monthlyCreditsAllocation: 20, isAdmin: true },
  { index: 1, email: 'consultor1@seed.local', password: 'seed123456', name: 'Camila Santos', whatsappNumber: '+5521999000002', city: 'Rio de Janeiro', ddd: '21', plan: 'freemium', credits: 15, monthlyCreditsAllocation: 20, isAdmin: false },
  { index: 2, email: 'consultor2@seed.local', password: 'seed123456', name: 'Roberto Ferreira', whatsappNumber: '+5531999000003', city: 'Belo Horizonte', ddd: '31', plan: 'pro', credits: 180, monthlyCreditsAllocation: 200, isAdmin: false },
  { index: 3, email: 'consultor3@seed.local', password: 'seed123456', name: 'Patricia Almeida', whatsappNumber: '+5541999000004', city: 'Curitiba', ddd: '41', plan: 'pro', credits: 150, monthlyCreditsAllocation: 200, isAdmin: false },
  { index: 4, email: 'consultor4@seed.local', password: 'seed123456', name: 'Fernando Costa', whatsappNumber: '+5551999000005', city: 'Porto Alegre', ddd: '51', plan: 'agencia', credits: 950, monthlyCreditsAllocation: 1000, isAdmin: false },
  { index: 5, email: 'consultor5@seed.local', password: 'seed123456', name: 'Juliana Lima', whatsappNumber: '+5561999000006', city: 'Brasília', ddd: '61', plan: 'freemium', credits: 20, monthlyCreditsAllocation: 20, isAdmin: false },
];

// ============================================================================
// Utility Functions
// ============================================================================

export function generateDeterministicId(seed: string): string {
  return uuidv5(seed, SEED_NAMESPACE);
}

export function generateWhatsAppNumber(ddd: string, index: number): string {
  const suffix = String(index).padStart(8, '0');
  return `+55${ddd}9${suffix}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function pickRandom<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): Date {
  const now = new Date();
  const ms = now.getTime() - randomInt(0, daysAgo * 24 * 60 * 60 * 1000);
  return new Date(ms);
}

// ============================================================================
// Safety Guard
// ============================================================================

export function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function assertLocalDatabase(): void {
  const url = getSupabaseUrl();

  if (!url) {
    console.error('❌ ERROR: SUPABASE_URL is not set.');
    console.error('   Please configure .env or .env.local with SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.');
    process.exit(1);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is not set.');
    console.error("   Run 'supabase status' and copy the service_role key to .env.local.");
    process.exit(1);
  }

  const isProduction = url.includes('.supabase.co');
  const isLocal = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('host.docker.internal');

  if (isProduction || !isLocal) {
    console.error('❌ SAFETY: Refusing to run seed on non-local database.');
    console.error(`   SUPABASE_URL = ${url}`);
    console.error('   This script should only run against a local Supabase instance.');
    process.exit(1);
  }

  console.log(`🔒 Safety check: SUPABASE_URL = ${url} ✓`);
}

// ============================================================================
// Supabase Client Initialization
// ============================================================================

function createSupabaseAdmin(): SupabaseClient {
  return createClient(
    getSupabaseUrl()!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ============================================================================
// Schema Detection
// ============================================================================

async function hasBillingColumns(supabase: SupabaseClient): Promise<boolean> {
  // Try selecting a billing-specific column to detect if billing migration was applied
  const { error } = await supabase.from('consultants').select('credits').limit(0);
  return !error;
}

async function tableExists(supabase: SupabaseClient, tableName: string): Promise<boolean> {
  const { error } = await supabase.from(tableName).select('*').limit(0);
  return !error;
}

// ============================================================================
// Seed Functions
// ============================================================================

async function seedAuthUsers(supabase: SupabaseClient): Promise<Map<string, string>> {
  console.log('📦 Creating 6 auth users...');
  const emailToUserId = new Map<string, string>();

  for (const config of CONSULTANT_CONFIGS) {
    const deterministicId = generateDeterministicId(config.email);

    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: config.email,
        password: config.password,
        email_confirm: true,
        user_metadata: { name: config.name },
      });

      if (error) {
        // User may already exist — try to find them regardless of error type
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers?.users?.find((u) => u.email === config.email);
        if (existing) {
          emailToUserId.set(config.email, existing.id);
          console.log(`  ✓ ${config.email} (exists)${config.isAdmin ? ' (admin)' : ''}`);
          continue;
        }
        console.error(`  ✗ ${config.email}: ${error.message}`);
        continue;
      }

      if (data.user) {
        emailToUserId.set(config.email, data.user.id);
        console.log(`  ✓ ${config.email}${config.isAdmin ? ' (admin)' : ''}`);
      }
    } catch (err) {
      console.error(`  ✗ ${config.email}: ${err}`);
    }
  }

  return emailToUserId;
}

async function seedConsultants(
  supabase: SupabaseClient,
  emailToUserId: Map<string, string>,
  billingEnabled: boolean
): Promise<CreatedConsultant[]> {
  console.log('👤 Creating 6 consultants...');
  if (!billingEnabled) {
    console.log('  ℹ Billing columns not detected — inserting core fields only');
  }
  const consultants: CreatedConsultant[] = [];

  for (const config of CONSULTANT_CONFIGS) {
    const userId = emailToUserId.get(config.email);
    if (!userId) {
      console.error(`  ✗ No auth user found for ${config.email}, skipping consultant`);
      continue;
    }

    const consultantId = generateDeterministicId(`consultant-${config.email}`);
    const slug = generateSlug(config.name);

    // Core fields (always present)
    const record: Record<string, unknown> = {
      id: consultantId,
      user_id: userId,
      email: config.email,
      name: config.name,
      whatsapp_number: config.whatsappNumber,
      vertical: 'saude',
      slug,
      subscription_tier: config.plan,
      settings: {
        notifications: { email: true, whatsapp: true },
        preferences: { language: 'pt-BR', timezone: 'America/Sao_Paulo' },
      },
    };

    // Billing fields (only if billing migration was applied)
    if (billingEnabled) {
      record.subscription_plan = config.plan;
      record.subscription_status = 'active';
      record.monthly_lead_limit = config.plan === 'agencia' ? 1000 : config.plan === 'pro' ? 200 : 20;
      record.credits = config.credits;
      record.purchased_credits = 0;
      record.monthly_credits_allocation = config.monthlyCreditsAllocation;
      record.is_admin = config.isAdmin;
    }

    const { error } = await supabase
      .from('consultants')
      .upsert(record, { onConflict: 'email' });

    if (error) {
      console.error(`  ✗ ${config.name}: ${error.message}`);
      continue;
    }

    consultants.push({
      id: consultantId,
      userId,
      email: config.email,
      name: config.name,
      plan: config.plan,
      ddd: config.ddd,
    });
  }

  const planCounts = consultants.reduce(
    (acc, c) => {
      acc[c.plan] = (acc[c.plan] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const planSummary = Object.entries(planCounts)
    .map(([plan, count]) => `${count} ${plan}`)
    .join(', ');
  console.log(`  ✓ ${planSummary}`);

  return consultants;
}

async function seedLeads(
  supabase: SupabaseClient,
  consultants: CreatedConsultant[]
): Promise<CreatedLead[]> {
  console.log(`📋 Creating ${consultants.length * 15} leads (15 per consultant)...`);
  const allLeads: CreatedLead[] = [];
  let nameIndex = 0;

  for (const consultant of consultants) {
    let leadIndex = 0;

    for (const dist of STATUS_DISTRIBUTION) {
      for (let i = 0; i < dist.count; i++) {
        const firstName = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
        const lastName = LAST_NAMES[nameIndex % LAST_NAMES.length];
        const fullName = `${firstName} ${lastName}`;
        const whatsapp = generateWhatsAppNumber(consultant.ddd, leadIndex + 100);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const score = randomInt(dist.scoreMin, dist.scoreMax);
        const createdAt = randomDate(30);
        const metadata = {
          perfil: PERFIL_OPTIONS[nameIndex % PERFIL_OPTIONS.length],
          faixa_etaria: FAIXA_ETARIA_OPTIONS[nameIndex % FAIXA_ETARIA_OPTIONS.length],
          coparticipacao: COPARTICIPACAO_OPTIONS[nameIndex % COPARTICIPACAO_OPTIONS.length],
        };

        const record = {
          consultant_id: consultant.id,
          whatsapp_number: whatsapp,
          name: fullName,
          email,
          status: dist.status,
          score,
          metadata,
          source: nameIndex % 3 === 0 ? 'manual' : 'whatsapp',
          created_at: createdAt.toISOString(),
          last_contacted_at: dist.status !== 'novo' ? new Date(createdAt.getTime() + randomInt(1, 48) * 3600000).toISOString() : null,
        };

        const { data, error } = await supabase
          .from('leads')
          .upsert(record, { onConflict: 'consultant_id,whatsapp_number' })
          .select('id')
          .single();

        if (error) {
          // Try insert without upsert — might be existing
          const { data: existing } = await supabase
            .from('leads')
            .select('id')
            .eq('consultant_id', consultant.id)
            .eq('whatsapp_number', whatsapp)
            .single();

          if (existing) {
            allLeads.push({
              id: existing.id,
              consultantId: consultant.id,
              consultantName: consultant.name,
              name: fullName,
              whatsappNumber: whatsapp,
              status: dist.status,
              score,
              metadata,
              createdAt,
            });
          }
        } else if (data) {
          allLeads.push({
            id: data.id,
            consultantId: consultant.id,
            consultantName: consultant.name,
            name: fullName,
            whatsappNumber: whatsapp,
            status: dist.status,
            score,
            metadata,
            createdAt,
          });
        }

        nameIndex++;
        leadIndex++;
      }
    }
  }

  console.log('  ✓ All 6 statuses represented per consultant');
  return allLeads;
}

async function lookupDefaultFlow(supabase: SupabaseClient): Promise<string | null> {
  const { data, error } = await supabase
    .from('flows')
    .select('id')
    .eq('is_default', true)
    .eq('vertical', 'saude')
    .single();

  if (error || !data) {
    console.warn('⚠️  Default health flow not found — skipping conversations & messages.');
    console.warn("   Expected: is_default = true AND vertical = 'saude'");
    console.warn("   Fix: Run 'supabase db reset' to apply seeds including 01_default_flows.sql.");
    return null;
  }

  return data.id;
}

async function seedConversations(
  supabase: SupabaseClient,
  leads: CreatedLead[],
  flowId: string,
  consultants: CreatedConsultant[]
): Promise<CreatedConversation[]> {
  console.log(`💬 Creating ${leads.length * 2} conversations (2 per lead)...`);
  const conversations: CreatedConversation[] = [];
  const consultantMap = new Map(consultants.map((c) => [c.id, c.name]));

  for (const lead of leads) {
    const consultantName = consultantMap.get(lead.consultantId) || 'Consultor';

    for (let convIndex = 0; convIndex < 2; convIndex++) {
      const isFirst = convIndex === 0;
      const status = isFirst ? 'completed' : pickRandom(['active', 'completed', 'abandoned'] as const);
      const completionPercentage = status === 'completed' ? 100 : randomInt(30, 80);
      const currentStepId = status === 'completed' ? 'finalizar' : pickRandom(['pergunta_perfil', 'pergunta_idade', 'pergunta_coparticipacao'] as const);
      const startedAt = new Date(lead.createdAt.getTime() + convIndex * 86400000 + randomInt(0, 3600000));
      const completedAt = status === 'completed' ? new Date(startedAt.getTime() + randomInt(300000, 1800000)) : null;

      const state = {
        responses: status === 'completed'
          ? {
              perfil: lead.metadata.perfil,
              idade: lead.metadata.faixa_etaria,
              coparticipacao: lead.metadata.coparticipacao,
            }
          : currentStepId === 'pergunta_coparticipacao'
            ? { perfil: lead.metadata.perfil, idade: lead.metadata.faixa_etaria }
            : currentStepId === 'pergunta_idade'
              ? { perfil: lead.metadata.perfil }
              : {},
        context: { consultant_name: consultantName },
      };

      const messageCount = isFirst ? randomInt(4, 6) : randomInt(3, 5);

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          lead_id: lead.id,
          flow_id: flowId,
          status,
          current_step_id: currentStepId,
          state,
          message_count: 0, // Will be updated by trigger
          completion_percentage: completionPercentage,
          started_at: startedAt.toISOString(),
          completed_at: completedAt?.toISOString() || null,
          last_message_at: (completedAt || startedAt).toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        // Check if already exists (idempotency)
        const { data: existingConvs } = await supabase
          .from('conversations')
          .select('id')
          .eq('lead_id', lead.id);

        if (existingConvs && existingConvs.length >= 2) {
          // Already seeded
          for (const conv of existingConvs) {
            conversations.push({
              id: conv.id,
              leadId: lead.id,
              status,
              messageCount,
              createdAt: startedAt,
            });
          }
          break; // Skip second conversation insert for this lead
        }
        continue;
      }

      if (data) {
        conversations.push({
          id: data.id,
          leadId: lead.id,
          status,
          messageCount,
          createdAt: startedAt,
        });
      }
    }
  }

  console.log(`  ✓ Flow: Qualificação Saúde (default)`);
  return conversations;
}

async function seedMessages(
  supabase: SupabaseClient,
  conversations: CreatedConversation[]
): Promise<number> {
  console.log(`📝 Creating ${conversations.length * 3}+ messages (3+ per conversation)...`);
  let totalMessages = 0;

  for (const conv of conversations) {
    // Check if messages already exist for this conversation
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conv.id);

    if (count && count > 0) {
      totalMessages += count;
      continue; // Already seeded
    }

    const numMessages = conv.messageCount;
    const baseTime = conv.createdAt;

    for (let i = 0; i < numMessages; i++) {
      const isOutbound = i % 2 === 0;
      const direction = isOutbound ? 'outbound' : 'inbound';

      let content: string;
      if (isOutbound) {
        content = OUTBOUND_MESSAGES[Math.min(Math.floor(i / 2), OUTBOUND_MESSAGES.length - 1)];
      } else {
        const step = Math.floor(i / 2);
        if (step === 0) {
          content = pickRandom(INBOUND_RESPONSES.perfil);
        } else if (step === 1) {
          content = pickRandom(INBOUND_RESPONSES.idade);
        } else {
          content = pickRandom(INBOUND_RESPONSES.coparticipacao);
        }
      }

      const messageTime = new Date(baseTime.getTime() + i * randomInt(30000, 120000));

      const { error } = await supabase.from('messages').insert({
        conversation_id: conv.id,
        direction,
        content,
        content_type: 'text',
        status: isOutbound ? 'delivered' : 'read',
        is_ai_generated: isOutbound,
        created_at: messageTime.toISOString(),
        sent_at: isOutbound ? messageTime.toISOString() : null,
        delivered_at: isOutbound ? new Date(messageTime.getTime() + 1000).toISOString() : null,
        read_at: !isOutbound ? new Date(messageTime.getTime() + 2000).toISOString() : null,
      });

      if (!error) {
        totalMessages++;
      }
    }
  }

  console.log('  ✓ Mix of inbound/outbound');
  return totalMessages;
}

async function seedFollowUps(
  supabase: SupabaseClient,
  leads: CreatedLead[],
  consultants: CreatedConsultant[]
): Promise<number> {
  console.log('📅 Creating 30+ follow-ups...');
  let totalFollowUps = 0;

  // Select ~40% of leads
  const selectedLeads = leads.filter((_, i) => i % 2 === 0 || i % 5 === 0).slice(0, 35);

  const statusDistribution: Array<{ status: string; countTarget: number }> = [
    { status: 'pending', countTarget: 10 },
    { status: 'sent', countTarget: 8 },
    { status: 'completed', countTarget: 8 },
    { status: 'cancelled', countTarget: 4 },
  ];

  let statusIndex = 0;
  let statusCount = 0;

  for (const lead of selectedLeads) {
    const currentDist = statusDistribution[statusIndex];
    const followUpStatus = currentDist.status;
    const followUpId = generateDeterministicId(`followup-${lead.id}-0`);
    const now = new Date();

    let scheduledAt: Date;
    let completedAt: Date | null = null;
    let sentAt: Date | null = null;
    let cancelledAt: Date | null = null;

    if (followUpStatus === 'pending') {
      scheduledAt = new Date(now.getTime() + randomInt(1, 14) * 86400000);
    } else if (followUpStatus === 'sent') {
      scheduledAt = new Date(now.getTime() - randomInt(1, 7) * 86400000);
      sentAt = new Date(scheduledAt.getTime() + randomInt(0, 3600000));
    } else if (followUpStatus === 'completed') {
      scheduledAt = new Date(now.getTime() - randomInt(7, 30) * 86400000);
      sentAt = new Date(scheduledAt.getTime() + randomInt(0, 3600000));
      completedAt = new Date(sentAt.getTime() + randomInt(3600000, 86400000));
    } else {
      scheduledAt = new Date(now.getTime() - randomInt(1, 14) * 86400000);
      cancelledAt = new Date(scheduledAt.getTime() - randomInt(3600000, 86400000));
    }

    // Ensure created_at is before scheduled_at for constraint
    const createdAt = new Date(scheduledAt.getTime() - randomInt(86400000, 7 * 86400000));

    const { error } = await supabase.from('follow_ups').upsert(
      {
        id: followUpId,
        lead_id: lead.id,
        consultant_id: lead.consultantId,
        title: `${pickRandom(FOLLOW_UP_TITLES)} - ${lead.name}`,
        message: pickRandom(FOLLOW_UP_MESSAGES),
        scheduled_at: scheduledAt.toISOString(),
        status: followUpStatus,
        is_automatic: false,
        auto_send: false,
        completed_at: completedAt?.toISOString() || null,
        sent_at: sentAt?.toISOString() || null,
        cancelled_at: cancelledAt?.toISOString() || null,
        created_at: createdAt.toISOString(),
      },
      { onConflict: 'id' }
    );

    if (!error) {
      totalFollowUps++;
    }

    statusCount++;
    if (statusCount >= currentDist.countTarget && statusIndex < statusDistribution.length - 1) {
      statusIndex++;
      statusCount = 0;
    }
  }

  console.log('  ✓ Distributed across statuses');
  return totalFollowUps;
}

async function seedMessageTemplates(
  supabase: SupabaseClient,
  consultants: CreatedConsultant[]
): Promise<number> {
  console.log(`📄 Creating ${consultants.length * 3}+ message templates (3 per consultant)...`);
  let totalTemplates = 0;

  for (const consultant of consultants) {
    for (const template of TEMPLATE_DEFINITIONS) {
      const templateId = generateDeterministicId(`template-${consultant.id}-${template.category}`);

      const { error } = await supabase.from('message_templates').upsert(
        {
          id: templateId,
          consultant_id: consultant.id,
          name: template.name,
          category: template.category,
          content: template.content,
          variables: template.variables,
          is_active: true,
          is_default: false,
          use_count: randomInt(0, 15),
        },
        { onConflict: 'id' }
      );

      if (!error) {
        totalTemplates++;
      }
    }
  }

  console.log('  ✓ Categories: greeting, follow_up, qualification');
  return totalTemplates;
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const startTime = performance.now();

  // Load environment files (using require to avoid Vite analysis)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenv = require('dotenv');
    // Load .env first, then .env.local (later takes precedence for overlapping keys)
    dotenv.config({ path: '.env' });
    dotenv.config({ path: '.env.local' });
  } catch {
    // dotenv not available — env must be set externally
  }

  // Safety check
  assertLocalDatabase();

  // Initialize Supabase admin client
  const supabase = createSupabaseAdmin();

  // Track counts
  const counts: SeedCounts = {
    authUsers: 0,
    consultants: 0,
    leads: 0,
    conversations: 0,
    messages: 0,
    followUps: 0,
    messageTemplates: 0,
  };

  // Detect schema capabilities
  const billingEnabled = await hasBillingColumns(supabase);

  // Phase 1: Auth Users & Consultants (US1)
  const emailToUserId = await seedAuthUsers(supabase);
  counts.authUsers = emailToUserId.size;

  const consultants = await seedConsultants(supabase, emailToUserId, billingEnabled);
  counts.consultants = consultants.length;

  // Phase 2: Leads (US2)
  const leads = await seedLeads(supabase, consultants);
  counts.leads = leads.length;

  // Phase 3: Conversations & Messages (US3)
  const flowId = await lookupDefaultFlow(supabase);

  if (flowId) {
    const conversations = await seedConversations(supabase, leads, flowId, consultants);
    counts.conversations = conversations.length;

    const messageCount = await seedMessages(supabase, conversations);
    counts.messages = messageCount;
  }

  // Phase 4: Follow-ups & Templates (US4)
  if (await tableExists(supabase, 'follow_ups')) {
    const followUpCount = await seedFollowUps(supabase, leads, consultants);
    counts.followUps = followUpCount;
  } else {
    console.log('📅 Skipping follow-ups — table does not exist');
  }

  if (await tableExists(supabase, 'message_templates')) {
    const templateCount = await seedMessageTemplates(supabase, consultants);
    counts.messageTemplates = templateCount;
  } else {
    console.log('📄 Skipping message templates — table does not exist');
  }

  // Summary
  const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
  console.log('');
  console.log(`✅ Seed completed in ${elapsed}s`);
  console.log(
    `   ${counts.authUsers} auth users | ${counts.consultants} consultants | ${counts.leads} leads | ${counts.conversations} conversations | ${counts.messages} messages | ${counts.followUps} follow-ups | ${counts.messageTemplates} templates`
  );
}

// Run only when executed directly (not when imported for tests)
const isDirectExecution = typeof process !== 'undefined'
  && process.argv[1]
  && (process.argv[1].includes('seed-diagnostic') || process.argv[1].includes('tsx'));

if (isDirectExecution) {
  main().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
}
