import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a singleton instance but only if we have credentials
// This prevents the build from failing during static generation
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const supabase = (function() {
  if (supabaseInstance) return supabaseInstance;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, we provide a dummy client to avoid throwing
    // Real runtime will have these variables
    if (typeof window === 'undefined') {
      return createBrowserClient<Database>(
        'https://placeholder.supabase.co', 
        'placeholder-key'
      );
    }
    console.error('Supabase credentials missing!');
  }
  
  supabaseInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
})();
