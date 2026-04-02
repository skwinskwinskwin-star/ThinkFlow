
import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase connection
// In Vite, we use import.meta.env.VITE_...
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yssiojvbdhxrezvaepsz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_tAtIFAhlY2MmIom4j2R3NA_EHjCvp5Q';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Using default values from prompt.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for client-side usage (similar to the user's prompt)
export const createSupabaseClient = () => createClient(supabaseUrl, supabaseAnonKey);

export type SupabaseErrorInfo = {
  error: string;
  operationType: string;
  path: string | null;
};

export function handleSupabaseError(error: unknown, operationType: string, path: string | null) {
  const errInfo: SupabaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
