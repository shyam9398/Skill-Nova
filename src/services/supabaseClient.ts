import { createClient } from '@supabase/supabase-js';

// Read Vite environment variables
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ktjnzjhypwwtpciikwnf.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7T7cwx413smVojHmlkzBkQ_JVfM7FvD';

// Live Supabase check
export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey &&
  supabaseUrl !== 'https://demo-skillnova.supabase.co'
);

// Single reusable singleton Supabase Client instance with robust session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'skillnova_supabase_auth_token'
  }
});

export default supabase;
