// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug environment variables
logger.debug('Supabase Environment Variables', {
  supabaseUrl: supabaseUrl ? 'Defined' : 'Undefined',
  supabaseAnonKey: supabaseAnonKey ? 'Defined' : 'Undefined',
  supabaseServiceKey: supabaseServiceKey ? 'Defined' : 'Undefined',
  isClient: typeof window !== 'undefined',
});

// Validate required variables
if (!supabaseUrl) {
  logger.error('NEXT_PUBLIC_SUPABASE_URL must be defined');
  throw new Error('NEXT_PUBLIC_SUPABASE_URL must be defined');
}
if (!supabaseAnonKey) {
  logger.error('SUPABASE_ANON_KEY must be defined');
  throw new Error('SUPABASE_ANON_KEY must be defined');
}
if (!supabaseServiceKey) {
  logger.error('SUPABASE_SERVICE_ROLE_KEY must be defined');
  throw new Error('SUPABASE_SERVICE_ROLE_KEY must be defined');
}

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
