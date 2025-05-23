// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Test logger functionality
logger.info('Initializing Supabase clients');

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log the actual values (mask the service key for security)
logger.debug('Supabase Environment Variables', {
  supabaseUrl,
  supabaseAnonKey: supabaseAnonKey ? 'Defined' : 'Undefined',
  supabaseServiceKey: supabaseServiceKey
    ? `${supabaseServiceKey.slice(0, 5)}...${supabaseServiceKey.slice(-5)}`
    : 'Undefined',
  isClient: typeof window !== 'undefined',
  nodeEnv: process.env.NODE_ENV,
});

// Validate required variables with fallback
let supabase: SupabaseClient | null = null;
let supabaseAdmin: SupabaseClient | null = null;

try {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be defined');
  }
  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined');
  }
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must be defined');
  }

  // Public client for client-side use
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: true, persistSession: true },
  });

  // Admin client for server-side use
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  logger.info('Supabase clients initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Supabase clients', {
    error: error instanceof Error ? error.message : String(error),
    isClient: typeof window !== 'undefined',
    nodeEnv: process.env.NODE_ENV,
  });
}

export { supabase, supabaseAdmin };
// src/lib/supabase.ts
