import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://ydhintxownxxhbswybba.supabase.co';

/**
 * Creates a Supabase client using the SERVICE ROLE KEY.
 * This client bypasses Row Level Security (RLS) and should ONLY be used
 * in trusted server-side code (API routes). NEVER expose this client
 * or the service role key to the browser.
 */
export function createServiceRoleClient(): SupabaseClient | null {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    serviceRoleKey === 'your-service-role-key-keep-private' ||
    serviceRoleKey.trim() === ''
  ) {
    console.error(
      '[UniMate] SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Please add your real service role key to .env.local ' +
      '(Supabase Dashboard → Settings → API → service_role).'
    );
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
