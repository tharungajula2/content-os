import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton to ensure we don't recreate the client unnecessarily
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Returns a typed Supabase client for use in Client Components.
 * Handles build-time environments where env vars might be missing.
 */
export const supabase = (function() {
  if (supabaseInstance) return supabaseInstance;

  // Build-time safety: If we are on the server and env vars are missing, 
  // provide a dummy client to satisfy the Next.js static generation step.
  const isBuildTime = typeof window === 'undefined' && (!supabaseUrl || !supabaseAnonKey);

  if (isBuildTime) {
    return createBrowserClient<Database>(
      'https://placeholder.supabase.co', 
      'placeholder-key'
    );
  }

  // Runtime: Ensure we have the required credentials
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.error('Supabase credentials missing! Check your environment variables.');
    }
  }

  supabaseInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
})();
