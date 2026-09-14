import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

const FALLBACK_SUPABASE_URL = 'https://ydhintxownxxhbswybba.supabase.co';
const FALLBACK_SUPABASE_KEY = 'sb_publishable_J7hxelSf_kt3ZQEbH0r0Vw_4ZZCRpCC';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_KEY;

  return (
    Boolean(url && key) &&
    !url.includes('your-project-id') &&
    !key.includes('your-anon-key')
  );
}

export function createClient(): SupabaseClient | null {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
    return null;
  }

  cachedClient = createBrowserClient(supabaseUrl, supabaseKey);
  return cachedClient;
}

export function getSupabase(): SupabaseClient | null {
  return createClient();
}
