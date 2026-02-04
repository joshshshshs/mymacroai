import { AppState } from 'react-native';
// URL polyfill is loaded in index.ts via polyfills.ts - do not import again here
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate required environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let _supabase: SupabaseClient | null = null;
let _configured = false;

if (supabaseUrl && supabaseKey) {
  _supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  _configured = true;

  // App State Listener (Refresh auth on app resume)
  AppState.addEventListener('change', (state) => {
    if (_supabase) {
      if (state === 'active') {
        _supabase.auth.startAutoRefresh();
      } else {
        _supabase.auth.stopAutoRefresh();
      }
    }
  });
} else {
  console.warn(
    '[Supabase] Missing configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'
  );
}

/**
 * Get the Supabase client. Throws if not configured.
 * Use this in services that require Supabase to be available.
 */
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    throw new Error(
      'Supabase not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'
    );
  }
  return _supabase;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return _configured;
}

/**
 * Legacy export - may be null if not configured
 * @deprecated Use getSupabase() instead for type-safe access
 */
export const supabase = _supabase;
