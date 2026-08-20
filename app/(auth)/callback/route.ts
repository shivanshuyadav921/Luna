import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * OAuth callback route — Supabase (and Google) redirect here after authentication.
 *
 * Flow:
 *  1. Exchange the `code` for a session via Supabase PKCE.
 *  2. Check whether the user already has a cat profile.
 *  3. New users → /onboarding | Returning users → /home (or ?next= param)
 *  4. Auth errors → /login?error=<message>
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/home';
  const oauthError = requestUrl.searchParams.get('error');
  const oauthErrorDescription = requestUrl.searchParams.get('error_description');

  const origin = requestUrl.origin;

  // Handle errors returned directly by the OAuth provider (e.g. user denied consent)
  if (oauthError) {
    console.error('[Luna] OAuth callback error:', oauthError, oauthErrorDescription);
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set(
      'error',
      oauthErrorDescription ?? oauthError ?? 'Authentication was cancelled.'
    );
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    // No code — redirect to login (may happen if user manually visits /callback)
    return NextResponse.redirect(new URL('/login', origin));
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[Luna] Code exchange error:', exchangeError.message);
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'Sign-in failed. Please try again.');
    return NextResponse.redirect(loginUrl);
  }

  // Successfully exchanged code — determine where to redirect the user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', origin));
  }

  // Check whether this user has already completed onboarding (has a cat profile)
  const { data: cats } = await supabase
    .from('cats')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);

  const hasCompletedOnboarding = cats && cats.length > 0;

  if (hasCompletedOnboarding) {
    // Returning user — respect the `next` param (for protected-page redirects)
    const safeNext = next.startsWith('/') ? next : '/home';
    return NextResponse.redirect(new URL(safeNext, origin));
  }

  // New user — must complete onboarding first
  return NextResponse.redirect(new URL('/onboarding', origin));
}
