// src/lib/logger.ts
const isDev = process.env.NODE_ENV !== 'production';

// export const logger = {
//   info: (...args: any[]) => isDev && console.log('[INFO]', ...args),
//   warn: (...args: any[]) => isDev && console.warn('[WARN]', ...args),
//   error: (...args: any[]) => console.error('[ERROR]', ...args),
//   debug: (...args: any[]) => isDev && console.debug('[DEBUG]', ...args),
// };

// Determine if debug logs should be enabled
const enableDebugLogs = process.env.ENABLE_DEBUG_LOGS === 'true' || isDev;

export const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  debug: (...args: any[]) =>
    enableDebugLogs && console.debug('[DEBUG]', ...args),
};

// src/lib/logger.ts
