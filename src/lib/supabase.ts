// // src/lib/supabase.ts
// import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import { logger } from './logger';

// // Environment variables
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// // Debug environment variables
// logger.debug('Supabase Environment Variables', {
//   supabaseUrl: supabaseUrl ? 'Defined' : 'Undefined',
//   supabaseAnonKey: supabaseAnonKey ? 'Defined' : 'Undefined',
//   supabaseServiceKey: supabaseServiceKey ? 'Defined' : 'Undefined',
//   isClient: typeof window !== 'undefined',
// });

// // Validate required variables
// if (!supabaseUrl) {
//   logger.error('NEXT_PUBLIC_SUPABASE_URL must be defined');
//   throw new Error('NEXT_PUBLIC_SUPABASE_URL must be defined');
// }
// if (!supabaseAnonKey) {
//   logger.error('SUPABASE_ANON_KEY must be defined');
//   throw new Error('SUPABASE_ANON_KEY must be defined');
// }
// if (!supabaseServiceKey) {
//   logger.error('SUPABASE_SERVICE_ROLE_KEY must be defined');
//   throw new Error('SUPABASE_SERVICE_ROLE_KEY must be defined');
// }

// // Public client for client-side use
// export const supabase: SupabaseClient = createClient(
//   supabaseUrl,
//   supabaseAnonKey,
//   {
//     auth: { autoRefreshToken: true, persistSession: true },
//   },
// );

// // Admin client for server-side use
// export const supabaseAdmin: SupabaseClient = createClient(
//   supabaseUrl,
//   supabaseServiceKey,
//   {
//     auth: { autoRefreshToken: false, persistSession: false },
//   },
// );
// // src/lib/supabase.ts

// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Test logger functionality
logger.info('Initializing Supabase clients');

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
    throw new Error('SUPABASE_ANON_KEY must be defined');
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
