import { createClient } from '@supabase/supabase-js';

/**
 * Service Role Admin Client
 * Bypasses RLS — use ONLY for server-side administrative operations
 * (e.g., account deletion, admin moderation).
 * Never expose this client to the browser or client components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      '[Luna] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'This is required for admin operations (e.g., account deletion).'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
