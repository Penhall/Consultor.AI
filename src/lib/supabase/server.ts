/**
 * Supabase Client for Server
 * Creates clients for Server Components, API Routes, and Server Actions
 *
 * Uses SUPABASE_URL for server-side requests (Docker internal network)
 * Falls back to NEXT_PUBLIC_SUPABASE_URL for local development
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// Server-side URL: prefer internal Docker URL, fallback to public URL
const getSupabaseUrl = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    getSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
