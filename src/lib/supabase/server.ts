/**
 * Supabase Client for Server
 * Creates clients for Server Components, API Routes, and Server Actions
 *
 * Uses SUPABASE_URL for server-side requests (Docker internal network)
 * Falls back to NEXT_PUBLIC_SUPABASE_URL for local development
 *
 * NOTE: cookieOptions.name must match the browser client so the middleware
 * can find the auth cookie regardless of which Supabase URL each client uses.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// Server-side URL: prefer internal Docker URL, fallback to public URL
const getSupabaseUrl = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Fixed cookie name shared between browser and server clients.
// Without this, each client derives the name from its own URL, causing a
// mismatch in Docker (browser uses 127.0.0.1:54321, server uses kong:8000).
const COOKIE_NAME = 'sb-consultorai-auth-token';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    getSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: COOKIE_NAME },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a service role client with elevated permissions
 * USE WITH CAUTION - bypasses RLS policies
 */
export function createServiceClient() {
  return createServerClient<Database>(getSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookieOptions: { name: COOKIE_NAME },
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No-op for service role
      },
    },
  });
}
