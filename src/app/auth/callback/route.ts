/**
 * OAuth Callback Route
 *
 * Handles OAuth redirect from Google/GitHub.
 * Exchanges code for session and ensures consultant record exists.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure consultant record exists for OAuth users
      const { data: existing } = await supabase
        .from('consultants')
        .select('id')
        .eq('user_id', data.user.id)
        .single();

      if (!existing) {
        const email = data.user.email || '';
        const name =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          email.split('@')[0] ||
          'User';
        const slug =
          email
            .split('@')[0]
            ?.toLowerCase()
            .replace(/[^a-z0-9]/g, '-') || `user-${Date.now()}`;

        // Check if should be admin
        const adminEmails =
          process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
        const isAdmin = adminEmails.includes(email.toLowerCase());

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const consultantsTable = supabase.from('consultants') as any;
        await consultantsTable.insert({
          user_id: data.user.id,
          email,
          name,
          slug,
          vertical: 'saude',
          subscription_tier: 'freemium',
          subscription_plan: 'freemium',
          monthly_lead_limit: 20,
          credits: 20,
          monthly_credits_allocation: 20,
          purchased_credits: 0,
          is_admin: isAdmin,
        });
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // OAuth error — redirect to login with error
  return NextResponse.redirect(
    `${origin}/auth/login?message=Erro na autenticação. Tente novamente.`
  );
}
