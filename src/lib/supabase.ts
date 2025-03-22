// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required variables
if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL must be defined');
if (!supabaseAnonKey)
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined');

// Singleton client instances
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: { autoRefreshToken: true, persistSession: true },
  },
);

export const supabaseAdmin: SupabaseClient = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : supabase; // Fallback to public client if no service key

if (!supabaseServiceKey) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY not provided; admin operations will use anon client',
  );
}
// src/lib/supabase.ts
