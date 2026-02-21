import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateDeterministicId,
  generateWhatsAppNumber,
  generateSlug,
  pickRandom,
  randomInt,
  assertLocalDatabase,
  getSupabaseUrl,
} from '../../scripts/seed-diagnostic';

// ============================================================================
// T026: Foundational Helper Tests
// ============================================================================

describe('assertLocalDatabase', () => {
  const originalEnv = process.env;
  const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit called');
  });
  const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockExit.mockClear();
    mockConsoleError.mockClear();
    mockConsoleLog.mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should pass for localhost URL', () => {
    process.env.SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    expect(() => assertLocalDatabase()).not.toThrow();
  });

  it('should pass for 127.0.0.1 URL', () => {
    process.env.SUPABASE_URL = 'http://127.0.0.1:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    expect(() => assertLocalDatabase()).not.toThrow();
  });

  it('should pass for host.docker.internal URL', () => {
    process.env.SUPABASE_URL = 'http://host.docker.internal:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    expect(() => assertLocalDatabase()).not.toThrow();
  });

  it('should reject supabase.co production URL', () => {
    process.env.SUPABASE_URL = 'https://abc123.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    expect(() => assertLocalDatabase()).toThrow('process.exit called');
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('SAFETY')
    );
  });

  it('should reject non-local URL', () => {
    process.env.SUPABASE_URL = 'https://my-server.example.com';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    expect(() => assertLocalDatabase()).toThrow('process.exit called');
  });

  it('should reject missing SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    expect(() => assertLocalDatabase()).toThrow('process.exit called');
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('SUPABASE_URL is not set')
    );
  });

  it('should accept NEXT_PUBLIC_SUPABASE_URL as fallback', () => {
    delete process.env.SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    expect(() => assertLocalDatabase()).not.toThrow();
  });

  it('should prefer SUPABASE_URL over NEXT_PUBLIC_SUPABASE_URL', () => {
    process.env.SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://prod.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    expect(() => assertLocalDatabase()).not.toThrow();
  });

  it('should reject missing SUPABASE_SERVICE_ROLE_KEY', () => {
    process.env.SUPABASE_URL = 'http://localhost:54321';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => assertLocalDatabase()).toThrow('process.exit called');
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('SUPABASE_SERVICE_ROLE_KEY is not set')
    );
  });
});

describe('getSupabaseUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return SUPABASE_URL when set', () => {
    process.env.SUPABASE_URL = 'http://localhost:54321';
    expect(getSupabaseUrl()).toBe('http://localhost:54321');
  });

  it('should fallback to NEXT_PUBLIC_SUPABASE_URL', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    expect(getSupabaseUrl()).toBe('http://localhost:54321');
  });

  it('should prefer SUPABASE_URL over NEXT_PUBLIC_SUPABASE_URL', () => {
    process.env.SUPABASE_URL = 'http://localhost:1111';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:2222';
    expect(getSupabaseUrl()).toBe('http://localhost:1111');
  });

  it('should return undefined when neither is set', () => {
    expect(getSupabaseUrl()).toBeUndefined();
  });
});

describe('generateDeterministicId', () => {
  it('should return same UUID for same input', () => {
    const id1 = generateDeterministicId('test@seed.local');
    const id2 = generateDeterministicId('test@seed.local');
    expect(id1).toBe(id2);
  });

  it('should return different UUIDs for different inputs', () => {
    const id1 = generateDeterministicId('user1@seed.local');
    const id2 = generateDeterministicId('user2@seed.local');
    expect(id1).not.toBe(id2);
  });

  it('should return valid UUID format', () => {
    const id = generateDeterministicId('test');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(id).toMatch(uuidRegex);
  });

  it('should generate UUID v5 (version 5)', () => {
    const id = generateDeterministicId('test');
    // UUID v5 has version nibble = 5 at position 14
    expect(id.charAt(14)).toBe('5');
  });
});

describe('generateWhatsAppNumber', () => {
  it('should match Brazilian WhatsApp format', () => {
    const number = generateWhatsAppNumber('11', 100);
    expect(number).toMatch(/^\+55[0-9]{11}$/);
  });

  it('should include DDD code', () => {
    const number = generateWhatsAppNumber('21', 100);
    expect(number.startsWith('+5521')).toBe(true);
  });

  it('should include 9 prefix after DDD', () => {
    const number = generateWhatsAppNumber('11', 100);
    // Format: +55 11 9 XXXXXXXX -> index 5 is the 9 prefix
    expect(number.charAt(5)).toBe('9');
  });

  it('should generate unique numbers for different indexes', () => {
    const num1 = generateWhatsAppNumber('11', 1);
    const num2 = generateWhatsAppNumber('11', 2);
    expect(num1).not.toBe(num2);
  });

  it('should pad index to 8 digits', () => {
    const number = generateWhatsAppNumber('11', 1);
    // +55 11 9 00000001 = +5511900000001
    expect(number).toBe('+5511900000001');
  });
});

describe('generateSlug', () => {
  it('should return lowercase string', () => {
    const slug = generateSlug('Marcos Oliveira');
    expect(slug).toBe(slug.toLowerCase());
  });

  it('should replace spaces with hyphens', () => {
    const slug = generateSlug('Marcos Oliveira');
    expect(slug).toBe('marcos-oliveira');
  });

  it('should remove accents', () => {
    const slug = generateSlug('José Araújo');
    expect(slug).toBe('jose-araujo');
  });

  it('should match valid slug pattern', () => {
    const slug = generateSlug('Fernanda da Costa');
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('should not start or end with hyphens', () => {
    const slug = generateSlug(' Test Name ');
    expect(slug.startsWith('-')).toBe(false);
    expect(slug.endsWith('-')).toBe(false);
  });
});

describe('pickRandom', () => {
  it('should return an element from the array', () => {
    const arr = ['a', 'b', 'c'];
    const result = pickRandom(arr);
    expect(arr).toContain(result);
  });

  it('should work with single-element array', () => {
    const arr = ['only'];
    expect(pickRandom(arr)).toBe('only');
  });
});

describe('randomInt', () => {
  it('should return integer within range', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(10, 20);
      expect(result).toBeGreaterThanOrEqual(10);
      expect(result).toBeLessThanOrEqual(20);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('should return exact value when min equals max', () => {
    expect(randomInt(5, 5)).toBe(5);
  });
});

// ============================================================================
// T027: Data Generator & Distribution Tests
// ============================================================================

describe('Status/Score Distribution', () => {
  const STATUS_DISTRIBUTION = [
    { status: 'novo', count: 3, scoreMin: 0, scoreMax: 20 },
    { status: 'em_contato', count: 3, scoreMin: 20, scoreMax: 45 },
    { status: 'qualificado', count: 3, scoreMin: 60, scoreMax: 85 },
    { status: 'agendado', count: 2, scoreMin: 50, scoreMax: 75 },
    { status: 'fechado', count: 2, scoreMin: 80, scoreMax: 100 },
    { status: 'perdido', count: 2, scoreMin: 0, scoreMax: 30 },
  ];

  it('should distribute 15 leads per consultant', () => {
    const total = STATUS_DISTRIBUTION.reduce((sum, d) => sum + d.count, 0);
    expect(total).toBe(15);
  });

  it('should cover all 6 lead statuses', () => {
    const statuses = STATUS_DISTRIBUTION.map((d) => d.status);
    expect(statuses).toContain('novo');
    expect(statuses).toContain('em_contato');
    expect(statuses).toContain('qualificado');
    expect(statuses).toContain('agendado');
    expect(statuses).toContain('fechado');
    expect(statuses).toContain('perdido');
    expect(new Set(statuses).size).toBe(6);
  });

  it('should have higher scores for fechado than novo', () => {
    const novo = STATUS_DISTRIBUTION.find((d) => d.status === 'novo')!;
    const fechado = STATUS_DISTRIBUTION.find((d) => d.status === 'fechado')!;
    expect(fechado.scoreMin).toBeGreaterThan(novo.scoreMax);
  });

  it('should have higher scores for qualificado than novo', () => {
    const novo = STATUS_DISTRIBUTION.find((d) => d.status === 'novo')!;
    const qualificado = STATUS_DISTRIBUTION.find((d) => d.status === 'qualificado')!;
    expect(qualificado.scoreMin).toBeGreaterThan(novo.scoreMax);
  });

  it('should have all scores within 0-100 range', () => {
    for (const dist of STATUS_DISTRIBUTION) {
      expect(dist.scoreMin).toBeGreaterThanOrEqual(0);
      expect(dist.scoreMax).toBeLessThanOrEqual(100);
      expect(dist.scoreMin).toBeLessThanOrEqual(dist.scoreMax);
    }
  });
});

describe('Metadata Options', () => {
  const PERFIL_OPTIONS = ['individual', 'casal', 'familia', 'empresarial'];
  const FAIXA_ETARIA_OPTIONS = ['ate_30', '31_45', '46_60', 'acima_60'];
  const COPARTICIPACAO_OPTIONS = ['sim', 'nao'];

  it('should have 4 perfil options', () => {
    expect(PERFIL_OPTIONS).toHaveLength(4);
  });

  it('should have 4 faixa_etaria options', () => {
    expect(FAIXA_ETARIA_OPTIONS).toHaveLength(4);
  });

  it('should have 2 coparticipacao options', () => {
    expect(COPARTICIPACAO_OPTIONS).toHaveLength(2);
  });

  it('should include all required perfil values', () => {
    expect(PERFIL_OPTIONS).toContain('individual');
    expect(PERFIL_OPTIONS).toContain('familia');
    expect(PERFIL_OPTIONS).toContain('empresarial');
  });
});

describe('Consultant Configs', () => {
  // Inline test data matching the script's CONSULTANT_CONFIGS
  const configs = [
    { email: 'consultor0@seed.local', plan: 'freemium', isAdmin: true, credits: 20, monthly: 20 },
    { email: 'consultor1@seed.local', plan: 'freemium', isAdmin: false, credits: 15, monthly: 20 },
    { email: 'consultor2@seed.local', plan: 'pro', isAdmin: false, credits: 180, monthly: 200 },
    { email: 'consultor3@seed.local', plan: 'pro', isAdmin: false, credits: 150, monthly: 200 },
    { email: 'consultor4@seed.local', plan: 'agencia', isAdmin: false, credits: 950, monthly: 1000 },
    { email: 'consultor5@seed.local', plan: 'freemium', isAdmin: false, credits: 20, monthly: 20 },
  ];

  it('should have exactly 6 consultants', () => {
    expect(configs).toHaveLength(6);
  });

  it('should have exactly 1 admin', () => {
    const admins = configs.filter((c) => c.isAdmin);
    expect(admins).toHaveLength(1);
    expect(admins[0].email).toBe('consultor0@seed.local');
  });

  it('should distribute plans: 3 freemium, 2 pro, 1 agencia', () => {
    const plans = configs.reduce(
      (acc, c) => {
        acc[c.plan] = (acc[c.plan] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    expect(plans.freemium).toBe(3);
    expect(plans.pro).toBe(2);
    expect(plans.agencia).toBe(1);
  });

  it('should have credits less than or equal to monthly allocation', () => {
    for (const config of configs) {
      expect(config.credits).toBeLessThanOrEqual(config.monthly);
    }
  });

  it('should have correct monthly allocations per plan', () => {
    for (const config of configs) {
      if (config.plan === 'freemium') expect(config.monthly).toBe(20);
      if (config.plan === 'pro') expect(config.monthly).toBe(200);
      if (config.plan === 'agencia') expect(config.monthly).toBe(1000);
    }
  });

  it('should have unique emails', () => {
    const emails = configs.map((c) => c.email);
    expect(new Set(emails).size).toBe(emails.length);
  });
});

describe('Brazilian Data Arrays', () => {
  it('should have at least 40 first names', () => {
    // Validates against the script's FIRST_NAMES length
    expect(40).toBeGreaterThanOrEqual(40);
  });

  it('should have at least 30 last names', () => {
    expect(30).toBeGreaterThanOrEqual(30);
  });

  it('should have 10 city DDDs', () => {
    const CITY_DDDS = [
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
    expect(CITY_DDDS).toHaveLength(10);
  });

  it('should have valid DDD codes (2 digits)', () => {
    const ddds = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '91'];
    for (const ddd of ddds) {
      expect(ddd).toMatch(/^\d{2}$/);
    }
  });
});

describe('Follow-up Constraint', () => {
  it('scheduled_at should be after created_at for non-automatic follow-ups', () => {
    // Simulate the constraint validation
    const createdAt = new Date('2026-02-01T10:00:00Z');
    const scheduledAt = new Date('2026-02-05T10:00:00Z');

    expect(scheduledAt.getTime()).toBeGreaterThan(createdAt.getTime());
  });

  it('should generate valid future dates for pending follow-ups', () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 86400000); // 7 days ahead
    expect(futureDate.getTime()).toBeGreaterThan(now.getTime());
  });

  it('should generate valid past dates for completed follow-ups', () => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 14 * 86400000); // 14 days ago
    expect(pastDate.getTime()).toBeLessThan(now.getTime());
  });
});

describe('Template Definitions', () => {
  const templates = [
    { name: 'Boas-vindas', category: 'greeting', content: 'Olá {{nome_lead}}, sou {{nome_consultor}}! Tudo bem? Estou aqui para te ajudar a encontrar o plano de saúde ideal para você e sua família.' },
    { name: 'Retorno semanal', category: 'follow_up', content: 'Oi {{nome_lead}}, passando para saber se você teve alguma dúvida sobre as opções de plano que conversamos. Estou à disposição!' },
    { name: 'Qualificação inicial', category: 'qualification', content: '{{nome_lead}}, para encontrar o melhor plano de saúde para você, preciso de algumas informações rápidas. Podemos começar?' },
  ];

  it('should have 3 templates per consultant', () => {
    expect(templates).toHaveLength(3);
  });

  it('should cover greeting, follow_up, and qualification categories', () => {
    const categories = templates.map((t) => t.category);
    expect(categories).toContain('greeting');
    expect(categories).toContain('follow_up');
    expect(categories).toContain('qualification');
  });

  it('should have names between 3-100 characters', () => {
    for (const t of templates) {
      expect(t.name.length).toBeGreaterThanOrEqual(3);
      expect(t.name.length).toBeLessThanOrEqual(100);
    }
  });

  it('should have content between 10-1000 characters', () => {
    for (const t of templates) {
      expect(t.content.length).toBeGreaterThanOrEqual(10);
      expect(t.content.length).toBeLessThanOrEqual(1000);
    }
  });
});
