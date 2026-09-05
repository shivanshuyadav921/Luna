import { createClient } from '@/lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * OAuth & Email Confirmation Callback Route.
 *
 * Flow:
 *  1. Handles email verification links (token_hash & type) via verifyOtp().
 *  2. Handles OAuth PKCE code exchange (code) via exchangeCodeForSession().
 *  3. Resolves the redirect base safely behind Vercel edge reverse proxies.
 *  4. Checks onboarding status: new users -> /onboarding | returning users -> /home.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') ?? '/home';
  const oauthError = requestUrl.searchParams.get('error');
  const oauthErrorDescription = requestUrl.searchParams.get('error_description');

  // Compute safe redirect base URL for Vercel production vs local dev
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocal = process.env.NODE_ENV === 'development';
  const redirectBase = !isLocal && forwardedHost ? `https://${forwardedHost}` : requestUrl.origin;

  // Handle provider-level OAuth errors (e.g., user cancelled Google consent)
  if (oauthError) {
    console.error('[Luna] OAuth callback error:', oauthError, oauthErrorDescription);
    const loginUrl = new URL('/login', redirectBase);
    loginUrl.searchParams.set(
      'error',
      oauthErrorDescription ?? oauthError ?? 'Authentication was cancelled.'
    );
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();

  // Case 1: Email confirmation / magic link flow (token_hash & type)
  if (token_hash && type) {
    const { error: otpError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (otpError) {
      console.error('[Luna] Email OTP verification error:', otpError.message);
      const loginUrl = new URL('/login', redirectBase);
      loginUrl.searchParams.set(
        'error',
        'Email confirmation link expired or invalid. Please request a new link.'
      );
      return NextResponse.redirect(loginUrl);
    }
  }
  // Case 2: OAuth PKCE flow (authorization code)
  else if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[Luna] Code exchange error:', exchangeError.message);
      const loginUrl = new URL('/login', redirectBase);
      loginUrl.searchParams.set('error', 'Sign-in verification failed. Please try again.');
      return NextResponse.redirect(loginUrl);
    }
  }
  // Case 3: Direct visit to /callback without auth parameters
  else {
    return NextResponse.redirect(new URL('/login', redirectBase));
  }

  // Successfully authenticated or verified — determine destination
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', redirectBase));
  }

  // Check whether the user has completed cat onboarding
  const { data: cats } = await supabase
    .from('cats')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);

  const hasCompletedOnboarding = cats && cats.length > 0;

  if (hasCompletedOnboarding) {
    // Returning user — honor next param if safe
    const safeNext = next.startsWith('/') ? next : '/home';
    return NextResponse.redirect(new URL(safeNext, redirectBase));
  }

  // New user — send to onboarding to set up cat profile
  return NextResponse.redirect(new URL('/onboarding', redirectBase));
}
