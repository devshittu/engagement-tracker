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
if (!supabaseServiceKey)
  throw new Error('SUPABASE_SERVICE_ROLE_KEY must be defined'); // Enforce this

// Public client for client-side use
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: { autoRefreshToken: true, persistSession: true },
  },
);

// Admin client for server-side use
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  },
);
// src/lib/supabase.ts
