import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://ydhintxownxxhbswybba.supabase.co';
const FALLBACK_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaGludHhvd254eGhic3d5YmJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTMxMzM2NywiZXhwIjoyMTA0ODg5MzY3fQ.GXwWT9f9VXoEAkx8mmdLVxra7PVHdOjBVdJLG0M7vzQ';

/**
 * Creates a Supabase client using the SERVICE ROLE KEY.
 * This client bypasses Row Level Security (RLS) and should ONLY be used
 * in trusted server-side code (API routes). NEVER expose this client
 * or the service role key to the browser.
 */
export function createServiceRoleClient(): SupabaseClient | null {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !serviceRoleKey ||
    serviceRoleKey === 'your-service-role-key-keep-private' ||
    serviceRoleKey.trim() === ''
  ) {
    serviceRoleKey = FALLBACK_SERVICE_ROLE_KEY;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
