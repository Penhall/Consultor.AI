import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/auth/signout
 *
 * Server-side logout: invalidates the session and clears the auth cookie
 * via Set-Cookie headers before redirecting to login.
 *
 * Must be a full-page navigation (window.location.href), not client-side
 * router.push, so the browser receives and applies the Set-Cookie response.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Use the Host header so the redirect goes to the browser-accessible address,
  // not the Docker-internal address (0.0.0.0) that request.url would resolve to.
  const host = request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  return NextResponse.redirect(`${proto}://${host}/auth/login`);
}
