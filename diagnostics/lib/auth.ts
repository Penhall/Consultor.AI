/**
 * Supabase Authentication Helper for Diagnostic Crawler
 *
 * Authenticates via GoTrue REST API and formats session cookies
 * for Next.js middleware compatibility.
 */

import type { AuthSession, SeedIds } from './types';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

/** Seed credentials */
export const SEED_CREDENTIALS = {
  admin: { email: 'consultor0@seed.local', password: 'seed123456', role: 'admin' },
  consultant: { email: 'consultor1@seed.local', password: 'seed123456', role: 'consultant' },
} as const;

/**
 * Authenticate via Supabase GoTrue REST API
 */
export async function authenticate(
  email: string,
  password: string,
  role: string
): Promise<AuthSession> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Authentication failed for ${email}: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const accessToken: string = data.access_token;
  const refreshToken: string = data.refresh_token;
  const expiresAt: number = data.expires_at;

  // Format Supabase SSR session cookie
  // The cookie name uses the project ref derived from the URL
  const cookieValue = Buffer.from(
    JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      expires_in: data.expires_in,
      token_type: 'bearer',
    })
  ).toString('base64');

  // Supabase SSR uses sb-<ref>-auth-token cookie name
  // For local Docker, the ref is typically derived from the project URL
  // The cookie might be chunked for large tokens
  const cookieName = 'sb-127-auth-token';
  const cookieHeader = `${cookieName}=${cookieValue}`;

  return {
    role,
    email,
    accessToken,
    refreshToken,
    cookieHeader,
  };
}

/**
 * Resolve seed data IDs by querying Supabase REST API with service_role key
 */
export async function resolveSeedIds(): Promise<SeedIds> {
  const seedIds: SeedIds = {
    leadId: null,
    flowId: null,
    conversationId: null,
    consultantId: null,
    fileId: null,
    crmIntegrationId: null,
    followUpId: null,
    templateId: null,
  };

  const queries: Array<{
    table: string;
    field: keyof SeedIds;
  }> = [
    { table: 'leads', field: 'leadId' },
    { table: 'flows', field: 'flowId' },
    { table: 'conversations', field: 'conversationId' },
    { table: 'consultants', field: 'consultantId' },
    { table: 'files', field: 'fileId' },
    { table: 'crm_integrations', field: 'crmIntegrationId' },
    { table: 'follow_ups', field: 'followUpId' },
    { table: 'message_templates', field: 'templateId' },
  ];

  await Promise.all(
    queries.map(async ({ table, field }) => {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
        });

        if (response.ok) {
          const rows = await response.json();
          if (Array.isArray(rows) && rows.length > 0) {
            seedIds[field] = rows[0].id;
          }
        }
      } catch {
        // Entity table may not exist or be empty - that's fine
      }
    })
  );

  return seedIds;
}

/**
 * Preflight health check - verify Docker environment is accessible
 */
export async function preflightCheck(appUrl: string): Promise<void> {
  try {
    const response = await fetch(`${appUrl}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`Health check returned ${response.status}`);
    }
  } catch (error) {
    throw new Error(
      `Preflight check failed: Cannot connect to ${appUrl}/api/health\n` +
        `  Ensure Docker environment is running: docker-compose -f docker-compose.full.yml up -d\n` +
        `  Original error: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Also check Supabase Auth
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: ANON_KEY },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`Auth health check returned ${response.status}`);
    }
  } catch (error) {
    throw new Error(
      `Preflight check failed: Supabase Auth not accessible at ${SUPABASE_URL}\n` +
        `  Original error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
