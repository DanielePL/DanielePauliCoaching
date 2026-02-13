import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      const url = import.meta.env.PUBLIC_SUPABASE_URL || '';
      const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
      if (!url || !key) {
        console.warn('Supabase not configured. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.');
        // Return a no-op client that won't crash
        _supabase = createClient('https://placeholder.supabase.co', 'placeholder');
      } else {
        _supabase = createClient(url, key);
      }
    }
    const value = (_supabase as any)[prop];
    if (typeof value === 'function') {
      return value.bind(_supabase);
    }
    return value;
  },
});
