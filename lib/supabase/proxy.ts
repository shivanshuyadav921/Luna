import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Updates the Supabase session cookie from the proxy (middleware).
 * Returns the refreshed response and the current user (or null if unauthenticated).
 *
 * IMPORTANT: This is the only place that can both READ and WRITE cookies in
 * the proxy context. The cookie writes must be applied to `supabaseResponse`
 * before returning — never create a second `NextResponse.next()` inside setAll.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[Luna] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. ' +
      'Add these to your Vercel environment variables.'
    );
    return { response: supabaseResponse, user: null };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Step 1: Apply cookies to the request (for upstream consumers)
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        // Step 2: Create a new response that carries the updated request cookies
        supabaseResponse = NextResponse.next({ request });
        // Step 3: Apply cookies to the response so the browser receives Set-Cookie
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not remove — getUser() refreshes the session token.
  // The token refresh causes setAll to be called above, which is what
  // propagates the fresh session cookie back to the browser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}
