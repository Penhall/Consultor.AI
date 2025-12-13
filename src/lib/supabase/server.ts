import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for use in Server Components, Server Actions, and Route Handlers
 *
 * @example Server Component
 * ```tsx
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function Page() {
 *   const supabase = createClient();
 *   const { data } = await supabase.from('leads').select('*');
 *   return <div>{data?.length} leads</div>;
 * }
 * ```
 *
 * @example Server Action
 * ```tsx
 * 'use server';
 *
 * import { createClient } from '@/lib/supabase/server';
 *
 * export async function createLead(formData: FormData) {
 *   const supabase = createClient();
 *   const { data, error } = await supabase.from('leads').insert({
 *     whatsapp_number: formData.get('whatsapp_number') as string,
 *   });
 *   return { data, error };
 * }
 * ```
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client with service role key for admin operations
 * ⚠️ CAUTION: Only use in secure server-side contexts (Server Actions, API Routes)
 * NEVER expose service role key to the client
 *
 * @example
 * ```tsx
 * import { createAdminClient } from '@/lib/supabase/server';
 *
 * export async function GET() {
 *   const supabase = createAdminClient();
 *   // Can bypass RLS policies
 *   const { data } = await supabase.from('leads').select('*');
 *   return Response.json(data);
 * }
 * ```
 */
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {},
        remove() {},
      },
    }
  );
}
