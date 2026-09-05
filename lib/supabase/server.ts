import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Uses the Next.js cookie store for session management.
 *
 * Throws a clear error if environment variables are not configured.
 * App routes inside (app)/ are protected by proxy.ts which handles env-var
 * errors gracefully (returns user: null). Only public pages need to guard
 * against this — use createClientSafe() for those.
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[Luna] Missing Supabase environment variables.\n' +
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.\n' +
      'In Vercel: Dashboard → Project → Settings → Environment Variables.'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Cookie writes from Server Components are no-ops by design.
          // The proxy (proxy.ts) handles cookie refresh for all requests.
        }
      },
    },
  });
}

/**
 * Safe version of createClient() for public pages (e.g. landing page, marketing pages).
 * Returns null if environment variables are not configured instead of throwing.
 * Callers should handle null by treating the user as unauthenticated.
 */
export async function createClientSafe() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[Luna] CRITICAL: Supabase environment variables are not configured.\n' +
      'Add to Vercel → Project → Settings → Environment Variables:\n' +
      '  NEXT_PUBLIC_SUPABASE_URL\n' +
      '  NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
      '  SUPABASE_SERVICE_ROLE_KEY\n' +
      'Get values from: https://app.supabase.com → your project → Settings → API'
    );
    return null;
  }

  try {
    return await createClient();
  } catch (error) {
    console.error('[Luna] Failed to create safe Supabase client:', error);
    return null;
  }
}
